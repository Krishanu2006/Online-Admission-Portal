import { useCallback, useEffect, useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import TextField from "../../components/forms/TextField";
import SelectField from "../../components/forms/SelectField";
import {
  createApplication,
  getStudentApplication,
  updateStudentApplication,
  submitStudentApplication,
} from "../../services/application.api";

const courses = [
  "B.Tech Computer Science & Engineering",
  "B.Tech Information Technology",
  "B.Tech Electronics & Communication Engineering",
  "B.Tech Electrical Engineering",
];

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  category: "",
  fatherName: "",
  motherName: "",
  nationality: "Indian",
  phone: "",
  email: "",
  address: "",
  class10Board: "",
  class10Percentage: "",
  class12Board: "",
  class12Percentage: "",
  course: "",
};

const courseIds = {
  "B.Tech Computer Science & Engineering": 101,
  "B.Tech Information Technology": 102,
  "B.Tech Electronics & Communication Engineering": 103,
  "B.Tech Electrical Engineering": 104,
};

function getApplicationData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function applicationToForm(application) {
  if (!application) return emptyForm;

  const personal = application.personalDetails ?? {};
  const contact = application.contactDetails ?? {};
  const academic = application.academicDetails ?? {};
  const class10 = academic.class10 ?? {};
  const class12 = academic.class12 ?? {};
  const firstCourse = [...(application.coursePreferences ?? [])].sort(
    (a, b) => (a.preference ?? 999) - (b.preference ?? 999)
  )[0];

  const courseName =
    typeof firstCourse?.courseId === "number"
      ? Object.keys(courseIds).find(
          (name) => courseIds[name] === firstCourse.courseId
        ) ?? ""
      : "";

  return {
    ...emptyForm,
    fullName: personal.fullName ?? "",
    dateOfBirth: personal.dateOfBirth ?? "",
    gender: personal.gender ?? "",
    category: personal.category ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    class10Board: class10.board ?? "",
    class10Percentage:
      class10.percentage == null ? "" : String(class10.percentage),
    class12Board: class12.board ?? "",
    class12Percentage:
      class12.percentage == null ? "" : String(class12.percentage),
    course: courseName,
  };
}

