import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import TextField from "../../components/forms/TextField";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
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
      const user = await login(email, password, "ADMIN");

      if (user.role !== "ADMIN") {
        throw new Error("Admin access required");
      }

      navigate("/admin/dashboard");
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
    <div className="auth-page admin-auth">
      <div className="auth-brand">
        <Logo />
      </div>

      <div className="auth-card">
        <div className="eyebrow">ADMINISTRATION</div>

        <h1>Administrator sign in</h1>

        <p className="muted">
          Authorized IEM staff only.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="stack">
          <TextField
            label="Official email"
            type="email"
            placeholder="admin@iem.edu.in"
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
          <Link to="/">Back to admission portal</Link>
        </div>
      </div>
    </div>
  );
}