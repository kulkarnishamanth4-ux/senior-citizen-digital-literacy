export const PRE_TEST_QUESTIONS = [
  {
    id: "pre-1",
    scenario: {
      en: "You get a call from someone saying: 'I am calling from your electricity office. Your meter will be cut in 1 hour unless you share the OTP sent to your phone.' What should you do?",
      kn: "ವಿದ್ಯುತ್ ಇಲಾಖೆಯಿಂದ ಕರೆ ಬಂದಿದ್ದು '1 ಗಂಟೆಯಲ್ಲಿ ಕರೆಂಟ್ ಕಟ್ ಆಗುತ್ತದೆ, ಒಟಿಪಿ ಕೊಡಿ' ಎಂದರೆ ಏನು ಮಾಡುವಿರಿ?",
      hi: "कॉल आता है कि '1 घंटे में बिजली कट जाएगी, फोन पर आया OTP बताएं।' आप क्या करेंगे?"
    },
    options: [
      { id: "a", text: { en: "Quickly give the OTP to prevent power cut", kn: "ಕರೆಂಟ್ ಕಟ್ ತಪ್ಪಿಸಲು ತಕ್ಷಣ ಒಟಿಪಿ ನೀಡುವೆ", hi: "बिजली कटने से बचने के लिए तुरंत OTP दे दूंगा" }, isCorrect: false },
      { id: "b", text: { en: "Cut the call immediately; officials never ask for OTP", kn: "ತಕ್ಷಣ ಕರೆ ಕಟ್ ಮಾಡುವೆ; ಅಧಿಕಾರಿಗಳು ಒಟಿಪಿ ಕೇಳುವುದಿಲ್ಲ", hi: "कॉल तुरंत काट देंगे; असली अधिकारी OTP नहीं मांगते" }, isCorrect: true },
      { id: "c", text: { en: "Ask them to send the electricity bill on WhatsApp", kn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಬಿಲ್ ಕಳುಹಿಸಲು ಹೇಳುವೆ", hi: "व्हाट्सएप पर बिल भेजने को कहूंगा" }, isCorrect: false }
    ],
    explanation: {
      en: "Legitimate utility offices never ask for OTPs or threaten immediate cutoffs over private calls.",
      kn: "ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳು ಎಂದಿಗೂ ಖಾಸಗಿ ಕರೆಯಲ್ಲಿ ಒಟಿಪಿ ಕೇಳುವುದಿಲ್ಲ.",
      hi: "सरकारी विभाग कभी फोन पर OTP नहीं मांगते।"
    }
  },
  {
    id: "pre-2",
    scenario: {
      en: "Someone sends a QR code on WhatsApp and says: 'Scan this QR code and enter your UPI PIN to receive ₹5,000 family pension grant.' Will you receive money?",
      kn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಕ್ಯೂಆರ್ ಕೋಡ್ ಕಳುಹಿಸಿ '₹5,000 ಪಿಂಚಣಿ ಪಡೆಯಲು ಪಿನ್ ಹಾಕಿ' ಎಂದರೆ ಹಣ ಬರುತ್ತದೆಯೇ?",
      hi: "कोई व्हाट्सएप पर QR कोड भेजकर कहे कि '₹5,000 पेंशन पाने के लिए पिन डालें।' क्या पैसे मिलेंगे?"
    },
    options: [
      { id: "a", text: { en: "Yes, scanning QR code gives money", kn: "ಹೌದು, ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದರೆ ಹಣ ಬರುತ್ತದೆ", hi: "हाँ, QR कोड स्कैन करने से पैसे आ जाएंगे" }, isCorrect: false },
      { id: "b", text: { en: "No, entering your UPI PIN always deducts money from your account", kn: "ಇಲ್ಲ, ಯುಪಿಐ ಪಿನ್ ಹಾಕಿದರೆ ನನ್ನ ಖಾತೆಯಿಂದಲೇ ಹಣ ಕಡಿತವಾಗುತ್ತದೆ", hi: "नहीं, यूपीआई पिन डालने से आपके ही पैसे कट जाएंगे" }, isCorrect: true },
      { id: "c", text: { en: "Only if you enter it within 2 minutes", kn: "2 ನಿಮಿಷದೊಳಗೆ ಹಾಕಿದರೆ ಮಾತ್ರ ಬರುತ್ತದೆ", hi: "अगर 2 मिनट में डालेंगे तभी मिलेगा" }, isCorrect: false }
    ],
    explanation: {
      en: "Entering a UPI PIN only sends money. No bank requires a PIN to credit funds to you.",
      kn: "ಯುಪಿಐ ಪಿನ್ ಕೇವಲ ಹಣ ಕಳುಹಿಸಲು ಮಾತ್ರ. ಹಣ ಸ್ವೀಕರಿಸಲು ಯಾವುದೇ ಪಿನ್ ಬೇಕಿಲ್ಲ.",
      hi: "पैसे पाने के लिए कभी कोई पिन नहीं डालना होता।"
    }
  },
  {
    id: "pre-3",
    scenario: {
      en: "A caller claiming to be from your bank says: 'To verify your identity, install AnyDesk / TeamViewer on your phone.' Is this safe?",
      kn: "ಬ್ಯಾಂಕ್ ಮ್ಯಾನೇಜರ್ ಎಂದು ಹೇಳಿ 'AnyDesk ಅಥವಾ TeamViewer ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' ಎಂದರೆ ಒಪ್ಪಬಹುದೇ?",
      hi: "बैंक अधिकारी बनकर कोई फोन पर कहे कि 'AnyDesk या TeamViewer ऐप डाउनलोड करें।' क्या यह सुरक्षित है?"
    },
    options: [
      { id: "a", text: { en: "Yes, if the bank person guides me", kn: "ಹೌದು, ಬ್ಯಾಂಕ್ ವ್ಯಕ್ತಿ ಹೇಳಿದರೆ ಸುರಕ್ಷಿತ", hi: "हाँ, अगर बैंक वाला मदद कर रहा है" }, isCorrect: false },
      { id: "b", text: { en: "NO! These apps let scammers see and control your phone screen", kn: "ಖಂಡಿತ ಇಲ್ಲ! ಈ ಆ್ಯಪ್‌ಗಳಿಂದ ಅವರು ನಿಮ್ಮ ಫೋನ್ ಸ್ಕ್ರೀನ್ ನೋಡಬಹುದು", hi: "बिल्कुल नहीं! ये ऐप फोन की स्क्रीन ठगों को सौंप देते हैं" }, isCorrect: true }
    ],
    explanation: {
      en: "Remote access apps let criminals see your screen and read your secret passwords.",
      kn: "ರಿಮೋಟ್ ಆ್ಯಪ್‌ಗಳು ನಿಮ್ಮ ಫೋನ್ ನಿಯಂತ್ರಣವನ್ನು ಇತರರ ಕೈಗೆ ಕೊಡುತ್ತವೆ.",
      hi: "रिमोट ऐप से कोई भी दूर बैठकर आपका फोन चला सकता है।"
    }
  }
];

export const POST_TEST_QUESTIONS = [
  {
    id: "post-1",
    scenario: {
      en: "An SMS arrives from an unknown 10-digit number saying: 'Your SIM card KYC expired. Click http://sim-kyc.apk to update or SIM will be blocked tonight.' What is the safest response?",
      kn: "ಅಪರಿಚಿತ ನಂಬರ್‌ನಿಂದ 'ಸಿಮ್ ಕೆವೈಸಿ ಮುಗಿದಿದೆ, http://sim-kyc.apk ಲಿಂಕ್ ಒತ್ತಿ' ಎಂಬ ಮೆಸೇಜ್ ಬಂದರೆ ಏನು ಮಾಡಬೇಕು?",
      hi: "अनजान नंबर से SMS आए कि 'सिम बंद हो जाएगा, http://sim-kyc.apk डाउनलोड करें।' सबसे सुरक्षित कदम क्या है?"
    },
    options: [
      { id: "a", text: { en: "Delete the message and ignore it; it's a dangerous malware APK", kn: "ಮೆಸೇಜ್ ಡಿಲೀಟ್ ಮಾಡಿ ನಿರ್ಲಕ್ಷಿಸಿ; ಇದು ಅಪಾಯಕಾರಿ ವೈರಸ್", hi: "मैसेज डिलीट करें; यह खतरनाक वायरस ऐप है" }, isCorrect: true },
      { id: "b", text: { en: "Download the APK quickly so the SIM doesn't block", kn: "ಸಿಮ್ ಬ್ಲಾಕ್ ಆಗದಂತೆ ತಕ್ಷಣ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", hi: "सिम चालू रखने के लिए ऐप डाउनलोड करें" }, isCorrect: false },
      { id: "c", text: { en: "Forward the link to family WhatsApp groups", kn: "ಕುಟುಂಬದ ವಾಟ್ಸಾಪ್ ಗ್ರೂಪ್‌ಗೆ ಕಳುಹಿಸಿ", hi: "परिवार के ग्रुप में भेजें" }, isCorrect: false }
    ],
    explanation: {
      en: "Never install APK files sent through SMS or WhatsApp. Telecom operators send updates through official stores.",
      kn: "ಮೆಸೇಜ್ ಮೂಲಕ ಬರುವ ಯಾವುದೇ .apk ಫೈಲ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಬೇಡಿ.",
      hi: "SMS से आई किसी भी अनजान ऐप फाइल को कभी फोन में न डालें।"
    }
  },
  {
    id: "post-2",
    scenario: {
      en: "You are paying a local vegetable vendor via PhonePe. Before entering your PIN, what crucial detail should you verify?",
      kn: "ಫೋನ್ ಪೇ ಮೂಲಕ ತರಕಾರಿ ಕೊಳ್ಳುವಾಗ ಪಿನ್ ಹಾಕುವ ಮುನ್ನ ಯಾವ ಮುಖ್ಯ ವಿವರ ಪರಿಶೀಲಿಸಬೇಕು?",
      hi: "फोनपे से सब्जी वाले को भुगतान करते समय पिन डालने से पहले क्या जांचना जरूरी है?"
    },
    options: [
      { id: "a", text: { en: "Verify the actual registered bank account holder name shown on screen", kn: "ಪರದೆಯ ಮೇಲೆ ಕಾಣಿಸುವ ಬ್ಯಾಂಕ್ ದಾಖಲಿತ ನಿಜವಾದ ಹೆಸರು", hi: "स्क्रीन पर दिखने वाला बैंक में दर्ज असली नाम" }, isCorrect: true },
      { id: "b", text: { en: "Only check if the QR code picture looks colorful", kn: "ಕ್ಯೂಆರ್ ಕೋಡ್ ಬಣ್ಣ ಚೆನ್ನಾಗಿದೆಯೇ ಎಂದು ಮಾತ್ರ", hi: "सिर्फ यह कि QR कोड साफ दिख रहा है" }, isCorrect: false },
      { id: "c", text: { en: "No need to check anything", kn: "ಏನನ್ನೂ ಪರಿಶೀಲಿಸುವ ಅಗತ್ಯವಿಲ್ಲ", hi: "कुछ भी जांचने की जरूरत नहीं" }, isCorrect: false }
    ],
    explanation: {
      en: "Always cross-check the verified payee name beneath the shop header to ensure the money reaches the right vendor.",
      kn: "ನಿಮ್ಮ ಹಣ ಸರಿಯಾದ ಅಂಗಡಿಯವರಿಗೆ ತಲುಪಲು ಪರದೆಯ ಮೇಲಿನ ಬ್ಯಾಂಕ್ ಹೆಸರು ದೃಢಪಡಿಸಿ.",
      hi: "हमेशा सुनिश्चित करें कि स्क्रीन पर दिखने वाला नाम उसी दुकानदार का है।"
    }
  },
  {
    id: "post-3",
    scenario: {
      en: "A voice call claims to be a Police Officer on WhatsApp video stating you are under 'Digital Arrest' and must transfer ₹50,000 immediately to verify innocence. What is this?",
      kn: "ವಾಟ್ಸಾಪ್ ವಿಡಿಯೋ ಕಾಲ್‌ನಲ್ಲಿ 'ನಾವು ಪೊಲೀಸರು, ನಿಮ್ಮ ಮೇಲೆ ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್ ಆಗಿದೆ, ₹50,000 ವರ್ಗಾಯಿಸಿ' ಎಂದರೆ ಇದು ಏನು?",
      hi: "व्हाट्सएप वीडियो पर 'हम पुलिस हैं, आप डिजिटल अरेस्ट हैं, ₹50,000 भेजें' कहे तो यह क्या है?"
    },
    options: [
      { id: "a", text: { en: "100% Cyber Scam! Indian Law has NO concept of 'Digital Arrest'", kn: "100% ಸೈಬರ್ ವಂಚನೆ! ಭಾರತೀಯ ಕಾನೂನಿನಲ್ಲಿ 'ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್' ಎಂಬುದೇ ಇಲ್ಲ", hi: "100% फर्जीवाड़ा! कानून में 'डिजिटल अरेस्ट' नाम का कोई नियम नहीं है" }, isCorrect: true },
      { id: "b", text: { en: "A real government police investigation", kn: "ನಿಜವಾದ ಪೊಲೀಸ್ ತನಿಖೆ", hi: "असली पुलिस जांच" }, isCorrect: false },
      { id: "c", text: { en: "You must pay to avoid going to jail", kn: "ಜೈಲು ತಪ್ಪಿಸಲು ಹಣ ನೀಡಲೇಬೇಕು", hi: "जेल से बचने के लिए पैसे देने होंगे" }, isCorrect: false }
    ],
    explanation: {
      en: "Supreme Court and CBI have confirmed 'Digital Arrest' is a fraudulent scare tactic. Police never demand money transfers over video calls.",
      kn: "ಪೊಲೀಸರು ಎಂದಿಗೂ ವಿಡಿಯೋ ಕರೆ ಮೂಲಕ ಹಣ ವರ್ಗಾವಣೆ ಕೇಳುವುದಿಲ್ಲ.",
      hi: "पुलिस कभी वीडियो कॉल पर पैसे की मांग नहीं करती।"
    }
  }
];
