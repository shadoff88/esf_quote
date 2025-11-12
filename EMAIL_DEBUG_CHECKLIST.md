# Email Integration Debug Checklist

## Issue: Emails not being sent or received after form submission

---

## ✅ **Checklist to Diagnose the Problem**

### **1. Browser Console Logs** 🔍
**Action:** Open browser DevTools (F12) → Console tab → Submit form

**Look for:**
- ✅ `📧 Sending email with X attachment(s)...`
- ✅ `✅ Documents email sent successfully`
- ❌ `❌ Error sending documents email:` (indicates failure)
- ❌ `⚠️ Email sending failed (non-critical):` (indicates Netlify function error)

**What to check:**
```javascript
// If you see this error in console:
"❌ Error sending documents email: Failed to fetch"
// This means the Netlify function isn't deployed or accessible

// If you see this error:
"❌ Error sending documents email: Email sending failed"
// This means Mandrill API returned an error
```

**Test steps:**
1. Open: https://esf-quote.netlify.app
2. Open DevTools Console (F12)
3. Complete and submit a quote
4. Watch for email-related console logs
5. Take screenshot of any errors

---

### **2. Netlify Function Deployment** 🚀
**Action:** Verify function is deployed in Netlify

**Check:**
1. Go to: https://app.netlify.com/sites/esf-quote/functions
2. Look for function: `send-documents-email`
3. Check deployment status: Should show "Active" or "Deployed"

**If function is missing:**
- Netlify may not have detected the function
- Check that `netlify/functions/send-documents-email.js` exists in GitHub
- Redeploy site manually: Netlify Dashboard → Deploys → Trigger deploy

**Test function directly:**
```bash
# Try accessing function URL directly (will return 405 for GET, but confirms it exists)
curl https://esf-quote.netlify.app/.netlify/functions/send-documents-email
# Expected: {"error":"Method not allowed"} (this is good - means function exists)
```

---

### **3. Mandrill API Key Configuration** 🔑
**Action:** Verify API key is set and valid

**Check Netlify Environment Variables:**
1. Go to: https://app.netlify.com/sites/esf-quote/configuration/env
2. Confirm variable exists: `MANDRILL_API`
3. Check value format: Should be like `md-XXXXXXXXXXXXXXXXXXXXXXXX`

**Common issues:**
- ❌ Variable name typo: Must be exactly `MANDRILL_API` (not MANDRILL_KEY, etc.)
- ❌ API key has extra spaces (copy-paste error)
- ❌ API key is expired or revoked
- ❌ Variable not set for production environment

**Test Mandrill API key validity:**
1. Go to: https://mandrillapp.com/settings/index
2. Check API key status: Should show "Active"
3. Try regenerating key if needed (update Netlify env var after)

---

### **4. Netlify Function Logs** 📝
**Action:** Check real-time logs for errors

**Steps:**
1. Go to: https://app.netlify.com/sites/esf-quote/logs/functions
2. Submit a test quote
3. Look for `send-documents-email` function logs

**Common error messages:**

**Error: "Missing MANDRILL_API environment variable"**
- ❌ Environment variable not set in Netlify
- ✅ Fix: Add `MANDRILL_API` in Netlify Dashboard → Site settings → Environment variables

**Error: "Invalid API key"**
- ❌ API key is wrong, expired, or has typo
- ✅ Fix: Get new key from Mandrill, update Netlify env var

**Error: "Email rejected: sender-not-allowed"**
- ❌ From address (contact_form@easyfreight.co.nz) not verified in Mandrill
- ✅ Fix: Verify domain in Mandrill → Settings → Sending Domains

**Error: "Error code: ETIMEDOUT"**
- ❌ Netlify function can't reach Mandrill API
- ✅ Fix: Usually temporary, retry. Check Mandrill status page.

---

### **5. Mandrill Email Domain Authorization** 📧
**Action:** Verify sending domain is authorized

**Check:**
1. Login to Mandrill: https://mandrillapp.com/settings/sending-domains
2. Look for domain: `easyfreight.co.nz`
3. Status should show: ✅ **Verified**

