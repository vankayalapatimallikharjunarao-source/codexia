import React from "react";
import certificateBg from "../assets/images/certificate-bg.png";
import { CertificateData } from "../utils/certificateGenerator";

interface CertificateDesignProps {
  data: CertificateData;
}

export default function CertificateDesign({ data }: CertificateDesignProps) {
  const sanitizedName = data.studentName || "Student Name";
  const sanitizedProgram = data.program || "Base Cohort";
  const sanitizedCohort = data.cohortId || "CODX-2026-07-BASE-01";
  const sanitizedDate = data.completionDate || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const sanitizedCertId = data.certificateId || "CODX-CERT-001";

  // Dynamic font size for student name based on character length
  let nameFontSize = "3.2cqw";
  if (sanitizedName.length > 35) {
    nameFontSize = "1.8cqw";
  } else if (sanitizedName.length > 28) {
    nameFontSize = "2.2cqw";
  } else if (sanitizedName.length > 20) {
    nameFontSize = "2.6cqw";
  }

  return (
    <div
      className="relative w-full mx-auto select-none overflow-hidden bg-[#04060b]"
      style={{
        containerType: "inline-size",
        aspectRatio: "3508 / 2792",
      }}
    >
      {/* Background Image */}
      <img
        src={certificateBg}
        alt="Codexia Certificate"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Dynamic Student Name Overlay */}
      <div
        className="absolute text-center font-bold font-serif leading-none flex items-center justify-center tracking-wide"
        style={{
          top: "45.8%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "56%",
          fontSize: nameFontSize,
          color: "#f0d582",
          textShadow: "0 0 12px rgba(240, 213, 130, 0.4)",
        }}
      >
        {sanitizedName}
      </div>

      {/* Program Overlay */}
      <div
        className="absolute text-center font-bold font-serif leading-tight flex items-center justify-center"
        style={{
          top: "70.8%",
          left: "21.2%",
          transform: "translate(-50%, -50%)",
          width: "18%",
          fontSize: "1.3cqw",
          color: "#f0d582",
          textShadow: "0 0 8px rgba(240, 213, 130, 0.3)",
        }}
      >
        [ {sanitizedProgram} ]
      </div>

      {/* Cohort ID Overlay */}
      <div
        className="absolute text-center font-bold font-serif leading-tight flex items-center justify-center"
        style={{
          top: "70.8%",
          left: "40.2%",
          transform: "translate(-50%, -50%)",
          width: "17%",
          fontSize: "1.2cqw",
          color: "#f0d582",
          textShadow: "0 0 8px rgba(240, 213, 130, 0.3)",
        }}
      >
        [ {sanitizedCohort} ]
      </div>

      {/* Completion Date Overlay */}
      <div
        className="absolute text-center font-bold font-serif leading-tight flex items-center justify-center"
        style={{
          top: "70.8%",
          left: "61.2%",
          transform: "translate(-50%, -50%)",
          width: "18%",
          fontSize: "1.2cqw",
          color: "#f0d582",
          textShadow: "0 0 8px rgba(240, 213, 130, 0.3)",
        }}
      >
        [ {sanitizedDate} ]
      </div>

      {/* Certificate ID Overlay */}
      <div
        className="absolute text-center font-bold font-serif leading-tight flex items-center justify-center"
        style={{
          top: "70.8%",
          left: "81.5%",
          transform: "translate(-50%, -50%)",
          width: "17%",
          fontSize: "1.0cqw",
          color: "#f0d582",
          textShadow: "0 0 8px rgba(240, 213, 130, 0.3)",
        }}
      >
        [ {sanitizedCertId} ]
      </div>
    </div>
  );
}
