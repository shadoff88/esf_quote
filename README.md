# Easy Freight Customs Clearance Quote Form

## Project Overview

**Purpose:** Intelligent multi-step customs clearance quote request form for Easy Freight customs brokers.

**Live URLs:**
- **Production (Netlify):** https://esfquote.netlify.app
- **GitHub Repository:** https://github.com/shadoff88/esf_quote
- **Development Sandbox:** [AI Developer Sandbox URL varies per session]

**Project Type:** Static HTML/CSS/JavaScript application with serverless backend integration

**Last Updated:** 9th November 2025

---

## ✨ Current Features

### Form Functionality
- **Intelligent Multi-Step Form** - Dynamic routing based on user responses
- **Real-time Validation** - Instant feedback on form fields
- **Session Persistence** - Zero data loss with localStorage backup
- **Responsive Design** - Mobile-optimised with TailwindCSS
- **Smart Routing Logic** - Automatically routes to urgent/standard/specialist/education pathways
- **Document Upload Interface** - Track document status (uploaded/not available)
- **Google Places Autocomplete** - NZ address validation for delivery locations
- **Container Calculator** - Modal calculator for container space estimation

### Quote Generation (NEW)
- **Dynamic Pricing Calculation** - Real-time calculation based on service requirements:
  - Base customs clearance: NZD $197
  - Customs Client Code application: +NZD $95 (if needed)
  - BIO Security clearance: +NZD $67 (for food/beverages)
  - GST (15%) calculated automatically
- **HTML Quote Capture** - Complete pricing breakdown captured as HTML
- **Quote Reference ID** - Unique identifier for each quote
- **Timestamp Recording** - Date and time of quote generation
- **PDF-Ready Format** - Structured HTML for PDF conversion via Airtable automation

### Backend Integration
- **Airtable Submission** - Serverless function for secure form submission
- **Quote HTML Storage** - Complete pricing breakdown stored in Airtable
- **Email Automation Ready** - Quote HTML ready for Airtable → Email automation
- **Evidence Trail** - What client sees = what broker sees (dispute elimination)

---

## 📁 File Structure

```
webapp/
├── index.html                          # Main HTML structure (11.4 KB)
├── css/
│   ├── style.css                       # Main styles (31 KB)
│   └── container-calculator.css        # Calculator modal styles (11 KB)
├── js/
│   ├── app.js                          # Core form logic (276 KB)
│   └── container-calculator.js         # Container calculator (32 KB)
├── netlify/
│   └── functions/
│       └── airtable-submit.js          # Serverless Airtable submission (155 lines)
├── .git/                               # Git repository
├── .gitignore                          # Git ignore rules
├── netlify.toml                        # Netlify configuration
└── README.md                           # This file
```

---

## 🔧 Technical Architecture

### Frontend Stack
- **HTML5** - Semantic markup
- **CSS3** - Custom styles + TailwindCSS (CDN)
- **Vanilla JavaScript (ES6)** - No frameworks, class-based architecture
- **Google Places API** - Address autocomplete (NZ only)
- **FontAwesome** - Icon library (CDN)

### Backend Stack
- **Netlify Serverless Functions** - Node.js backend
- **Airtable API** - Form submission storage
- **Environment Variables** - Secure API key management

### Data Flow
```
┌─────────────────┐
│   Client Form   │
│   (Browser)     │
└────────┬────────┘
         │ Submit with Quote HTML
         ↓
┌─────────────────┐
│   Netlify       │
│   Function      │
│   /airtable-    │
│   submit        │
└────────┬────────┘
         │ POST with Bearer Token
         ↓
┌─────────────────┐
│   Airtable      │
│   Database      │
│   "Form         │
│   Submissions"  │
└────────┬────────┘
         │ Automation Trigger
         ↓
┌─────────────────┐
│   Email with    │
│   PDF Quote     │
│   (Client +     │
│   Broker)       │
└─────────────────┘
```

---

## 🎯 Form Flow & Routing Logic

### Steps Overview
1. **Contact Information** - Name, email, phone, company (if business)
2. **Service Classification** - Import/Export, Business/Personal
3. **Goods Timing** - Arrival status (imports only)
4. **Arrival Details** - Shipment method, payment terms
5. **Delivery Options** - Port delivery requirements
6. **Cargo Type** - Goods classification
7. **Document Upload** - Required shipping documents
8. **Customs Code** - Client code status (imports only)
9. **Review** - Confirmation screen with pricing

