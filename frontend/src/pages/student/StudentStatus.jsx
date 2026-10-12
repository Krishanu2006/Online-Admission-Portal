import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { mockApplication } from "../../services/mockData";

export default function StudentStatus() {
  const steps = [
    ["Application submitted", "03 October 2026, 05:40 PM", true],
    ["Under review", "Application is being reviewed by the admissions team.", true],
    ["Admission decision", "Pending administrative decision.", false]
  ];

  return (
    <StudentLayout>
      <section className="content">
        <PageHeader eyebrow="APPLICATION STATUS" title="Track your application" description={`Application ID: ${mockApplication.id}`} action={<StatusBadge status={mockApplication.status} />} />
        <div className="card status-card">
          {steps.map(([title, detail, done], index) => (
            <div className="timeline-row" key={title}>
              <div className={`timeline-icon ${done ? "done" : ""}`}>
                {done ? <CheckCircle2 size={20} /> : index === 2 ? <Clock3 size={20} /> : <XCircle size={20} />}
              </div>
              <div className="timeline-content">
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card info-callout">
          <strong>What happens next?</strong>
          <p>The admissions team will review your application and documents. If a decision is recorded, the status shown here will be updated.</p>
        </div>
      </section>
    </StudentLayout>
  );
}