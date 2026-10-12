const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
    },

    userId: {
      type: Number,
      required: true,
      index: true,
    },

    personalDetails: {
      fullName: {
        type: String,
        trim: true,
      },
      dateOfBirth: {
        type: String,
      },
      gender: {
        type: String,
      },
      category: {
        type: String,
      },
    },

    contactDetails: {
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },

    academicDetails: {
      class10: {
        board: String,
        percentage: Number,
      },
      class12: {
        board: String,
        percentage: Number,
      },
    },

    coursePreferences: [
      {
        courseId: Number,
        preference: Number,
      },
    ],

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
      ],
      default: "DRAFT",
    },

    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", applicationSchema);