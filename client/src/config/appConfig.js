/**
 * Global Application Configuration
 * Change the name, branding, or institution details here in ONE place.
 */

const customName = import.meta.env.VITE_APP_NAME || "ElderAssist AI";

export const APP_CONFIG = {
  // Primary App Name (English)
  name: customName,

  // Minimalist typographic mark
  logoInitial: "E",

  // Multilingual Brand Names
  brandName: {
    en: customName,
    kn: "ಡಿಜಿಟಲ್ ರಕ್ಷಕ",
    hi: "डिजिटल साथी"
  },

  // Multilingual Subtitles / Taglines
  subtitle: {
    en: "AI-Powered Smartphone & Digital Literacy Assistant for Senior Citizens",
    kn: "ಹಿರಿಯ ನಾಗರಿಕರ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ & ಡಿಜಿಟಲ್ ಸಾಕ್ಷರತಾ ರಕ್ಷಕ",
    hi: "वरिष्ठ नागरिकों के लिए डिजिटल साक्षरता एवं सुरक्षा सहायक"
  },

  // Academic Metadata (BMSIT&M)
  academic: {
    institution: "BMS Institute of Technology & Management",
    department: "Department of Computer Science & Engineering",
    courseCode: "1BSOP308",
    scheme: "2025 Scheme",
    academicYear: "2026-27",
    category: "Education; Community Welfare; Public Safety"
  },

  // Storage key prefix
  storagePrefix: "senior_literacy_"
};
