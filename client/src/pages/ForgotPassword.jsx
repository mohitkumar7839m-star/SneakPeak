
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setMessage("");
    setSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.newPassword.length < 8 || formData.newPassword.length > 72) {
      setMessage("Password must be between 8 and 72 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            newPassword: formData.newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setSuccess(true);
      setMessage(data.message || "Password reset successfully.");

      setFormData({
        email: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <p className="auth-eyebrow">A FRESH START</p>

          <h1>
            Your next step. <span>A new beginning.</span>
          </h1>

          <p className="auth-visual-description">
            Get back to discovering sneakers that define your style.
          </p>

          <div className="auth-visual-mark">
            SP<span>.</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-mobile-logo">
            SNEAK<span>PEAK</span>
          </Link>

          <p className="auth-form-eyebrow">ACCOUNT RECOVERY</p>

          <h2>Reset your password.</h2>

          <p className="auth-subtitle">
            Enter your registered email and choose a new password.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="reset-email">Email address</label>

            <input
              id="reset-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              required
            />

            <label htmlFor="reset-password">New password</label>

            <div className="auth-password-field">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="confirm-password">Confirm new password</label>

            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading || success}
            >
              {loading ? "Resetting..." : "Reset Password"}
              <span>→</span>
            </button>

            {message && (
              <p
                className="auth-message"
                role="status"
                style={success ? { color: "#9be564" } : undefined}
              >
                {message}
              </p>
            )}
          </form>

          <p className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
