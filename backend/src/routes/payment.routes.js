const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.use(authenticate);
router.use(authorize("STUDENT"));

router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.get("/my-payments", paymentController.getMyPayments);

module.exports = router;