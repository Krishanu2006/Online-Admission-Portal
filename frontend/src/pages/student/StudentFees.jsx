import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
} from "../../services/payment.api";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(Boolean(window.Razorpay)),
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function formatRupees(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format((Number(paise) || 0) / 100);
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

export default function StudentFees() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyPayments();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || "Unable to load payment history."
        );
      }

      setPayments(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function handlePayment() {
    if (paying) return;

    setPaying(true);
    setError("");
    setMessage("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Check your internet connection."
        );
      }

      const orderResponse = await createPaymentOrder();

      if (!orderResponse?.success || !orderResponse.data?.orderId) {
        throw new Error(
          orderResponse?.message || "Unable to create payment order."
        );
      }

      const order = orderResponse.data;

      if (!order.keyId || !order.amount || !order.currency) {
        throw new Error("The server returned incomplete order details.");
      }

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: "IEM-UEM Admission Portal",
          description: "Admission fee payment",

          handler: async (checkoutResponse) => {
            try {
              const verification = await verifyPayment({
                razorpay_order_id:
                  checkoutResponse.razorpay_order_id,
                razorpay_payment_id:
                  checkoutResponse.razorpay_payment_id,
                razorpay_signature:
                  checkoutResponse.razorpay_signature,
              });

              if (
                !verification?.success ||
                verification.data?.status !== "PAID"
              ) {
                throw new Error(
                  verification?.message ||
                    "The server has not confirmed the payment."
                );
              }

              setMessage("Payment verified successfully.");
              await loadPayments();
              resolve();
            } catch (err) {
              setError(
                "We couldn't confirm the payment with the server. " +
                  "Please refresh payment history before trying again."
              );
              console.error("Payment verification failed:", err);
              await loadPayments();
              reject(err);
            }
          },

          modal: {
            ondismiss: () => {
              setMessage(
                "Checkout was closed. Check payment history before retrying."
              );
              resolve();
            },
          },

          theme: {
            color: "#2563eb",
          },
        });

        checkout.on("payment.failed", (response) => {
          setError(
            response.error?.description ||
              "Payment failed. Check your payment history before retrying."
          );
        });

        checkout.open();
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  const successfulPayment = payments.find(
    (payment) => payment.status === "PAID"
  );

  return (
    <StudentLayout>
      <section className="content">
        <PageHeader
          eyebrow="STUDENT PORTAL"
          title="Fee payment"
          description="Pay your admission fee securely and view your payment history."
        />

        {error && (
          <p role="alert" style={{ color: "#dc2626", marginBottom: 16 }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#15803d", marginBottom: 16 }}>
            {message}
          </p>
        )}

        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Admission fee</h2>
              <p className="muted">
                Secure checkout powered by Razorpay
              </p>
            </div>
            <CreditCard size={28} />
          </div>

          {successfulPayment ? (
            <div>
              <h3 style={{ color: "#15803d" }}>
                Payment completed
              </h3>

              <p>
                Amount paid:{" "}
                <strong>
                  {formatRupees(successfulPayment.amount)}
                </strong>
              </p>

              <p className="muted">
                Payment ID: {successfulPayment.razorpayPaymentId}
              </p>

              <p className="muted">
                Paid on: {formatDate(successfulPayment.paidAt)}
              </p>
            </div>
          ) : (
            <>
              <p>
                Click below to open Razorpay Checkout. The amount is
                determined by the backend.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={handlePayment}
                disabled={paying || loading}
              >
                {paying ? "Processing..." : "Pay admission fee"}
              </button>
            </>
          )}

          <p
            className="muted"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <ShieldCheck size={17} />
            Payment is confirmed only after server-side verification.
          </p>
        </div>

        <div className="card">
          <div className="card-heading">
            <h2>Payment history</h2>

            <button
              type="button"
              className="icon-button"
              onClick={loadPayments}
              disabled={loading || paying}
              title="Refresh payment history"
              aria-label="Refresh payment history"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {loading ? (
            <p>Loading payment history...</p>
          ) : payments.length === 0 ? (
            <p className="muted">No payment records found.</p>
          ) : (
            <div className="document-list">
              {payments.map((payment) => (
                <div
                  className="document-row"
                  key={payment.razorpayOrderId}
                >
                  <div className="file-icon">
                    <CreditCard size={20} />
                  </div>

                  <div className="document-info">
                    <strong>{formatRupees(payment.amount)}</strong>

                    <span>
                      Order: {payment.razorpayOrderId}
                    </span>

                    {payment.razorpayPaymentId && (
                      <span>
                        Payment ID: {payment.razorpayPaymentId}
                      </span>
                    )}

                    <span>Status: {payment.status}</span>

                    <span className="muted">
                      Created: {formatDate(payment.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </StudentLayout>
  );
}