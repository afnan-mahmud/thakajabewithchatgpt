# Chat Safety & Contact Information Protection

## Overview

The Thaka Jabe messaging system now includes comprehensive protection to prevent users and hosts from sharing contact information. This ensures all communication stays on the platform for safety, security, and proper transaction tracking.

---

## 🔒 Security Features

### What is Blocked

The system automatically detects and blocks messages containing:

#### 1. Phone Numbers
- ✅ **Standard Format**: `01712345678`, `01812345678`
- ✅ **International Format**: `+8801712345678`, `8801712345678`
- ✅ **Bangla Digits**: `০১৭১২৩৪৫৬৭৮`
- ✅ **Obfuscated Format**: `0 1 7 1 2 3 4 5 6 7 8`, `01-71-234-5678`
- ✅ **With Spaces/Hyphens**: `017 1234 5678`, `017-1234-5678`

#### 2. Email Addresses
- ✅ Any email format: `example@gmail.com`, `user.name@example.com`

#### 3. URLs & Websites
- ✅ Full URLs: `https://example.com`, `http://website.com`
- ✅ WWW URLs: `www.example.com`
- ✅ Domain names: `example.com`, `website.bd`

#### 4. Social Media Handles
- ✅ Any `@username` format

#### 5. Contact-Related Phrases
- ✅ "call me"
- ✅ "phone me"
- ✅ "whatsapp me"
- ✅ "text me"
- ✅ "email me"
- ✅ "contact me at"
- ✅ "reach me at"
- ✅ "my number"
- ✅ "my phone"
- ✅ "my email"

#### 6. Bangla Contact Keywords
- ✅ ফোন (phone)
- ✅ নাম্বার (number)
- ✅ মোবাইল (mobile)
- ✅ ইমেইল (email)
- ✅ ওয়েবসাইট (website)
- ✅ যোগাযোগ (contact)

---

## 💻 Frontend Protection

### Location
`thakajabe/components/chat/ChatDrawer.tsx`

### Features

1. **Real-Time Validation**
   - Messages are validated before sending
   - User receives immediate feedback

2. **Error Display**
   - Clear error message showing why the message was blocked
   - Red alert with specific reason

3. **Safety Notice**
   - Visible reminder at bottom of chat
   - Blue info panel with shield icon
   - Text: "Keep communication on Thaka Jabe. Do not share phone numbers, emails, or external links for your safety."

4. **User Experience**
   - Error clears when user starts typing again
   - Message not sent if validation fails
   - No data leaves the browser

### Validation Function

```typescript
const containsContactInfo = (text: string): { isValid: boolean; reason?: string } => {
  // Checks for:
  // - Phone numbers (multiple formats)
  // - Emails
  // - URLs
  // - Social media handles
  // - Contact-related phrases
  
  return { isValid: true } or { isValid: false, reason: 'error message' };
};
```

---

## 🛡️ Backend Protection

### Locations
1. `/thaka_jabe-server/src/routes/chat.ts` - Main chat routes
2. `/thaka_jabe-server/src/routes/messages.ts` - Additional message routes
3. `/thaka_jabe-server/src/utils/sanitizer.ts` - Core sanitization logic

### Multi-Layer Security

#### Layer 1: User Messages (`/api/chat/messages`)
- Sanitizes all incoming messages
- Blocks and logs prohibited messages
- Does not send to Firebase if blocked
- Returns clear error to frontend

#### Layer 2: Host Messages (`/api/messages/threads/:threadId`)
- Same validation for host-sent messages
- Prevents hosts from sharing contact info
- Returns 400 error if blocked

#### Layer 3: Database
- Blocked messages can optionally be stored with `blocked: true` flag
- Includes reason for blocking
- Useful for moderation and analytics

### Sanitizer Utility

**File**: `thaka_jabe-server/src/utils/sanitizer.ts`

**Comprehensive Detection**:
- Multiple phone number patterns
- Email regex
- URL patterns (http, https, www, domain)
- Bangla digit conversion
- Obfuscation detection
- Context-aware Bangla word checking

**Example Usage**:
```typescript
import { sanitizeText } from '../utils/sanitizer';

const result = sanitizeText(messageText);
if (!result.clean) {
  // Block message
  console.log(`Blocked: ${result.reason}`);
}
```

---

## 🎨 User Interface

### Chat Drawer Components

#### Header
- "Chat" title with message icon
- Close button (X)

