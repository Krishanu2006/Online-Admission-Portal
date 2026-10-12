import { useCallback, useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import TextField from "../../components/forms/TextField";
import { getStudentProfile, updateStudentProfile } from "../../services/student.api";

const initialForm = {
  fname: "",
  lname: "",
  email: "",
  mobile: "",
};

export default function StudentProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getStudentProfile();
      const profile = response?.data;

      if (!profile) {
        throw new Error("The server did not return profile data.");
      }

      setForm({
        fname: profile.fname ?? "",
        lname: profile.lname ?? "",
        email: profile.email ?? "",
        mobile: profile.mobile ?? "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const fname = form.fname.trim();
    const lname = form.lname.trim();
    const mobile = form.mobile.trim();

    if (!fname || !lname || !mobile) {
      setError("First name, last name, and mobile number are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateStudentProfile({
        fname,
        lname,
        mobile,
      });

      const updatedProfile = response?.data;

      if (!response?.success || !updatedProfile) {
        throw new Error(
          response?.message || "The server did not confirm the update."
        );
      }

      setForm({
        fname: updatedProfile.fname ?? fname,
        lname: updatedProfile.lname ?? lname,
        email: updatedProfile.email ?? form.email,
        mobile: updatedProfile.mobile ?? mobile,
      });

      setMessage("Your profile has been saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentLayout>
      <section className="content">
        <PageHeader
          eyebrow="STUDENT PROFILE"
          title="Personal details"
          description="View and update the personal information associated with your account."
        />

        {loading ? (
          <div className="card" role="status">
            Loading your profile...
          </div>
        ) : (
          <form
            className="card form-grid"
            onSubmit={handleSubmit}
            noValidate={false}
          >
            <TextField
              label="First name"
              name="fname"
              value={form.fname}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />

            <TextField
              label="Last name"
              name="lname"
              value={form.lname}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />

            <TextField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              readOnly
              autoComplete="email"
            />

            <TextField
              label="Mobile number"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              autoComplete="tel"
              required
            />

            {error && (
              <p className="full" role="alert" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {message && (
              <p className="full" role="status" style={{ color: "#15803d" }}>
                {message}
              </p>
            )}

            <div className="form-actions full">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving || loading}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                className="button button-secondary"
                disabled={saving}
                onClick={loadProfile}
              >
                Reload saved profile
              </button>
            </div>
          </form>
        )}
      </section>
    </StudentLayout>
  );
}