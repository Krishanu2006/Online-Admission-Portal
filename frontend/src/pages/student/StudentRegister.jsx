import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import TextField from "../../components/forms/TextField";
import { registerStudent } from "../../services/auth.api";

export default function StudentRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);

    if (nameParts.length < 2) {
      setError("Please enter your full name");
      return;
    }

    const fname = nameParts[0];
    const lname = nameParts.slice(1).join(" ");

    setLoading(true);

    try {
      await registerStudent({
        fname,
        lname,
        email,
        mobile,
        password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/student/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="auth-card auth-card-wide">
        <div className="eyebrow">NEW APPLICANT</div>

        <h1>Create your account</h1>

        <p className="muted">
          Register before starting your admission application.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <form onSubmit={submit} className="form-grid">
          <TextField
            label="Full name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <TextField
            label="Date of birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />

          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Mobile number"
            placeholder="+91"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <TextField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="form-actions full">
            <button
              type="submit"
              className="button button-primary button-large"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/student/login">Sign in</Link>
        </div>
        <div className="auth-footer">
          <Link to="/">Back to admission portal</Link>
        </div>
      </div>
    </div>
  );
}