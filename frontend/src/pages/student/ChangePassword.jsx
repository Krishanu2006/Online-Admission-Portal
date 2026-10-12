
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePassword() {
  const [form, setForm] = useState(initialForm);

  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleVisibility = (field) => {
    setVisible((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (form.newPassword.length < 12) {
      setMessage(
        "Your new password must contain at least 12 characters."
      );
      setMessageType("error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("The new passwords do not match.");
      setMessageType("error");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setMessage(
        "Your new password must differ from your current password."
      );
      setMessageType("error");
      return;
    }

    if (user?.role !== "STUDENT") {
      setMessage(
        "This feature is available to student accounts only."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm(initialForm);
      setMessage(
        response.data?.message ||
          "Your password has been changed successfully."
      );
      setMessageType("success");

      // Refresh the current user if AuthContext provides this method.
      // A failed profile refresh does not undo a successful password change.
      if (typeof refreshUser === "function") {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.error(
            "Password changed, but refreshing the user session failed:",
            refreshError
          );
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/student/login", { replace: true });
        return;
      }

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to change your password. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "currentPassword",
      label: "Current Password",
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: "New Password",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Student Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Change Password
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Update your password to keep your admission account secure.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0 text-indigo-600"
          />

          <div>
            <h2 className="font-semibold text-gray-900">
              Account security
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Your current password will be verified. Recently used
              passwords cannot be reused.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ name, label, autoComplete }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {label}
              </label>

              <div className="relative">
                <input
                  id={name}
                  name={name}
                  type={visible[name] ? "text" : "password"}
                  autoComplete={autoComplete}
                  value={form[name]}
                  onChange={handleChange}
                  minLength={
                    name !== "currentPassword" ? 12 : undefined
                  }
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => toggleVisibility(name)}
                  aria-label={
                    visible[name] ? `Hide ${label}` : `Show ${label}`
                  }
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                >
                  {visible[name] ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {name === "newPassword" && (
                <p className="mt-2 text-xs text-gray-500">
                  Use at least 12 characters and choose a password
                  you haven't used before.
                </p>
              )}
            </div>
          ))}

          {message && (
            <div
              role={messageType === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`rounded-lg border p-3 text-sm ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />

            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </section>

      <p className="mt-5 text-sm text-gray-500">
        Your password is stored as a secure hash. The application
        does not need to store your new password in plaintext.
      </p>
    </div>
  );
}
