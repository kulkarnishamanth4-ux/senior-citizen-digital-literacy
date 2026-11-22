/**
 * Dual-Stream Call & Screen Guardian Service
 * Intercepts active elder coercion by cross-referencing call audio transcripts
 * with concurrent screen actions (like OTP receipt or UPI PIN entry).
 */

class DualStreamGuardianService {
  constructor() {
    this.threatThreshold = 75; // percentage score to trigger emergency shield
    this.activeShield = false;
    this.listeners = new Set();
    this.caregiverAlerts = [];

    // Load persisted alerts
    try {
      const stored = localStorage.getItem('guardian_caregiver_alerts');
      if (stored) {
        this.caregiverAlerts = JSON.parse(stored);
      }
    } catch (e) {}
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(state) {
    this.listeners.forEach(cb => cb(state));
  }

  /**
   * Evaluates the Dual Stream Threat Correlation Matrix
   * @param {Object} callStream - { callerNumber, callerName, transcript, isUrgent }
   * @param {Object} screenStream - { activeApp, isOTPVisible, otpDigits, isUPIPINActive, isAPKInstalling }
   */
  evaluateStreams(callStream, screenStream) {
    let callScore = 0;
    let screenScore = 0;
    const detectedFlags = [];

    // 1. Analyze Call Stream
    const callText = (callStream.transcript || '').toLowerCase();
    const urgentKeywords = [
      'police', 'cbi', 'arrest', 'digital arrest', 'jail',
      'electricity cut', 'power cut', 'disconnect', 'immediately',
      'within 10 minutes', 'within 1 hour', 'account blocked',
      'yono', 'pan card', 'anydesk', 'teamviewer', 'quicksupport', 'otp'
    ];

    urgentKeywords.forEach(kw => {
      if (callText.includes(kw)) {
        callScore += 20;
        detectedFlags.push(`Call: High-pressure keyword detected ('${kw}')`);
      }
    });

    if (callStream.callerNumber && !callStream.isKnownContact) {
      callScore += 15;
      detectedFlags.push('Call: Unknown incoming caller number');
    }

    // 2. Analyze Screen Stream
    if (screenStream.isOTPVisible) {
      screenScore += 45;
      detectedFlags.push('Screen: Incoming SMS OTP displayed on screen');
    }
    if (screenStream.isUPIPINActive) {
      screenScore += 40;
      detectedFlags.push('Screen: UPI PIN entry screen currently open');
    }
    if (screenStream.isAPKInstalling) {
      screenScore += 50;
      detectedFlags.push('Screen: External APK installer triggered');
    }

    // Combined Threat Score (Cross-Modal Multiplier)
    let totalScore = Math.min(100, callScore + screenScore);
    const isCoercion = (callScore >= 35 && screenScore >= 40);

    const evaluationResult = {
      timestamp: new Date().toISOString(),
      threatScore: totalScore,
      isEmergencyTriggered: isCoercion || totalScore >= this.threatThreshold,
      detectedFlags,
      maskedOTP: screenStream.isOTPVisible ? '•••••• (MASKED BY GUARDIAN)' : null,
      callStream,
      screenStream
    };

    if (evaluationResult.isEmergencyTriggered) {
      this.triggerEmergencyInterception(evaluationResult);
    }

    this.notify(evaluationResult);
    return evaluationResult;
  }

  triggerEmergencyInterception(event) {
    this.activeShield = true;

    const alertItem = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      caller: event.callStream.callerNumber || 'Unknown Caller',
      reason: event.detectedFlags.join(' | '),
      riskLevel: 'CRITICAL COERCION INTERCEPTED',
      status: 'BLOCKED & MASKED'
    };

    this.caregiverAlerts.unshift(alertItem);
    try {
      localStorage.setItem('guardian_caregiver_alerts', JSON.stringify(this.caregiverAlerts));
    } catch (e) {}

    // Dispatch silent alert to Caregiver
    this.notify({
      type: 'EMERGENCY_SHIELD_ACTIVATED',
      data: alertItem
    });
  }

  dismissEmergencyShield() {
    this.activeShield = false;
    this.notify({
      type: 'EMERGENCY_SHIELD_DISMISSED'
    });
  }

  getCaregiverAlerts() {
    return this.caregiverAlerts;
  }

  clearAlerts() {
    this.caregiverAlerts = [];
    localStorage.removeItem('guardian_caregiver_alerts');
    this.notify({ type: 'ALERTS_CLEARED' });
  }
}

export const guardianService = new DualStreamGuardianService();
