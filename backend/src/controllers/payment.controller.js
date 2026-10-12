const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/mongodb/Payment");

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// Create a Razorpay order for the authenticated student.
const createOrder = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const feeRupees = Number(process.env.ADMISSION_FEE_AMOUNT);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    if (!Number.isFinite(feeRupees) || feeRupees <= 0) {
      return res.status(500).json({
        success: false,
        message: "Admission fee is not configured correctly.",
      });
    }

    const amount = Math.round(feeRupees * 100);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(500).json({
        success: false,
        message: "Admission fee amount is invalid.",
      });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `adm_${userId}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`,
      notes: {
        studentUserId: String(userId),
        purpose: "Admission fee",
      },
    });

    await Payment.create({
      userId,
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.id,
      status: "CREATED",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created.",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create payment order failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order. Please try again.",
    });
  }
};

// Verify Razorpay's signature before marking the payment as paid.
const verifyPayment = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body ?? {};

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Required payment verification details are missing.",
      });
    }

    const payment = await Payment.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found for this student.",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Payment verification is not configured.",
      });
    }

    // Verify the signature using the order ID stored for this student.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${payment.razorpayOrderId}|${razorpay_payment_id}`)
      .digest();

    let receivedSignature;

    try {
      receivedSignature = Buffer.from(razorpay_signature, "hex");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Fetch the payment directly from Razorpay to confirm its status
    // and ensure the captured amount and currency match our order.
    const razorpay = getRazorpay();
    const gatewayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      gatewayPayment.order_id !== payment.razorpayOrderId ||
      gatewayPayment.amount !== payment.amount ||
      gatewayPayment.currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the order.",
      });
    }

    if (gatewayPayment.status !== "captured") {
      return res.status(409).json({
        success: false,
        message:
          "Payment has not been captured yet. Please wait and check again.",
      });
    }

    if (payment.status === "PAID") {
      if (payment.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment was already verified.",
          data: { status: "PAID" },
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid using another payment.",
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "PAID";
    payment.paidAt = new Date();

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment verification failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please try again.",
    });
  }
};

// Get payment history for the currently authenticated student.
const getMyPayments = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid student authentication.",
      });
    }

    const payments = await Payment.find({ userId })
      .select(
        "amount currency razorpayOrderId razorpayPaymentId status paidAt createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get student payments failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load payment history.",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyPayments,
};