#### Safety Notice (New)
```
🛡️ Safety First
Keep communication on Thaka Jabe. Do not share phone numbers, 
emails, or external links for your safety.
```
- Blue background (`bg-blue-50`)
- Shield icon
- Always visible at bottom

#### Error Alert (New)
```
⚠️ Message Blocked
[Specific reason why message was blocked]
```
- Red background (`bg-red-50`)
- Warning triangle icon
- Only shows when validation fails
- Dismisses when user types

#### Message Input
- Standard text input
- Send button
- Disabled when sending
- Validates on submit

---

## 🧪 Testing

### Test Cases

#### Should Be BLOCKED ❌

```javascript
"01712345678"                          // Phone number
"Call me at 01712345678"              // Phone with phrase
"০১৭১২৩৪৫৬৭৮"                          // Bangla digits
"test@example.com"                    // Email
"Visit https://example.com"           // URL
"www.example.com"                     // WWW URL
"0 1 7 1 2 3 4 5 6 7 8"              // Spaced phone
"0-1-7-1-2-3-4-5-6-7-8"              // Hyphenated phone
"ফোন 01712345678"                    // Bangla + phone
"ইমেইল test@example.com"             // Bangla + email
"ওয়েবসাইট www.example.com"          // Bangla + URL
"নাম্বার ০১৭১২৩৪৫৬৭৮"                  // Bangla + Bangla phone
"WhatsApp me"                         // Contact phrase
"@username"                           // Social media
"email me at xyz"                     // Contact phrase
```

#### Should Be ALLOWED ✅

```javascript
"Hello world"                         // Normal text
"This is a normal message"            // Normal text
"I will call you later"               // Future tense (no number)
"ফোন কল করব"                         // Bangla without number
"আমি তোমাকে দেখব"                     // Bangla normal
"The price is 5000 taka"             // Price (not phone)
"Room number 101"                     // Room number (short)
"Available in 2 days"                 // Normal number
"I have 3 children"                   // Normal number
```

### Manual Testing

1. **Frontend Test**
   ```bash
   # Start frontend
   cd thakajabe
   npm run dev
   ```
   - Go to any room detail page
   - Click "Contact Host"
   - Try sending: "Call me at 01712345678"
   - Should see red error: "Phone numbers are not allowed in messages"

2. **Backend Test**
   ```bash
   # Start backend
   cd thaka_jabe-server
   pnpm dev
   ```
   - Use Postman/curl to send message with phone number
   - Should receive 400 error

---

## 📊 Analytics & Monitoring

### Blocked Messages

Backend logs all blocked attempts:
```javascript
console.log(`[CHAT] Message blocked: ${reason}`);
```

### Database Tracking

Optionally store blocked messages:
```javascript
{
  threadId: ObjectId,
  senderRole: 'user' | 'host',
  text: originalText,
  blocked: true,
  reason: 'contact-info',
  createdAt: Date
}
```

### Monitoring Points

1. **Block Rate**
   - Track how many messages are blocked
   - High rate might indicate user confusion

2. **Common Patterns**
   - Which types of contact info are most common
   - Adjust UI messaging accordingly

3. **User Behavior**
   - Users repeatedly trying to share contact info
   - May need additional education/warnings

---

## 🔄 User Flow

### Happy Path (Normal Message)

```
User types: "When can I check in?"
     ↓
Frontend validates ✅
     ↓
Sends to backend
     ↓
Backend sanitizes ✅
     ↓
Saves to database
     ↓
Pushes to Firebase
     ↓
Host receives message ✅
```

### Blocked Path (Contact Info)

```
User types: "Call me at 01712345678"
     ↓
Frontend validates ❌
     ↓
Shows error: "Phone numbers are not allowed"
     ↓
Message NOT sent
     ↓
User sees red alert
     ↓
User edits message and tries again
```

---

## 🎯 Best Practices

### For Users

1. **Use the Platform**
   - All communication should happen in chat
   - Booking details are in booking history

2. **What to Discuss**
   - ✅ Check-in/check-out times
   - ✅ Room amenities
   - ✅ House rules
   - ✅ Directions (without personal contact)
   - ✅ Payment confirmation

3. **What NOT to Share**
   - ❌ Phone numbers
   - ❌ Email addresses
   - ❌ WhatsApp/Telegram handles
   - ❌ Social media profiles
   - ❌ External booking links

### For Hosts

1. **Professional Communication**
   - Keep all guest communication on platform
   - Use automated messages for common questions

