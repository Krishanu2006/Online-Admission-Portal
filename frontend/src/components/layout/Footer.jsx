import { Link } from "react-router-dom";
import {
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  ArrowUpRight
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>Institute of Engineering &amp; Management</h2>
            <p>
              Your journey towards academic excellence
              and a brighter future begins here.
            </p>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>

            <a href="tel:+918010700500" className="footer-contact-item">
              <Phone size={18} />
              <span>+91 8123456789</span>
            </a>

            <a href="tel:03323572995" className="footer-contact-item">
              <PhoneCall size={18} />
              <span>033 2456 2775</span>
            </a>

            <a
              href="mailto:admissions@iem.edu.in"
              className="footer-contact-item"
            >
              <Mail size={18} />
              <span>admission@iem.edu.in</span>
            </a>

            <a
              href="https://maps.app.goo.gl/sVsdoujGQCdquKss6"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item footer-address"
            >
              <MapPin size={20} />
              <span>
                IEM Ashram Building, GN-34/2,
                Salt Lake Electronics Complex,
                Sector V, Bidhannagar, Kolkata,
                West Bengal 700091
              </span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Institute of
            Engineering &amp; Management. All rights reserved.
          </p>

          <Link to="/student/register" className="footer-apply-btn">
            Apply Now
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </footer>
  );
}