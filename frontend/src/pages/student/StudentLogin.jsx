import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import TextField from "../../components/forms/TextField";
import { useAuth } from "../../context/AuthContext";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password, "STUDENT");

      if (user.role !== "STUDENT") {
        throw new Error("Student access required");
      }

      navigate("/student/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        "Login failed"
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

      <div className="auth-card">
        <div className="eyebrow">STUDENT PORTAL</div>

        <h1>Welcome back</h1>

        <p className="muted">
          Sign in to continue your admission application.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="stack">
          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>New applicant?</span>
          <Link to="/student/register">Create an account</Link>
        </div>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="admin-login-section">
          <span className="muted">Are you an administrator?</span>
          <Link to="/admin/login" className="admin-login-link">
            Admin Login
          </Link>
        </div>
        <div className="auth-footer">
          <Link to="/">Back to admission portal</Link>
        </div>
      </div>
    </div>
  );
}