2. **After Booking Confirmed**
   - Booking details page shows contact if needed
   - Platform handles payment and disputes

---

## 🚨 Edge Cases

### 1. Legitimate Numbers

**Problem**: User wants to say "Room 1017" or "Price 10000 taka"

**Solution**: Sanitizer checks for valid phone formats (11 digits starting with 01)
- "1017" → ✅ Allowed (only 4 digits)
- "10000" → ✅ Allowed (not phone format)

### 2. False Positives

**Problem**: "I'll arrive at 10 13" might be detected as phone

**Solution**: Pattern requires consecutive/near-consecutive digits
- "10 13" → ✅ Allowed (too few digits, not phone format)

### 3. Bangla Numbers

**Problem**: "দাম ৫০০০ টাকা" (Price 5000 taka)

**Solution**: Checks context for contact words
- If "ফোন" or "নাম্বার" near digits → ❌ Blocked
- Just price → ✅ Allowed

### 4. International Guests

**Problem**: Guest from another country with different phone format

**Solution**: Pattern focuses on Bangladesh numbers
- Other formats less likely to be detected
- May add international patterns in future

---

## 🔐 Security Benefits

### 1. Platform Integrity
- All transactions trackable
- Disputes can be resolved with message history

### 2. User Safety
- Prevents scams
- Reduces off-platform payments (commission loss)
- Protects user privacy

### 3. Trust & Reviews
- Users must complete bookings on platform
- Verified reviews only from platform bookings

### 4. Legal Protection
- Messages logged for disputes
- Clear communication history
- Platform terms of service enforced

---

## 📱 Mobile Experience

- Safety notice visible without scrolling
- Error messages touch-friendly
- Clear icons (shield, warning triangle)
- Accessible font sizes
- Red/blue color coding for alerts

---

## 🌐 Internationalization

### Current Support
- ✅ English
- ✅ Bangla (বাংলা)

### Future Enhancement
- Add more regional languages
- Localized error messages
- Multi-language contact word detection

---

## 🛠️ Maintenance

### Adding New Patterns

**Frontend**: Update `containsContactInfo` function in `ChatDrawer.tsx`

**Backend**: Update patterns in `thaka_jabe-server/src/utils/sanitizer.ts`

### Testing New Patterns

Run the test suite:
```typescript
import { testSanitizer } from './utils/sanitizer';
testSanitizer();
```

### Performance

- Pattern matching is O(n) where n = message length
- Typical message: < 200 characters
- Validation time: < 5ms
- No impact on user experience

---

## 📈 Future Enhancements

### 1. AI/ML Detection
- Use machine learning to detect obfuscated contact info
- Pattern: "zero one seven one two three..."

### 2. Smart Warnings
- Show warning before blocking
- "This looks like a phone number. Are you sure?"

### 3. Alternative Communication
- Verified phone reveal after booking confirmed
- Time-limited contact window

### 4. Reporting
- Users can report hosts trying to circumvent
- Automatic pattern learning from reports

### 5. Localization
- Detect more languages
- Regional phone formats

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Legitimate message blocked

**Solution**: 
1. Check if message contains numbers that look like phone
2. Rephrase without suspicious patterns
3. Contact support if persistent

**Issue**: User complains they can't share contact

**Response**:
- This is by design for security
- All communication should be on platform
- Contact info shared after booking confirmed (if needed)

---

## ✅ Checklist

Implementation complete:

- [x] Frontend validation in ChatDrawer
- [x] Backend validation in chat routes
- [x] Backend validation in message routes
- [x] Comprehensive sanitizer utility
- [x] User-friendly error messages
- [x] Safety notice displayed
- [x] Phone number detection (multiple formats)
- [x] Email detection
- [x] URL detection
- [x] Bangla support
- [x] Obfuscation detection
- [x] Social media handle detection
- [x] Contact phrase detection
- [x] Mobile-responsive UI
- [x] Documentation complete

---

## 📝 Summary

The Thaka Jabe chat system now provides **comprehensive protection** against contact information sharing, ensuring:

✅ **User Safety** - Prevents scams and off-platform deals  
✅ **Platform Integrity** - Keeps transactions traceable  
✅ **Legal Protection** - Message history for disputes  
✅ **Great UX** - Clear feedback and beautiful design  
✅ **Multi-Language** - Supports Bangla and English  

All communication stays safe, secure, and on the platform! 🎉

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0  
**Maintained By**: Thaka Jabe Development Team

