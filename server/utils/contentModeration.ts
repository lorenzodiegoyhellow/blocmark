import { storage } from "../storage";

interface ModerationResult {
  isViolation: boolean;
  violationType?: 'phone' | 'email' | 'both';
  detectedPatterns: string[];
  sanitizedContent: string;
  originalContent: string;
  confidence: number;
}

interface ModerationAlert {
  messageId: number;
  senderId: number;
  receiverId: number;
  locationId: number;
  violationType: string;
  detectedPatterns: string[];
  originalContent: string;
  sanitizedContent: string;
  timestamp: Date;
}

// Number words mapping for advanced detection
const numberWords: Record<string, string> = {
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
  'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
  'eighteen': '18', 'nineteen': '19', 'twenty': '20',
  'o': '0', // Common for phone numbers like "five-o-five"
};

// Common phone number area codes (US)
const commonAreaCodes = [
  '201', '202', '203', '205', '206', '207', '208', '209', '210', '212', '213', '214', '215',
  '216', '217', '218', '219', '224', '225', '227', '228', '229', '231', '234', '239', '240',
  '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '272', '276',
  '281', '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314',
  '315', '316', '317', '318', '319', '320', '321', '323', '325', '330', '331', '334', '336',
  '337', '339', '340', '341', '347', '351', '352', '360', '361', '364', '369', '380', '385',
  '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414',
  '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '440', '442', '443',
  '445', '447', '458', '463', '464', '469', '470', '475', '478', '479', '480', '484', '501',
  '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517',
  '518', '520', '530', '531', '534', '539', '540', '541', '551', '559', '561', '562', '563',
  '564', '567', '570', '571', '573', '574', '575', '580', '585', '586', '601', '602', '603',
  '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619',
  '620', '623', '626', '628', '629', '630', '631', '636', '641', '646', '650', '651', '657',
  '660', '661', '662', '667', '669', '678', '681', '682', '684', '689', '701', '702', '703',
  '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720',
  '724', '725', '727', '731', '732', '734', '737', '740', '743', '747', '754', '757', '760',
  '762', '763', '765', '769', '770', '772', '773', '774', '775', '779', '781', '785', '786',
  '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816',
  '817', '818', '828', '830', '831', '832', '838', '839', '840', '843', '845', '847', '848',
  '850', '854', '856', '857', '858', '859', '860', '862', '863', '864', '865', '870', '872',
  '878', '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915',
  '916', '917', '918', '919', '920', '925', '928', '929', '930', '931', '934', '936', '937',
  '938', '940', '941', '947', '949', '951', '952', '954', '956', '959', '970', '971', '972',
  '973', '978', '979', '980', '984', '985', '989'
];

// Email domain patterns
const commonEmailDomains = [
  'gmail', 'yahoo', 'hotmail', 'outlook', 'aol', 'icloud', 'mail', 'protonmail',
  'ymail', 'live', 'msn', 'me', 'mac', 'comcast', 'att', 'verizon', 'cox'
];

class ContentModerationService {
  /**
   * Convert text with number words to numeric format
   */
  private convertWordsToNumbers(text: string): string {
    let converted = text.toLowerCase();
    
    // Replace number words with digits
    Object.entries(numberWords).forEach(([word, digit]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      converted = converted.replace(regex, digit);
    });
    
    return converted;
  }

  /**
   * Normalize text for pattern matching
   */
  private normalizeText(text: string): string {
    let normalized = this.convertWordsToNumbers(text);
    
    // Remove common separators and spaces
    normalized = normalized.replace(/[\s\-\.\(\)\[\]\/\\,_+]/g, '');
    
    // Replace common substitutions
    normalized = normalized
      .replace(/[@]/g, 'a')
      .replace(/[!]/g, '1')
      .replace(/[$]/g, 's')
      .replace(/[&]/g, 'and');
    
    return normalized;
  }