export default function AdmissionApplication() {
  const [form, setForm] = useState(emptyForm);
  const [applicationId, setApplicationId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isEditable = status === "DRAFT";

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let response;

      try {
        response = await getStudentApplication();
      } catch (err) {
        // Create the draft only when the server specifically reports
        // that no application exists. Do not hide authentication or
        // database errors by creating another record.
        if (err.response?.status !== 404) throw err;
        response = await createApplication();
      }

      let application = getApplicationData(response);

      if (!application?._id && !application?.applicationId) {
        throw new Error("The server returned an invalid application.");
      }

      setApplicationId(application.applicationId ?? "");
      setStatus(application.status ?? "DRAFT");
      setForm(applicationToForm(application));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your application."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function buildPayload() {
    const percentage10 = Number(form.class10Percentage);
    const percentage12 = Number(form.class12Percentage);

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.class10Board.trim() ||
      !form.class12Board.trim() ||
      !form.course
    ) {
      throw new Error(
        "Please complete your full name, contact details, both academic boards, and course selection."
      );
    }

    if (
      form.class10Percentage.trim() === "" ||
      form.class12Percentage.trim() === "" ||
      !Number.isFinite(percentage10) ||
      !Number.isFinite(percentage12) ||
      percentage10 < 0 ||
      percentage10 > 100 ||
      percentage12 < 0 ||
      percentage12 > 100
    ) {
      throw new Error("Enter valid Class 10 and Class 12 percentages from 0 to 100.");
    }

    return {
      personalDetails: {
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        category: form.category,
      },
      contactDetails: {
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      },
      academicDetails: {
        class10: {
          board: form.class10Board.trim(),
          percentage: percentage10,
        },
        class12: {
          board: form.class12Board.trim(),
          percentage: percentage12,
        },
      },
      coursePreferences: [
        {
          courseId: courseIds[form.course],
          preference: 1,
        },
      ],
    };
  }

  async function handleSaveDraft(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (!isEditable) {
        throw new Error("This application is no longer editable.");
      }

      const payload = buildPayload();
      const response = await updateStudentApplication(payload);
      const application = getApplicationData(response);

      if (!response?.success || !application) {
        throw new Error(response?.message || "The server did not confirm the save.");
      }

      setApplicationId(application.applicationId ?? applicationId);
      setStatus(application.status ?? "DRAFT");
      setForm(applicationToForm(application));
      setMessage("Draft saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your draft."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitApplication() {
    setError("");
    setMessage("");

    if (!isEditable) {
      setError("This application has already been submitted or reviewed.");
      return;
    }

    setSubmitting(true);

    try {
      // Persist the latest form data before asking the server to submit.
      const payload = buildPayload();
      const saveResponse = await updateStudentApplication(payload);
      const savedApplication = getApplicationData(saveResponse);

      if (!saveResponse?.success || !savedApplication) {
        throw new Error("Your application could not be saved before submission.");
      }

      const submitResponse = await submitStudentApplication();
      const submittedApplication = getApplicationData(submitResponse);

      if (!submitResponse?.success || !submittedApplication) {
        throw new Error(
          submitResponse?.message || "The server did not confirm submission."
        );
      }

      setApplicationId(
        submittedApplication.applicationId ?? applicationId
      );
      setStatus(submittedApplication.status ?? "SUBMITTED");
      setForm(applicationToForm(submittedApplication));
      setMessage("Application submitted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit your application."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StudentLayout>
      <section className="content">
        <PageHeader
          eyebrow="ADMISSION APPLICATION"
          title="Complete your application"
          description="Enter your personal, contact, academic, and course information."
        />

        {loading ? (
          <div className="card" role="status">
            Loading your application...
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: "1rem" }}>
              <p>
                <strong>Application ID:</strong>{" "}
                {applicationId || "Not available"}
              </p>
              <p>
                <strong>Status:</strong> {status.replaceAll("_", " ")}
              </p>
              {!isEditable && (
                <p>
                  This application is no longer in draft status and cannot be
                  edited through this form.
                </p>
              )}
            </div>

            <form className="stack-lg" onSubmit={handleSaveDraft}>
              <fieldset
                disabled={!isEditable || saving || submitting}
                style={{
                  border: 0,
                  padding: 0,
                  margin: 0,
                  minWidth: 0,
                }}
              >
                <div className="card">
                  <div className="section-title">
                    <span>01</span>
                    <div>
                      <h2>Personal details</h2>
                      <p>Information used to identify the applicant.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <TextField
                      label="Full name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />

                    <TextField
                      label="Date of birth"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                    />

                    <SelectField
                      label="Gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      options={["Male", "Female", "Other"]}
                      required
                    />

                    <SelectField
                      label="Category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      options={["General", "OBC", "SC", "ST", "EWS"]}
                      required
                    />

                    <TextField
                      label="Father's name"
                      name="fatherName"
                      value={form.fatherName}
                      onChange={handleChange}
                    />

                    <TextField
                      label="Mother's name"
                      name="motherName"
                      value={form.motherName}
                      onChange={handleChange}
                    />

                    <TextField
                      label="Nationality"
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">
                    <span>02</span>
                    <div>
                      <h2>Contact details</h2>
                      <p>Provide your current contact information.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <TextField
                      label="Mobile number"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />

                    <TextField
                      label="Email address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />

                    <label className="field full">
                      <span>Address<b>*</b></span>
                      <textarea
                        name="address"
                        rows="4"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter your full address"
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">
                    <span>03</span>
                    <div>
                      <h2>Academic details</h2>
                      <p>Enter details of your qualifying examinations.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <TextField
                      label="Class 10 Board"
                      name="class10Board"
                      value={form.class10Board}
                      onChange={handleChange}
                      placeholder="e.g. CBSE"
                      required
                    />

                    <TextField
                      label="Class 10 Percentage"
                      name="class10Percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.class10Percentage}
                      onChange={handleChange}
                      required
                    />

                    <TextField
                      label="Class 12 Board"
                      name="class12Board"
                      value={form.class12Board}
                      onChange={handleChange}
                      placeholder="e.g. WBCHSE"
                      required
                    />

                    <TextField
                      label="Class 12 Percentage"
                      name="class12Percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.class12Percentage}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">
                    <span>04</span>
                    <div>
                      <h2>Course selection</h2>
                      <p>Select the programme you are applying for.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <SelectField
                      label="Course / Programme"
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      options={courses}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {error && (
                <p role="alert" style={{ color: "#dc2626" }}>
                  {error}
                </p>
              )}

              {message && (
                <p role="status" style={{ color: "#15803d" }}>
                  {message}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button-secondary"
                  disabled={!isEditable || saving || submitting}
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  type="button"
                  className="button button-primary"
                  disabled={!isEditable || saving || submitting}
                  onClick={handleSubmitApplication}
                >
                  {submitting ? "Submitting..." : "Submit application"}
                </button>

                <a
                  href="/student/documents"
                  className="button button-secondary"
                >
                  Continue to documents
                </a>
              </div>
            </form>
          </>
        )}
      </section>
    </StudentLayout>
  );
}