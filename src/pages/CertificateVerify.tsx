import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CertificateVerify.css";
import logo192 from "./logo192.png";

type CertificateRow = {
  id?: string;
  serial_number: string;
  student_name: string;
  course_name: string;
  course_duration?: string | null;
  completion_status?: string | null;
  badge_url?: string | null;
  course_description?: string | null;
  skills_gained?: string | null;
};

export default function CertificateVerify() {
  const [serial, setSerial] = useState("");
  const [certificate, setCertificate] = useState<CertificateRow | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCertificate(null);

    const trimmed = serial.trim();
    if (!trimmed) {
      setError("Please enter a serial number.");
      return;
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("serial_number", trimmed)
      .single();

    if (error || !data) {
      setError("❌ No certificate found for this serial number.");
    } else {
      setCertificate(data as CertificateRow);
    }
  };

  const getDownloadLink = (url: string) => {
    if (!url) return url;
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/[-\w]{25,}/)?.[0];
      return fileId
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : url;
    }
    return url;
  };

  return (
    <div className="certificate-page">
      <h2 className="verify-heading">🎓 Certificate Verification Portal</h2>

      <form onSubmit={handleVerify} className="verify-form">
        <input
          type="text"
          placeholder="Enter Serial Number"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          className="verify-input"
        />
        <button className="verify-btn">Verify</button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {certificate && (
        <div className="certificate-card">
          <div className="certificate-content">
            <img src={logo192} alt="Logo" className="certificate-logo-left" />

            <div className="certificate-info">
              <p>
                This is to certify that <strong>{certificate.student_name}</strong> has successfully completed the course <strong>{certificate.course_name}</strong>
                {certificate.course_duration ? ` in ${certificate.course_duration}` : ""}. The completion status of this course is <strong>{certificate.completion_status || "N/A"}</strong>, and the certificate serial number is <strong>{certificate.serial_number}</strong>.
              </p>

              {/* Course Description Box */}
              {certificate.course_description && (
                <div className="info-box">
                  <h4>📘 Course Description</h4>
                  <p>{certificate.course_description}</p>
                </div>
              )}

              {/* Skills Gained Box */}
              {certificate.skills_gained && (
                <div className="info-box">
                  <h4> Skills Gained</h4>
                  <p>{certificate.skills_gained}</p>
                </div>
              )}

              {/* Extra paragraph at the end */}
              <p className="extra-text">
                Awareness Paradigm empowers individuals to develop emotional intelligence, enhance personal growth, and gain the confidence needed to achieve professional and personal success. By completing this course, the learner has demonstrated commitment to self-improvement and the principles of mindfulness, resilience, and holistic learning.
              </p>

              {certificate.badge_url && (
                <a
                  href={getDownloadLink(certificate.badge_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="download-btn"
                >
                  ⬇️ Download Badge
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="certificate-footer">
        Awareness Paradigm Verification © {new Date().getFullYear()}
      </footer>

      <div className="admin-link-container">
        <p
          className="admin-link"
          onClick={() => navigate("/login")}
        >
          Are you admin?
        </p>
      </div>
    </div>
  );
}