  /**
   * Detect phone numbers with various patterns
   */
  private detectPhoneNumbers(text: string): string[] {
    const detectedNumbers: string[] = [];
    const normalizedText = this.normalizeText(text);
    const originalText = text.toLowerCase();
    
    // Pattern 1: Standard phone number formats
    const phonePatterns = [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 555-555-5555
      /\b\d{10}\b/g, // 5555555555
      /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // (555) 555-5555
      /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // +1-555-555-5555
      /\b\d{3}\.\d{3}\.\d{4}\b/g, // 555.555.5555
    ];
    
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        detectedNumbers.push(...matches);
      }
    });
    
    // Pattern 2: Check normalized text for 10-digit sequences
    const tenDigitPattern = /\d{10}/g;
    const normalizedMatches = normalizedText.match(tenDigitPattern);
    if (normalizedMatches) {
      normalizedMatches.forEach(match => {
        // Check if it starts with a valid area code
        const areaCode = match.substring(0, 3);
        if (commonAreaCodes.includes(areaCode)) {
          detectedNumbers.push(`Possible phone: ${match}`);
        }
      });
    }
    
    // Pattern 3: Detect spelled out numbers
    const spelledPatterns = [
      /\b(call|text|phone|contact|reach|dial|whatsapp|telegram|signal)\s+(me\s+)?(at\s+)?[\w\s\-\.]+/gi,
      /my\s+(number|phone|cell|mobile|contact)\s+(is\s+)?[\w\s\-\.]+/gi,
      /\b(nine|eight|seven|six|five|four|three|two|one|zero|o)[\s\-]+(nine|eight|seven|six|five|four|three|two|one|zero|o)/gi
    ];
    
    spelledPatterns.forEach(pattern => {
      const matches = originalText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const converted = this.convertWordsToNumbers(match);
          const digitMatch = converted.match(/\d{10,}/);
          if (digitMatch) {
            detectedNumbers.push(`Spelled out: "${match}"`);
          }
        });
      }
    });
    
    // Pattern 4: Detect intentionally obscured numbers
    const obscuredPatterns = [
      /\b\d\s*\d\s*\d[\s\-\.]*\d\s*\d\s*\d[\s\-\.]*\d\s*\d\s*\d\s*\d\b/g, // 5 5 5 - 5 5 5 - 5 5 5 5
      /\b\d{3}[^\d\w]{1,3}\d{3}[^\d\w]{1,3}\d{4}\b/g, // 555*555*5555
    ];
    
    obscuredPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        detectedNumbers.push(...matches.map(m => `Obscured: "${m}"`));
      }
    });
    
    return [...new Set(detectedNumbers)]; // Remove duplicates
  }

  /**
   * Detect email addresses with various patterns
   */
  private detectEmails(text: string): string[] {
    const detectedEmails: string[] = [];
    const normalizedText = this.normalizeText(text);
    
    // Pattern 1: Standard email formats
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b/g,
      /\b[A-Za-z0-9._%+-]+\[at\][A-Za-z0-9.-]+\[dot\][A-Z|a-z]{2,}\b/gi,
      /\b[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9.-]+\s+dot\s+[A-Z|a-z]{2,}\b/gi,
    ];
    
    emailPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        detectedEmails.push(...matches);
      }
    });
    
    // Pattern 2: Detect obscured emails
    const obscuredEmailPatterns = [
      /\b[\w._%+-]+\s*\(\s*at\s*\)\s*[\w.-]+\s*\(\s*dot\s*\)\s*\w{2,}\b/gi,
      /\b[\w._%+-]+\s*\[\s*at\s*\]\s*[\w.-]+\s*\[\s*dot\s*\]\s*\w{2,}\b/gi,
      /\b[\w._%+-]+\s*<at>\s*[\w.-]+\s*<dot>\s*\w{2,}\b/gi,
    ];
    
    obscuredEmailPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        detectedEmails.push(...matches.map(m => `Obscured: "${m}"`));
      }
    });
    
    // Pattern 3: Check for email domain mentions
    const domainPattern = new RegExp(
      `\\b(email|contact|reach|write)\\s+(me\\s+)?(at\\s+)?[\\w._%+-]+\\s*(at|@)?\\s*(${commonEmailDomains.join('|')})\\b`,
      'gi'
    );
    
    const domainMatches = text.match(domainPattern);
    if (domainMatches) {
      detectedEmails.push(...domainMatches.map(m => `Domain mention: "${m}"`));
    }
    
    return [...new Set(detectedEmails)]; // Remove duplicates
  }

  /**
   * Sanitize content by replacing detected patterns
   */
  private sanitizeContent(content: string, phoneNumbers: string[], emails: string[]): string {
    let sanitized = content;
    
    // Replace phone numbers with [PHONE REMOVED]
    phoneNumbers.forEach(phone => {
      // Extract just the actual phone number part if it's a detection description
      const actualPhone = phone.includes(':') ? phone.split(':')[1].trim().replace(/['"]/g, '') : phone;
      const phoneRegex = new RegExp(actualPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      sanitized = sanitized.replace(phoneRegex, '[PHONE REMOVED]');
    });
    
    // Replace emails with [EMAIL REMOVED]
    emails.forEach(email => {
      // Extract just the actual email part if it's a detection description
      const actualEmail = email.includes(':') ? email.split(':')[1].trim().replace(/['"]/g, '') : email;
      const emailRegex = new RegExp(actualEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      sanitized = sanitized.replace(emailRegex, '[EMAIL REMOVED]');
    });
    
    // Also replace common patterns that might not have been caught
    sanitized = sanitized
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE REMOVED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REMOVED]');
    
    return sanitized;
  }

  /**
   * Main moderation function
   */
  public moderateContent(content: string): ModerationResult {
    const phoneNumbers = this.detectPhoneNumbers(content);
    const emails = this.detectEmails(content);
    
    const hasViolation = phoneNumbers.length > 0 || emails.length > 0;
    let violationType: 'phone' | 'email' | 'both' | undefined;
    
    if (phoneNumbers.length > 0 && emails.length > 0) {
      violationType = 'both';
    } else if (phoneNumbers.length > 0) {
      violationType = 'phone';
    } else if (emails.length > 0) {
      violationType = 'email';
    }
    
    const detectedPatterns = [...phoneNumbers, ...emails];
    const sanitizedContent = this.sanitizeContent(content, phoneNumbers, emails);
    
    // Calculate confidence based on detection patterns
    let confidence = 0;
    if (phoneNumbers.length > 0) {
      confidence += phoneNumbers.some(p => !p.includes('Possible') && !p.includes('Spelled')) ? 90 : 70;
    }
    if (emails.length > 0) {
      confidence += emails.some(e => !e.includes('Obscured') && !e.includes('Domain')) ? 90 : 70;
    }
    if (confidence > 0) {
      confidence = Math.min(confidence / (violationType === 'both' ? 2 : 1), 100);
    }
    
    return {
      isViolation: hasViolation,
      violationType,
      detectedPatterns,
      sanitizedContent,
      originalContent: content,
      confidence
    };
  }

  /**
   * Create a moderation alert in the database
   */
  public async createModerationAlert(
    messageId: number,
    senderId: number,
    receiverId: number,
    locationId: number,
    moderationResult: ModerationResult
  ): Promise<void> {
    try {
      // Create the alert in the content_moderation_alerts table
      await storage.createContentModerationAlert({
        messageId,
        senderId,
        receiverId,
        locationId,
        violationType: moderationResult.violationType as 'phone' | 'email' | 'both',
        detectedPatterns: moderationResult.detectedPatterns,
        confidence: moderationResult.confidence,
        originalContentHash: Buffer.from(moderationResult.originalContent).toString('base64').substring(0, 64),
        resolved: false
      });
      
      // Store the alert in a new moderation_alerts table or as a notification
      await storage.createNotification({
        userId: receiverId, // Notify the receiver
        type: 'content_moderation_alert',
        title: 'Private Information Detected in Message',
        message: `A message from User #${senderId} was flagged for containing ${moderationResult.violationType} information.`,
        relatedId: messageId,
        relatedType: 'message',
        actionUrl: `/admin/dashboard?tab=conversations`,
        metadata: {
          messageId,
          senderId,
          receiverId,
          locationId,
          violationType: moderationResult.violationType,
          detectedPatterns: moderationResult.detectedPatterns,
          confidence: moderationResult.confidence,
          timestamp: new Date().toISOString()
        }
      });

      // Also create an admin notification
      const admins = await storage.getAllUsers();
      const adminUsers = admins.filter(u => u.roles.includes('admin'));
      
      for (const admin of adminUsers) {
        await storage.createNotification({
          userId: admin.id,
          type: 'admin_moderation_alert',
          title: 'Content Moderation Alert',
          message: `Private information detected in conversation between User #${senderId} and User #${receiverId}`,
          relatedId: messageId,
          relatedType: 'message',
          actionUrl: `/admin/dashboard?tab=conversations`,
          metadata: {
            messageId,
            senderId,
            receiverId,
            locationId,
            violationType: moderationResult.violationType,
            detectedPatterns: moderationResult.detectedPatterns,
            confidence: moderationResult.confidence,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      console.log(`Moderation alert created for message ${messageId}`);
    } catch (error) {
      console.error('Failed to create moderation alert:', error);
    }
  }
}

export const contentModerationService = new ContentModerationService();