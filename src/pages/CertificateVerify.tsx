// src/pages/CertificateVerify.tsx
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

  // Converts Google Drive URL to direct download
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
          <div className="certificate-header">
            <img src={logo192} alt="Logo" className="certificate-logo" />
            <h1 className="verified-text">✅ Verified Certificate</h1>
          </div>

          <div className="certificate-body">
            <p className="cert-text">This is to certify that</p>
            <h2 className="student-name">{certificate.student_name}</h2>
            <p className="cert-text">has successfully completed the course</p>
            <h3 className="course-name">{certificate.course_name}</h3>
            <p className="cert-text">
              Duration: {certificate.course_duration || "N/A"}
            </p>
          </div>

          <div className="certificate-footer">
            <p>
              <strong>Serial No:</strong> {certificate.serial_number}
            </p>
            <p>
              <strong>Status:</strong> {certificate.completion_status || "N/A"}
            </p>
          </div>

          {/* ✅ Download badge button */}
          {certificate.badge_url && (
            <div className="download-btn-container">
              <a
                href={getDownloadLink(certificate.badge_url)}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="download-btn"
              >
                ⬇️ Download Badge
              </a>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="global-footer">
        Awareness Paradigm Verification © {new Date().getFullYear()}
      </footer>

      {/* Admin link */}
      <div className="admin-link-container">
        <p
          className="admin-link"
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer", marginTop: "15px", color: "#007bff" }}
        >
          Are you admin?
        </p>
      </div>
    </div>
  );
}