### Intelligent Routing
- **Urgent Route:** Goods already arrived or arriving in 1-2 days
- **Standard Route:** Normal processing timeline
- **Specialist Route:** Hazardous materials, food/beverages, FCL containers
- **Education Route:** Not shipped yet, planning phase

---

## 💰 Pricing Structure

### Easy Freight Service Fees
| Service | Condition | Price (NZD) |
|---------|-----------|-------------|
| Customs Clearance (Base) | Always | $197.00 |
| Customs Client Code Application | If client needs help | +$95.00 |
| BIO Security | Food/beverages cargo | +$67.00 |
| GST (15%) | On all services | Variable |

### Government Fees (Indicative)
| Fee | Amount |
|-----|--------|
| Customs Transaction Fee (CTF) | $106.80 |
| Import Duty | Variable (depends on goods) |
| GST on Goods (15%) | Variable (depends on value) |
| MPI Biosecurity Fees | Variable (food only) |

**Note:** *Our rate includes classification of 5 invoice lines. Additional lines: NZD $5 + GST per line.*

---

## 🔐 Environment Variables (Netlify)

Required environment variables for production deployment:

```bash
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
```

**Configuration in Netlify:**
1. Go to Site Settings → Environment Variables
2. Add both variables
3. Redeploy site for changes to take effect

---

## 📊 Airtable Schema

### Required Fields in "Form Submissions" Table

**Contact Fields:**
- `first_name` (Single line text)
- `last_name` (Single line text)
- `email` (Email)
- `phone` (Phone number)
- `company_name` (Single line text)
- `customer_type` (Single select: business/personal)
- `consent_checkbox` (Checkbox)

**Classification Fields:**
- `direction` (Single select: import/export)
- `goods_location` (Single line text)
- `arrival_method` (Single line text)
- `customs_code_status` (Single line text)
- `customs_code_number` (Single line text)

**Service Fields:**
- `shipping_payment` (Single line text)
- `needs_port_delivery` (Single select: yes/no)
- `delivery_address` (Long text)
- `shipment_method` (Single line text)
- `container_type` (Single line text)

**Cargo Fields:**
- `cargo_type` (Single select)
- `cargo_details` (Long text)
- `packing_info_combined` (Long text)

**Document Status Fields:**
- `air_waybill_status` (Single line text)
- `bill_of_lading_status` (Single line text)
- `commercial_invoice_status` (Single line text)
- `packing_list_status` (Single line text)

**Quote Fields (NEW):**
- `quote_html` (Long text) - **Complete HTML quote for PDF generation**
- `quote_date` (Date & time) - **ISO timestamp of quote generation**
- `quote_reference` (Single line text) - **Unique quote reference ID**

**System Fields:**
- `status` (Single select: completed/in_progress)
- `session_id` (Single line text)
- `airtable_record_id` (Single line text)

---

## 🚀 Deployment Instructions

### Initial Setup

1. **Clone Repository:**
```bash
git clone https://github.com/shadoff88/esf_quote.git
cd esf_quote
```

2. **Configure Netlify:**
   - Connect GitHub repository to Netlify
   - Set build command: (none - static site)
   - Set publish directory: `/`
   - Add environment variables (see above)

3. **Deploy:**
   - Automatic deployment on push to `main` branch
   - Manual deploy: Use Netlify dashboard "Deploy" button

### Local Development

1. **Start Local Server:**
```bash
# Using Python 3
python3 -m http.server 3000

# Or using any static server
npx http-server -p 3000
```

2. **Test Netlify Functions Locally:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run dev server with functions
netlify dev
```

3. **Access Form:**
   - Open browser to `http://localhost:3000`
   - Test form submission
   - Check browser console for errors

---

## 🐛 Recent Bug Fixes

### JavaScript Errors Fixed (9th Nov 2025)

1. **Google Places API Error (index.html:156)**
   - **Issue:** Unnecessary `await` before synchronous `createElement()`
   - **Fix:** Removed `await` keyword
   - **Status:** ✅ Fixed

2. **Orphaned Async Statements (app.js:5761)**
   - **Issue:** `autoSaveToAirTable()` function partially commented, leaving orphaned `await` statements
   - **Fix:** Fully commented out entire function
   - **Status:** ✅ Fixed

3. **Orphaned Helper Function (app.js:5795)**
   - **Issue:** `showAutoSaveIndicator()` function left uncommented after main function disabled
   - **Fix:** Commented out helper function
   - **Status:** ✅ Fixed

4. **Premature Class Closing (app.js:5726)**
   - **Issue:** `EasyFreightForm` class closed too early, leaving Airtable methods outside class
   - **Fix:** Removed premature closing brace, added proper closing at line 6082
   - **Status:** ✅ Fixed

