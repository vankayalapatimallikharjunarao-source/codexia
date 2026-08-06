export interface CertificateData {
  studentName: string;
  program: string;
  cohortId: string;
  completionDate: string;
  certificateId: string;
}

let cachedNodeBgBase64 = "";

function getCertificateBgUrl(): string {
  // If running in Node.js server environment, read image file from disk and convert to base64
  if (typeof process !== "undefined" && process.versions?.node) {
    if (cachedNodeBgBase64) return cachedNodeBgBase64;
    try {
      // Use standard require in Node environment
      const fs = require("fs");
      const path = require("path");
      const bgPath = path.resolve(process.cwd(), "src/assets/images/certificate-bg.png");
      if (fs.existsSync(bgPath)) {
        const imageBuffer = fs.readFileSync(bgPath);
        cachedNodeBgBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;
        return cachedNodeBgBase64;
      }
    } catch (err) {
      // Fallback if fs not accessible
    }
  }
  // Browser runtime fallback to absolute public / asset route
  return "/src/assets/images/certificate-bg.png";
}

export function generateCertificateSVG(data: CertificateData, customBgUrl?: string): string {
  const {
    studentName,
    program,
    cohortId,
    completionDate,
    certificateId
  } = data;

  const sanitizedName = studentName || "Student Name";
  const sanitizedProgram = program || "Base Cohort";
  const sanitizedCohort = cohortId || "CODX-2026-07-BASE-01";
  const sanitizedDate = completionDate || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const sanitizedCertId = certificateId || "CODX-CERT-001";

  const bgUrl = customBgUrl || getCertificateBgUrl();

  // Dynamic font size for student name matching CertificateDesign.tsx
  let nameFontSize = 112.26; // 3.2cqw of 3508px
  if (sanitizedName.length > 35) {
    nameFontSize = 63.14; // 1.8cqw of 3508px
  } else if (sanitizedName.length > 28) {
    nameFontSize = 77.18; // 2.2cqw of 3508px
  } else if (sanitizedName.length > 20) {
    nameFontSize = 91.21; // 2.6cqw of 3508px
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3508 2792" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;family=Georgia&amp;display=swap');
      .cert-gold-text {
        font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
        font-weight: bold;
        fill: #f0d582;
      }
    </style>
    <filter id="goldGlow12" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#f0d582" flood-opacity="0.4"/>
    </filter>
    <filter id="goldGlow8" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f0d582" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Template Graphic -->
  <image href="${bgUrl}" x="0" y="0" width="3508" height="2792" preserveAspectRatio="none" />

  <!-- 1. Dynamic Student Name Overlay (Centered at top 45.8%, left 50%) -->
  <text x="1754" y="1278.7" text-anchor="middle" dominant-baseline="central" class="cert-gold-text" font-size="${nameFontSize}" filter="url(#goldGlow12)" letter-spacing="1.5">${sanitizedName}</text>

  <!-- 2. Program Overlay (Centered at top 70.8%, left 21.2%) -->
  <text x="743.7" y="1976.7" text-anchor="middle" dominant-baseline="central" class="cert-gold-text" font-size="45.6" filter="url(#goldGlow8)">[ ${sanitizedProgram} ]</text>

  <!-- 3. Cohort ID Overlay (Centered at top 70.8%, left 40.2%) -->
  <text x="1410.2" y="1976.7" text-anchor="middle" dominant-baseline="central" class="cert-gold-text" font-size="42.1" filter="url(#goldGlow8)">[ ${sanitizedCohort} ]</text>

  <!-- 4. Completion Date Overlay (Centered at top 70.8%, left 61.2%) -->
  <text x="2146.9" y="1976.7" text-anchor="middle" dominant-baseline="central" class="cert-gold-text" font-size="42.1" filter="url(#goldGlow8)">[ ${sanitizedDate} ]</text>

  <!-- 5. Certificate ID Overlay (Centered at top 70.8%, left 81.5%) -->
  <text x="2858.0" y="1976.7" text-anchor="middle" dominant-baseline="central" class="cert-gold-text" font-size="35.1" filter="url(#goldGlow8)">[ ${sanitizedCertId} ]</text>
</svg>`;
}

export function downloadCertificateSVG(data: CertificateData) {
  const svgString = generateCertificateSVG(data);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `Codexia_Certificate_${(data.studentName || "Student").trim().replace(/\s+/g, "_")}_${data.certificateId || "COMPLETION"}.svg`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCertificatePNG(data: CertificateData) {
  const svgString = generateCertificateSVG(data);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 3508;
    canvas.height = 2792;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, 3508, 2792);
      try {
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        const fileName = `Codexia_Certificate_${(data.studentName || "Student").trim().replace(/\s+/g, "_")}_${data.certificateId || "COMPLETION"}.png`;
        a.href = pngUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("PNG conversion fallback download SVG:", err);
        downloadCertificateSVG(data);
      }
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    downloadCertificateSVG(data);
  };
  img.src = url;
}
