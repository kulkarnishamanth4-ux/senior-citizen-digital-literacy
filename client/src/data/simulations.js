export const SCAM_SIMULATIONS = [
  {
    id: "sim-electricity-cut",
    title: {
      en: "Electricity Power Disconnection Threat",
      kn: "ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತದ ನಕಲಿ ಬೆದರಿಕೆ",
      hi: "बिजली कनेक्शन कटने की फर्जी धमकी"
    },
    threatType: "Urgency & Utility Threat",
    sender: "+91 98452 11029 (Personal Mobile Number)",
    messageBody: {
      en: "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Rahul at 9845211029. Do not ignore.",
      kn: "ಗ್ರಾಹಕರೇ ಗಮನಿಸಿ, ಹಿಂದಿನ ತಿಂಗಳ ಬಿಲ್ ಅಪ್‌ಡೇಟ್ ಆಗದ ಕಾರಣ ಇಂದು ರಾತ್ರಿ 9:30 ಕ್ಕೆ ನಿಮ್ಮ ವಿದ್ಯುತ್ ಸಂಪರ್ಕವನ್ನು ಕಡಿತಗೊಳಿಸಲಾಗುವುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ವಿದ್ಯುತ್ ಅಧಿಕಾರಿ ರಾಹುಲ್ ಅವರನ್ನು 9845211029 ಗೆ ಸಂಪರ್ಕಿಸಿ.",
      hi: "प्रिय उपभोक्ता, पिछले महीने का बिल अपडेट न होने के कारण आज रात 9:30 बजे आपकी बिजली काट दी जाएगी। कृपया तुरंत हमारे अधिकारी राहुल से 9845211029 पर संपर्क करें।"
    },
    redFlags: [
      {
        flag: "Sent from a personal 10-digit mobile number, not official board ID (e.g. BESCOM/DHBVN).",
        kn: "ಅಧಿಕೃತ ವಿದ್ಯುತ್ ಮಂಡಳಿಯ ಬದಲು ಸಾಮಾನ್ಯ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ನಂಬರ್‌ನಿಂದ ಬಂದಿದೆ.",
        hi: "सरकारी बोर्ड की जगह एक अनजान 10 अंकों के निजी मोबाइल नंबर से भेजा गया है।"
      },
      {
        flag: "Artificial urgency ('power cut tonight at 9:30 PM') designed to cause panic.",
        kn: "ಭಯ ಹುಟ್ಟಿಸಲು 'ಇಂದು ರಾತ್ರಿಯೇ ಕರೆಂಟ್ ಕಟ್' ಎಂಬ ತುರ್ತು ಬೆದರಿಕೆ ಹಾಕಲಾಗಿದೆ.",
        hi: "घबराहट पैदा करने के लिए 'आज रात ही बिजली कटेगी' का झूठा दबाव बनाया गया है।"
      },
      {
        flag: "Asks you to call a private individual instead of directing to the official payment portal.",
        kn: "ಅಧಿಕೃತ ಕಚೇರಿಯ ಬದಲು ಖಾಸಗಿ ವ್ಯಕ್ತಿಗೆ ಕರೆ ಮಾಡಲು ತಿಳಿಸಲಾಗಿದೆ.",
        hi: "आधिकारिक काउंटर या ऐप के बजाय किसी अनजान व्यक्ति को फोन करने को कहा गया है।"
      }
    ],
    audioExplanation: {
      en: "Do not worry, Amma. Electricity boards never disconnect power without sending physical notices through official postal channels. Genuine government boards never use private personal mobile numbers. Simply report this and delete it.",
      kn: "ಹೆದರಬೇಡಿ ಅಮ್ಮಾ. ವಿದ್ಯುತ್ ಮಂಡಳಿ ಎಂದಿಗೂ ವೈಯಕ್ತಿಕ ಮೊಬೈಲ್ ನಂಬರ್‌ನಿಂದ ಇಂತಹ ಸಂದೇಶ ಕಳುಹಿಸುವುದಿಲ್ಲ. ಇದು ಶೇಕಡಾ ನೂರರಷ್ಟು ವಂಚನೆ.",
      hi: "घबराएं नहीं। बिजली विभाग कभी भी निजी मोबाइल नंबर से ऐसी धमकी नहीं देता। यह पूरी तरह से धोखाधड़ी है।"
    },
    choices: [
      {
        id: "call-number",
        text: {
          en: "Call Rahul immediately to stop power cut",
          kn: "ಕರೆಂಟ್ ಕಟ್ ತಪ್ಪಿಸಲು ತಕ್ಷಣ ರಾಹುಲ್‌ಗೆ ಕರೆ ಮಾಡಿ",
          hi: "बिजली कटने से बचाने के लिए तुरंत राहुल को कॉल करें"
        },
        isCorrect: false,
        feedback: {
          en: "DANGER! Calling this number will connect you to a scammer who will ask you to install AnyDesk or pay ₹10 to steal your bank money.",
          kn: "ಅಪಾಯ! ಈ ನಂಬರ್‌ಗೆ ಕರೆ ಮಾಡಿದರೆ ಅವರು ನಿಮ್ಮ ಫೋನ್ ಹ್ಯಾಕ್ ಮಾಡುವ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ಹೇಳುತ್ತಾರೆ.",
          hi: "खतरा! यह नंबर ठग का है, वह आपसे स्क्रीन शेयर ऐप डलवाकर बैंक खाता खाली कर सकता है।"
        }
      },
      {
        id: "report-scam",
        text: {
          en: "Flag as Scam and check official bill portal independently",
          kn: "ಇದು ವಂಚನೆ ಎಂದು ಗುರುತಿಸಿ ಅಧಿಕೃತ ಆ್ಯಪ್‌ನಲ್ಲಿ ಬಿಲ್ ಪರಿಶೀಲಿಸಿ",
          hi: "इसे फर्जी घोषित करें और आधिकारिक पोर्टल पर खुद बिल जांचें"
        },
        isCorrect: true,
        feedback: {
          en: "EXCELLENT! You spotted the red flags. You saved your family from an extortion trap.",
          kn: "ಅದ್ಭುತ! ನೀವು ಸರಿಯಾಗಿ ವಂಚನೆಯನ್ನು ಗುರುತಿಸಿದ್ದೀರಿ. ನಿಮ್ಮ ಕುಟುಂಬ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
          hi: "बहुत बढ़िया! आपने लाल झंडे पहचान लिए। आप धोखाधड़ी से बच गए।"
        }
      }
    ]
  },
  {
    id: "sim-sbi-kyc-freeze",
    title: {
      en: "SBI YONO Account Blocked - APK Download Scam",
      kn: "ಬ್ಯಾಂಕ್ ಖಾತೆ ಬ್ಲಾಕ್ - ಎಸ್‌ಬಿಐ ಕೆವೈಸಿ ವಂಚನೆ",
      hi: "एसबीआई बैंक खाता बंद होने का फर्जी संदेश"
    },
    threatType: "Banking Phishing & Malicious APK",
    sender: "BZ-ALERT (Spoofed Title)",
    messageBody: {
      en: "Dear SBI User, your YONO account has been suspended today due to expired PAN card. Please update immediately by clicking http://sbi-kyc-update.apk to avoid permanent closure.",
      kn: "ಎಸ್‌ಬಿಐ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಅವಧಿ ಮುಗಿದ ಕಾರಣ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದೆ. ಶಾಶ್ವತವಾಗಿ ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಲು ತಕ್ಷಣ http://sbi-kyc-update.apk ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
      hi: "प्रिय एसबीआई ग्राहक, पैन कार्ड अपडेट न होने से आपका खाता बंद कर दिया गया है। तुरंत चालू करने के लिए http://sbi-kyc-update.apk पर क्लिक करें।"
    },
    redFlags: [
      {
        flag: "The link ends in '.apk' - this downloads an undetectable spy software onto your smartphone.",
        kn: "ಲಿಂಕ್ ಕೊನೆಯಲ್ಲಿ '.apk' ಇದೆ - ಇದು ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ವರ್ಡ್ ಕದಿಯುವ ಅಪಾಯಕಾರಿ ಸಾಫ್ಟ್‌ವೇರ್.",
        hi: "लिंक के अंत में '.apk' लिखा है - यह वायरस ऐप डाउनलोड करके आपके बैंक के पैसे चुरा सकता है।"
      },
      {
        flag: "Official banks never distribute software via SMS links; only through Google Play Store.",
        kn: "ಬ್ಯಾಂಕ್‌ಗಳು ಗೂಗಲ್ ಪ್ಲೇ ಸ್ಟೋರ್ ಹೊರತುಪಡಿಸಿ ಮೆಸೇಜ್ ಲಿಂಕ್ ಮೂಲಕ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಹೇಳುವುದಿಲ್ಲ.",
        hi: "बैंक कभी भी SMS लिंक से ऐप डाउनलोड करने को नहीं कहते।"
      }
    ],
    audioExplanation: {
      en: "Careful! Banks will never ask you to download software from an SMS link. If you ever doubt your account status, walk into your local branch peacefully or call the helpline printed on the back of your passbook.",
      kn: "ಎಚ್ಚರ! ಬ್ಯಾಂಕ್‌ಗಳು ಎಂದಿಗೂ ಮೆಸೇಜ್‌ನಲ್ಲಿ ಲಿಂಕ್ ಕಳುಹಿಸಿ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಹೇಳುವುದಿಲ್ಲ. ಅನುಮಾನವಿದ್ದರೆ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ನೇರವಾಗಿ ಭೇಟಿ ನೀಡಿ.",
      hi: "सावधान! बैंक कभी भी मैसेज में लिंक भेजकर कोई फाइल डाउनलोड करने के लिए नहीं कहते।"
    },
    choices: [
      {
        id: "click-apk",
        text: {
          en: "Click the APK link to quickly update PAN",
          kn: "ಪ್ಯಾನ್ ಅಪ್‌ಡೇಟ್ ಮಾಡಲು ತಕ್ಷಣ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ",
          hi: "पैन अपडेट करने के लिए तुरंत लिंक पर क्लिक करें"
        },
        isCorrect: false,
        feedback: {
          en: "CRITICAL RISK! Clicking this APK would allow scammers to read all your incoming bank OTPs silently in the background.",
          kn: "ತೀವ್ರ ಅಪಾಯ! ಈ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿದರೆ ನಿಮ್ಮ ಎಲ್ಲ ಬ್ಯಾಂಕ್ ಒಟಿಪಿಗಳು ಕಳ್ಳರ ಕೈಸೇರುತ್ತವೆ.",
          hi: "गंभीर खतरा! इस फाइल को डाउनलोड करते ही आपके फोन के सारे गुप्त OTP ठगों के पास चले जाते।"
        }
      },
      {
        id: "verify-branch",
        text: {
          en: "Ignore the link and check passbook or visit local branch",
          kn: "ಲಿಂಕ್ ನಿರ್ಲಕ್ಷಿಸಿ ಬ್ಯಾಂಕ್ ಶಾಖೆಯಲ್ಲಿ ಅಥವಾ ಪಾಸ್‌ಬುಕ್‌ನಲ್ಲಿ ವಿಚಾರಿಸಿ",
          hi: "लिंक को अनदेखा करें और अपनी बैंक शाखा में जाकर पता करें"
        },
        isCorrect: true,
        feedback: {
          en: "PERFECT! You defended your bank savings by rejecting an unauthorized software download.",
          kn: "ಅತ್ಯುತ್ತಮ! ನಕಲಿ ಲಿಂಕ್ ತಿರಸ್ಕರಿಸಿ ನಿಮ್ಮ ಹಣವನ್ನು ಕಾಪಾಡಿಕೊಂಡಿದ್ದೀರಿ.",
          hi: "उत्कृष्ट! आपने फर्जी लिंक को ठुकराकर अपनी जीवन भर की कमाई बचा ली।"
        }
      }
    ]
  },
  {
    id: "sim-upi-lottery-collect",
    title: {
      en: "₹25,000 Cash Prize - UPI PIN Trap",
      kn: "₹25,000 ಲಾಟರಿ ಬಹುಮಾನ - ಯುಪಿಐ ಪಿನ್ ಬಲೆ",
      hi: "₹25,000 का इनाम - यूपीआई पिन का जाल"
    },
    threatType: "Collect Request Trap",
    sender: "LuckyDraw_Winner (WhatsApp)",
    messageBody: {
      en: "Congratulations! You won ₹25,000 in Diwali Mega Scheme. We have sent a request of ₹25,000 to your PhonePe. Accept and enter your 6-digit UPI PIN now to receive the cash directly into your bank.",
      kn: "ಅಭಿನಂದನೆಗಳು! ನೀವು ದೀಪಾವಳಿ ಯೋಜನೆಯಲ್ಲಿ ₹25,000 ಗೆದ್ದಿದ್ದೀರಿ. ನಿಮ್ಮ ಫೋನ್‌ಪೇಗೆ ₹25,000 ರಿಕ್ವೆಸ್ಟ್ ಕಳುಹಿಸಲಾಗಿದೆ. ಹಣ ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮೆಯಾಗಲು ತಕ್ಷಣ 6 ಅಂಕಿಯ ಯುಪಿಐ ಪಿನ್ ನಮೂದಿಸಿ.",
      hi: "बधाई हो! आपने ₹25,000 का नकद इनाम जीता है। आपके फोनपे पर ₹25,000 का अनुरोध भेजा गया है। पैसे पाने के लिए तुरंत अपना 6 अंकों का यूपीआई पिन डालें।"
    },
    redFlags: [
      {
        flag: "GOLDEN RULE: You NEVER enter your UPI PIN to receive money. PIN is solely used for deducting money.",
        kn: "ಚಿನ್ನದಂತಹ ನಿಯಮ: ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ ಪಿನ್ ಬೇಕಿಲ್ಲ! ಪಿನ್ ಹಾಕಿದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕಡಿತವಾಗುತ್ತದೆ.",
        hi: "सुनेहरा नियम: पैसे पाने के लिए कभी पिन नहीं डालना होता। पिन डालते ही आपके पैसे कट जाएंगे।"
      },
      {
        flag: "Free prize schemes you never bought tickets for are always 100% scams.",
        kn: "ನೀವು ಭಾಗವಹಿಸದ ಯಾವುದೇ ಸ್ಪರ್ಧೆಯಲ್ಲೂ ಹಣ ಗೆಲ್ಲಲು ಸಾಧ್ಯವಿಲ್ಲ.",
        hi: "जिस लॉटरी का टिकट आपने कभी खरीदा ही नहीं, उसमें इनाम कभी नहीं मिल सकता।"
      }
    ],
    audioExplanation: {
      en: "Remember our golden rule: If anyone asks you to enter your UPI PIN to receive a prize or refund, they are trying to rob your account. Never enter your PIN for receiving money.",
      kn: "ನಮ್ಮ ನಿಯಮ ನೆನಪಿಡಿ: ಯಾರಾದರೂ ಬಹುಮಾನ ಅಥವಾ ರಿಫಂಡ್ ನೀಡಲು ಪಿನ್ ಕೇಳಿದರೆ ಅದು ಖಂಡಿತ ಮೋಸ. ಹಣ ಪಡೆಯಲು ಪಿನ್ ಅಗತ್ಯವಿಲ್ಲ.",
      hi: "हमारा नियम हमेशा याद रखें: इनाम पाने के लिए कोई पिन नहीं लगता। पिन डालने का मतलब है पैसे भेजना।"
    },
    choices: [
      {
        id: "enter-pin",
        text: {
          en: "Enter UPI PIN to receive the ₹25,000 prize",
          kn: "ಹಣ ಪಡೆಯಲು 6 ಅಂಕಿಯ ಪಿನ್ ನಮೂದಿಸಿ",
          hi: "इनाम के ₹25,000 पाने के लिए यूपीआई पिन डालें"
        },
        isCorrect: false,
        feedback: {
          en: "TRAPPED! Entering your PIN would immediately deduct ₹25,000 from YOUR bank account, not add it.",
          kn: "ಬಲೆಗೆ ಬಿದ್ದಿರಿ! ಪಿನ್ ಹಾಕಿದ್ದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದಲೇ ₹25,000 ಕಡಿತವಾಗುತ್ತಿತ್ತು.",
          hi: "धोखा हो गया! पिन डालते ही आपके अपने खाते से ₹25,000 कट जाते।"
        }
      },
      {
        id: "decline-request",
        text: {
          en: "Decline the request: 'I never enter PIN to receive money'",
          kn: "ರಿಕ್ವೆಸ್ಟ್ ತಿರಸ್ಕರಿಸಿ: 'ಹಣ ಪಡೆಯಲು ನಾನು ಪಿನ್ ಹಾಕುವುದಿಲ್ಲ'",
          hi: "अनुरोध अस्वीकार करें: 'पैसे पाने के लिए मैं कभी पिन नहीं डालूंगा'"
        },
        isCorrect: true,
        feedback: {
          en: "CHAMPION! You remembered the fundamental law of digital payments in India. You are completely safe.",
          kn: "ಶಾಬಾಷ್! ಯುಪಿಐ ನಿಯಮವನ್ನು ನೆನಪಿನಲ್ಲಿಟ್ಟುಕೊಂಡು ಮೋಸ ಹೋಗುವುದನ್ನು ತಡೆದಿದ್ದೀರಿ.",
          hi: "शाबाश! आपने डिजिटल लेन-देन का सबसे बड़ा नियम याद रखा और अपना नुकसान बचा लिया।"
        }
      }
    ]
  }
];
