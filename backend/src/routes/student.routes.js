const express = require("express");

const studentController = require("../controllers/student.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


const router = express.Router();

router.use(authenticate);
router.use(authorize("STUDENT"));

router.get("/profile", studentController.getProfile);
router.put("/profile", studentController.updateProfile);
router.get("/status", studentController.getApplicationStatus);

module.exports = router;