---

## ✅ Recent Enhancements (9th Nov 2025)

### Quote HTML Capture Feature

**What:** Capture complete pricing breakdown as HTML for PDF generation and email evidence.

**Why:** Provide clear evidence trail of what client saw at submission time, eliminating disputes.

**How it Works:**

1. **Client submits form** → Form calculates pricing based on selections
2. **`captureQuoteHTML()` method** → Generates complete HTML with:
   - Client information
   - Service fees breakdown
   - Government fees (indicative)
   - Shipment details
   - Quote reference ID and timestamp
3. **Submitted to Airtable** → Stored in `quote_html` field
4. **Airtable automation** → Converts HTML to PDF, sends to client + broker

**Benefits:**
- ✅ Client sees exact quote they'll receive
- ✅ Broker sees exact quote client saw
- ✅ Eliminates "that's not what I was quoted" disputes
- ✅ Professional PDF generation ready
- ✅ Audit trail for compliance

**Code Changes:**
- ✅ Added `captureQuoteHTML()` method (200+ lines)
- ✅ Modified `prepareAirTablePayload()` to include quote HTML
- ✅ Updated `submitForm()` to call `submitToAirTable()`
- ✅ Added `quote_html`, `quote_date`, `quote_reference` fields

---

## 🔄 Development Workflow

### Working Across Tools (AI Developer, Claude, GitHub)

**This README is synchronised across all development tools via Git:**

1. **Make changes in any tool** (AI Developer sandbox, Claude Desktop, local IDE)
2. **Commit changes to Git:**
   ```bash
   git add .
   git commit -m "Descriptive message of changes"
   git push origin main
   ```
3. **Pull latest changes in other tools:**
   ```bash
   git pull origin main
   ```
4. **Always read README.md first** to understand current state

### Git Best Practices

```bash
# Check current status
git status

# See recent changes
git log --oneline -10

# Create feature branch
git checkout -b feature/new-feature

# Commit frequently
git add .
git commit -m "feat: add new feature description"

# Push to GitHub
git push origin main  # or feature branch
```

---

## 📝 Known Issues

1. **File Upload:** Currently simulated - files not actually uploaded to server (frontend only)
2. **Auto-save Disabled:** Previously had Airtable auto-save on each step, now disabled
3. **Session Restoration:** Backend API for session restoration not implemented
4. **Payment Integration:** "Pay Now" button placeholder only (Stripe integration pending)

---

## 🎯 Planned Enhancements

### Short Term
- [ ] Implement actual file upload to cloud storage (Cloudflare R2 or AWS S3)
- [ ] Add email notifications via SendGrid/Mailgun
- [ ] Implement Stripe payment integration
- [ ] Add PDF download button for client

### Long Term
- [ ] Real-time quote updates via WebSocket
- [ ] Multi-language support (Māori, Pacific languages)
- [ ] Customer portal for quote history
- [ ] Integration with Easy Freight CRM system

---

## 👥 Development Team Notes

### For AI Assistants (Claude, AI Developer, etc.)

**When working on this project:**

1. **Always read this README first** to understand current state
2. **Check Git history** for recent changes: `git log --oneline -20`
3. **Test JavaScript syntax** after changes: `node -c js/app.js`
4. **Verify form flow** in browser before committing
5. **Update this README** if you make significant changes
6. **Follow commit message conventions:** `feat:`, `fix:`, `docs:`, `refactor:`

### For Human Developers

**Key Files to Know:**
- `js/app.js` - Main form logic (look for `EasyFreightForm` class)
- `netlify/functions/airtable-submit.js` - Backend submission handler
- `index.html` line 156 - Google Places API bootstrap
- `css/style.css` - Custom styles (TailwindCSS also used via CDN)

**Common Tasks:**
- **Add new form step:** Modify `initializeSteps()` method in `app.js`
- **Change pricing:** Modify `calculatePricingEstimate()` method
- **Update Airtable fields:** Modify `prepareAirTablePayload()` method
- **Change routing logic:** Modify `determineRouting()` method

---

## 📞 Support & Contact

**Project Owner:** Easy Freight Customs Brokers

**Repository:** https://github.com/shadoff88/esf_quote

**Deployment Platform:** Netlify

**Issues:** Report via GitHub Issues or contact development team

---

## 📄 Licence

Proprietary - All rights reserved to Easy Freight Customs Brokers

---

**Document Version:** 1.0  
**Last Updated:** 9th November 2025  
**Updated By:** AI Developer (Claude) - Quote HTML capture feature implementation
