# AI-Powered Smartphone & Digital Literacy Assistant for Senior Citizens
### Dual-Stream Guardian & Cadence-Adaptive Ambient Scaffolding Engine
**BMS INSTITUTE OF TECHNOLOGY AND MANAGEMENT (BMSIT&M)**  
*Department of Computer Science and Engineering*  
**III Semester – Societal Project (1BSOP308) | 2025 Scheme | Academic Year 2026–27**  
**Repository:** [https://github.com/kulkarnishamanth4-ux/senior-citizen-digital-literacy](https://github.com/kulkarnishamanth4-ux/senior-citizen-digital-literacy)

> **💡 Configurable Branding:** The app name and branding are not hard-coded. You can customize the name, tagline, and regional labels in one centralized file: [`client/src/config/appConfig.js`](file:///c:/Users/girig/OneDrive/Desktop/Societal%20Project/client/src/config/appConfig.js) or pass `VITE_APP_NAME` in your deployment environment variables.

---

## 🌟 Executive Summary

India is home to more than **138 million citizens aged 60 and above**, a population projected to double by 2050. While mandatory digital services—such as UPI payments, DigiLocker, electricity bills, and telemedicine—have surged, most seniors face a steep digital divide and remain vulnerable to sophisticated cyber frauds (fake KYC APKs, electricity disconnection threats, lottery collect traps, and coercive vishing calls).

This system is not a passive chatbot. It is a **dual-sided ambient guardian and adaptive scaffolding engine** specifically architected to empower older adults with digital independence, restore privacy, and provide active real-time protection against financial exploitation.

---

## 🚀 Breakthrough Innovations (What Makes This System Unique)

Unlike commercial voice assistants (Siri, Alexa, Google Assistant) that are built for digitally native users and cut off speech prematurely, this system introduces core architectural innovations:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. Cadence-Adaptive Infinite-Pause VAD: Adapts to word retrieval hesitations   │
│ 2. Dual-Stream Call & Screen Guardian: Cross-correlates calls & screen state    │
│ 3. Digital Vaccine Sandbox: Inoculates seniors with risk-free simulated scams   │
│ 4. "Spotlight" Task Engine: 20+ core digital guides in English, ಕನ್ನಡ & हिन्दी    │
│ 5. Family/Caregiver Portal: Asynchronous oversight and silent SOS alerts        │
│ 6. Pre/Post-Test Module: Verifies ≥30% improvement across senior pilot cohorts  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Infinite-Pause & Cadence-Adaptive Listening
* **The Problem:** Standard voice APIs time out after ~1.5s of silence. Seniors with anomia (word-retrieval hesitation) or breathing pauses get repeatedly cut off mid-thought.
* **Our Solution:** A dynamic Voice Activity Detection (VAD) layer that tracks acoustic prosody and grammatical completeness. If trailing thoughts are detected, the silence window automatically expands from 1.5s up to **6.5–8.0 seconds** with reassuring visual feedback: *"Take your time, Amma... I am listening."*

### 2. Dual-Stream Call & Screen Guardian (Active Coercion Interception)
* **The Problem:** Scammers keep seniors on live calls and intimidate them into reading out OTPs or installing AnyDesk. Standard NLP obeys commands blindly.
* **Our Solution:** Correlates live call semantic threats (*"police"*, *"electricity cut tonight"*, *"AnyDesk"*) with concurrent screen states (SMS OTP arrival, UPI PIN screen).
* **Protective Interventions:**
  - Automatically applies a visual black mask over sensitive OTP digits: `•••••• [MASKED BY GUARDIAN SHIELD]`.
  - Freezes touch input with a calming regional prompt.
  - Sends a silent real-time alert to the designated family member's dashboard.

### 3. "Digital Vaccine" — Risk-Free Scam Sandbox
* Instead of static posters, seniors practice handling realistic simulations of India's most prevalent scams:
  1. *BESCOM Electricity Disconnection Notice* (Urgent mobile number threat)
  2. *SBI YONO KYC Suspension* (Malicious `.apk` download link)
  3. *Festive Lottery ₹25,000 Cash Prize* (Collect request UPI PIN trap)
  4. *Fake Police 'Digital Arrest' Video Call* (Extortion intimidation)
* Seniors build tactile muscle memory safely without risking real-world financial loss.

### 4. "Spotlight" Scaffolding Engine (20 Core Digital Tasks)
* Covers 20 vital tasks across 4 categories:
  - **Communication:** WhatsApp video calls, voice notes, photo sharing, blocking spam callers.
  - **Digital Payments:** Verifying UPI payee bank name, reading bank SMS balances, mobile recharge, electricity bills.
  - **Smartphone Comfort:** Enlarging fonts, turning on torch, adjusting screen sleep timeout, clearing clutter notifications.
  - **Healthcare & Civic:** Booking hospital OPD tokens, downloading pension slip/Aadhaar on DigiLocker, 3-second SOS alerts.
* Step-by-step interactive screen mockup dims everything except the single button to press next.

### 5. Pre-Test & Post-Test Empirical Evaluation Engine
* Directly validates the VTU 1BSOP308 syllabus milestone: **targeting at least a 30% improvement** in scam-identification accuracy between a baseline pre-test and post-training post-test across 20+ senior citizens.

---

## 🏛️ Sustainable Development Goals (SDGs) Alignment

* **SDG 10 (Target 10.2): Reduced Inequalities** — Empowers and includes older adults in digital banking, healthcare booking, and civic services.
* **SDG 3: Good Health and Well-Being** — Alleviates social isolation through independent communication and unlocks telemedicine access.
* **SDG 4: Quality Education** — Lifelong, adaptive digital literacy curriculum tailored for elderly cognitive profiles.

---

## 🛠️ Tech Stack & Directory Structure

* **Frontend Client (`/client`):** React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Web Speech API.
* **Backend API (`/server`):** Python FastAPI, Uvicorn, Pydantic, Gemini AI heuristics.
* **Accessibility:** Dynamic font scaling (Normal / Large / Jumbo), High-contrast themes (Yellow-on-black, Navy), 60px minimum touch targets, multilingual toggle (English, Kannada, Hindi).

```
senior-citizen-digital-literacy/
├── client/                     # Senior Accessible React + Vite Web Application
│   ├── src/
│   │   ├── components/         # Navbar, Spotlight, VoiceModal, Guardian, Sandbox, PrePostTest
│   │   ├── data/               # 20 Task Guides, Scam Simulations, Pre/Post Tests
│   │   ├── services/           # SpeechService (Cadence VAD), GuardianService (Stream Matrix)
│   │   ├── App.jsx             # Main interactive application
│   │   └── index.css           # Senior high-contrast styling & spotlight effects
│   └── package.json
├── server/                     # Python FastAPI Backend
│   ├── main.py                 # Stream telemetry, scam verifier & caregiver alerts
│   └── requirements.txt
├── package.json                # Root package orchestration
└── README.md                   # Full documentation & syllabus mapping
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (3.10+)

### 2. Run the Senior Assistant Client
```bash
# Clone the repository
git clone https://github.com/kulkarnishamanth4-ux/senior-citizen-digital-literacy.git
cd senior-citizen-digital-literacy

# Install client dependencies
cd client
npm install

# Start the development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run the Backend API (Optional)
```bash
# From the project root
cd server
pip install -r requirements.txt
python main.py
```
The FastAPI documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 📚 Academic References

1. **A. Pradhan, A. Lazar, and L. Findlater**, *"Use of intelligent voice assistants by older adults with low technology use,"* *ACM Trans. Comput.-Hum. Interact. (TOCHI)*, vol. 27, no. 4, 2020. [DOI: 10.1145/3373759](https://doi.org/10.1145/3373759)
2. **A. Petrovčič et al.**, *"Improving the Measurement of Older Adults' Mobile Device Proficiency,"* *IEEE Access*, vol. 7, 2019. [DOI: 10.1109/ACCESS.2019.2947765](https://doi.org/10.1109/ACCESS.2019.2947765)
3. **H. Tamut and I. K. Dutta**, *"Understanding and Mitigating Social Engineering Attacks to Elderly People,"* *IEEE UEMCON*, 2024. [DOI: 10.1109/UEMCON62879.2024.10754807](https://doi.org/10.1109/UEMCON62879.2024.10754807)
4. **D. Pehlivanoglu et al.**, *"Phishing vulnerability compounded by older age,"* *PNAS Nexus*, vol. 3, no. 8, 2024. [DOI: 10.1093/pnasnexus/pgae296](https://doi.org/10.1093/pnasnexus/pgae296)
5. **L. Chen and Y. Mu**, *"Bridging the Digital Divide: Empowering Elderly Smartphone Users in Agemate,"* *ACL REALM*, 2025. [DOI: 10.18653/v1/2025.realm-1.23](https://doi.org/10.18653/v1/2025.realm-1.23)

---

## 👨‍💻 Project Submission Details

* **Institution:** BMS Institute of Technology and Management, Yelahanka, Bengaluru – 560119
* **Department:** Department of Computer Science and Engineering
* **Course:** III Semester – Societal Project (1BSOP308) | 2025 Scheme
* **Academic Year:** 2026–27
* **Guide Signature & Evaluation:** *Pending Internal Review*