**If domain not verified:**
1. Add domain in Mandrill → Sending Domains
2. Add DNS records (SPF, DKIM) to your domain
3. Wait for verification (can take up to 48 hours)

**Test from address:**
- Email uses: `contact_form@easyfreight.co.nz`
- This domain MUST be verified in Mandrill
- You cannot send from unverified domains

---

### **6. Network Request Inspection** 🌐
**Action:** Monitor actual HTTP request to Netlify function

**Steps:**
1. Open DevTools (F12) → Network tab
2. Filter: "send-documents-email"
3. Submit form
4. Click on `send-documents-email` request

**Check:**
- **Status Code:** Should be `200 OK`
  - If `404`: Function not deployed
  - If `500`: Function error (check logs)
  - If `Failed`: CORS or network issue

- **Response Body:** Should contain:
  ```json
  {
    "success": true,
    "message": "Email sent successfully",
    "messageId": "...",
    "status": "sent"
  }
  ```

- **Request Payload:** Check if data is correct:
  ```json
  {
    "formData": {...},
    "submissionSummary": "<html>...",
    "attachments": [...],
    "quoteReference": "..."
  }
  ```

---

### **7. Email Spam/Junk Folder** 📬
**Action:** Check if emails are being filtered

**Check:**
1. Check documents@easyfreight.co.nz inbox
2. **Check SPAM/JUNK folder** (very common!)
3. Check email filters/rules
4. Check quarantine (if using email security service)

**If in spam:**
- Add contact_form@easyfreight.co.nz to safe senders
- Check email headers to see why it was marked as spam
- Configure SPF/DKIM/DMARC properly in Mandrill

---

### **8. Mandrill Account Status** 💳
**Action:** Verify Mandrill account is active and has quota

**Check:**
1. Go to: https://mandrillapp.com/settings/index
2. Check account status: Should be "Active"
3. Check email quota: Should have remaining sends

**Common issues:**
- ❌ Free trial expired
- ❌ Monthly quota exceeded
- ❌ Payment failed
- ❌ Account suspended

---

## 🔧 **Quick Test Script**

Run this in browser console after opening the form:
```javascript
// Test email function directly
async function testEmail() {
    const testPayload = {
        formData: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '123456789',
            company_name: 'Test Co'
        },
        submissionSummary: '<h1>Test Email</h1><p>This is a test.</p>',
        attachments: [],
        quoteReference: 'TEST-' + Date.now()
    };
    
    try {
        const response = await fetch('/.netlify/functions/send-documents-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            console.log('✅ Email sent successfully!');
        } else {
            console.error('❌ Email failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

// Run test
testEmail();
```

---

## 📊 **Most Likely Causes (Ranked)**

1. **🥇 Netlify function not deployed** (40% probability)
   - Solution: Trigger manual redeploy in Netlify Dashboard

2. **🥈 Mandrill API key not set or invalid** (30% probability)
   - Solution: Check env var name is exactly `MANDRILL_API`
   - Solution: Verify key is correct in Mandrill dashboard

3. **🥉 Email domain not verified in Mandrill** (15% probability)
   - Solution: Verify easyfreight.co.nz in Mandrill sending domains

4. **Email in spam folder** (10% probability)
   - Solution: Check junk/spam folder

5. **Mandrill account issue** (5% probability)
   - Solution: Check account status and quota

---

## 📞 **Next Steps**

**Priority 1: Check Browser Console**
- Open form → Submit → Check DevTools Console
- Report what logs you see (especially errors)

**Priority 2: Check Netlify Function Logs**
- Go to Netlify Functions logs
- Submit test form
- Report any errors in logs

**Priority 3: Verify Environment Variable**
- Screenshot Netlify env vars page
- Confirm `MANDRILL_API` exists and has value

**Share with me:**
1. Browser console logs (screenshot)
2. Netlify function logs (screenshot)
3. Network tab request/response (screenshot)
4. Mandrill account status (screenshot)

This will help me pinpoint the exact issue! 🎯
