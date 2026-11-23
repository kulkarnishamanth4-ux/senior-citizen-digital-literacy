/**
 * Global Application Configuration
 * Change the name, branding, or institution details here in ONE place.
 *
 * Environment Variables (set in .env or hosting dashboard):
 *   VITE_APP_NAME — Override the app display name
 *   VITE_API_URL  — Backend API base URL (default: http://localhost:8000)
 *
 * Server-side only (set on Render, never in frontend):
 *   GEMINI_API_KEY — Gemini Vision key, kept securely on the backend
 */

const customName = import.meta.env.VITE_APP_NAME || "ElderAssist AI";

const isNative = typeof window !== 'undefined' && (
  Boolean(window.Capacitor) ||
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'ionic:' ||
  Boolean(window.androidBridge)
);

const defaultApiUrl =
  isNative || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? 'https://senior-citizen-digital-literacy.onrender.com'
    : (import.meta.env.PROD ? 'https://senior-citizen-digital-literacy.onrender.com' : 'http://localhost:8000');

export const APP_CONFIG = {
  // Primary App Name (English)
  name: customName,

  // Minimalist typographic mark
  logoInitial: "E",

  // Backend API base URL
  apiBaseUrl: import.meta.env.VITE_API_URL || defaultApiUrl,

  // Multilingual Brand Names
  brandName: {
    en: customName,
    kn: "ಡಿಜಿಟಲ್ ರಕ್ಷಕ",
    hi: "डिजिटल साथी"
  },

  // Multilingual Subtitles / Taglines
  subtitle: {
    en: "Simple & Safe Smartphone Helper for Seniors",
    kn: "ಹಿರಿಯರಿಗೆ ಸುಲಭ ಮತ್ತು ಸುರಕ್ಷಿತ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಸಹಾಯಕ",
    hi: "बुजुर्गों के लिए आसान और सुरक्षित स्मार्टफोन साथी"
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
  storagePrefix: "senior_literacy_",

  // Android APK Download Links
  apkDownload: {
    directUrl: "https://github.com/kulkarnishamanth4-ux/senior-citizen-digital-literacy/releases/latest/download/ElderAssist.apk",
    releasesUrl: "https://github.com/kulkarnishamanth4-ux/senior-citizen-digital-literacy/releases",
    version: "v1.0.0",
    fileName: "ElderAssist.apk"
  }
};
