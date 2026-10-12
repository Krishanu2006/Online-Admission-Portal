import StudentLayout from "../../components/layout/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { mockApplication } from "../../services/mockData";

export default function SubmittedApplication() {
  const a = mockApplication;
  return (
    <StudentLayout>
      <section className="content">
        <PageHeader eyebrow="SUBMITTED APPLICATION" title={a.id} description={`Submitted on ${a.submittedAt}`} action={<StatusBadge status={a.status} />} />
        <div className="summary-grid">
          <Info title="Personal details" items={[
            ["Full name", a.student.name], ["Date of birth", a.student.dob],
            ["Gender", a.personal.gender], ["Category", a.personal.category],
            ["Father's name", a.personal.fatherName], ["Mother's name", a.personal.motherName]
          ]} />
          <Info title="Contact details" items={[
            ["Email", a.student.email], ["Mobile", a.student.mobile], ["Address", a.address]
          ]} />
          <Info title="Academic details" items={[
            ["Board / University", a.academic.board], ["Examination", a.academic.examination],
            ["Year of passing", a.academic.year], ["Marks / Percentage", a.academic.marks]
          ]} />
          <Info title="Course & payment" items={[
            ["Course", a.course], ["Payment", a.payment.status],
            ["Amount", a.payment.amount], ["Transaction", a.payment.transactionId]
          ]} />
        </div>
      </section>
    </StudentLayout>
  );
}

function Info({ title, items }) {
  return (
    <div className="card info-card">
      <h2>{title}</h2>
      <div className="info-list">
        {items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
    </div>
  );
}