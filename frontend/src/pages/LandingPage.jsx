import { ArrowRight, CheckCircle2, ShieldCheck, FileCheck2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
import PublicHeader from "../components/layout/PublicHeader";
import Footer from "../components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Institute of Engineering & Management · Kolkata</div>
          <h1>One portal for your <em>admission journey.</em></h1>
          <p>
            Register, complete your application, upload documents, make your application
            payment, and track your admission status from one secure portal.
          </p>
          <div className="hero-actions">
            <Link to="/student/register" className="button button-primary button-large">
              Start Application <ArrowRight size={18} />
            </Link>
            <Link to="/student/login" className="button button-secondary button-large">
              Login
            </Link>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={16} /> Secure access</span>
            <span><FileCheck2 size={16} /> Document management</span>
            <span><Clock3 size={16} /> Status tracking</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <span className="mini-label">APPLICATION JOURNEY</span>
            <span className="hero-dot" />
          </div>
          {["Create account", "Complete application", "Upload documents", "Pay application fee", "Track status"].map((item, i) => (
            <div className="journey-item" key={item}>
              <span className={i < 2 ? "journey-number complete" : "journey-number"}>{i < 2 ? "✓" : i + 1}</span>
              <div>
                <strong>{item}</strong>
                <small>{i < 2 ? "Completed" : "Next step"}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-strip">
        {[
          ["01", "Simple application", "Enter personal, contact, academic and course information."],
          ["02", "Secure documents", "Upload and manage the documents required for your application."],
          ["03", "Transparent status", "See whether your application is submitted, under review, approved or rejected."]
        ].map(([num, title, text]) => (
          <div className="feature-item" key={num}>
            <span>{num}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}