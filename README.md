# Easy Freight Customs Clearance Quote Form

## Project Overview

**Purpose:** Intelligent multi-step customs clearance quote request form for Easy Freight customs brokers.

**Live URLs:**
- **Production (Netlify):** https://esfquote.netlify.app
- **GitHub Repository:** https://github.com/shadoff88/esf_quote
- **Development Sandbox:** [AI Developer Sandbox URL varies per session]

**Project Type:** Static HTML/CSS/JavaScript application with serverless backend integration

**Last Updated:** 9th November 2025 (v20251109e)

---

## ✨ Current Features

### Form Functionality
- **Intelligent Multi-Step Form** - Dynamic routing based on user responses
- **Real-time Validation** - Instant feedback on form fields
- **Auto-Save After Each Step** - Progress saved to AirTable with status='in_progress' ✨ NEW
- **Session Persistence** - Zero data loss with localStorage backup
- **Responsive Design** - Mobile-optimised with TailwindCSS
- **Smart Routing Logic** - Automatically routes to urgent/standard/specialist/education pathways
- **Document Upload Interface** - Track document status (uploaded/not available)
- **Google Places Autocomplete** - NZ address validation for delivery locations
- **Container Calculator** - Modal calculator for container space estimation

### Quote Generation
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
- **Netlify Serverless Functions** - Secure API key handling via serverless backend ✨ UPDATED
- **Auto-Save Integration** - Incremental saves after each step completion ✨ NEW
- **Airtable Submission** - All form data saved to AirTable database
- **Quote HTML Storage** - Complete pricing breakdown stored in Airtable
- **Email Automation Ready** - Quote HTML ready for Airtable → Email automation
- **Evidence Trail** - What client sees = what broker sees (dispute elimination)
- **Defensive Data Cleaning** - Handles double-encoded JSON values automatically ✨ NEW

---

## 📁 File Structure

```
APP/
├── index.html                          # Main HTML structure (12 KB)
├── css/
│   ├── style.css                       # Main styles (31 KB)
│   └── container-calculator.css        # Calculator modal styles (11 KB)
├── js/
│   ├── app.js                          # Core form logic (280 KB) ✨ UPDATED
│   └── container-calculator.js         # Container calculator (32 KB)
├── netlify/
│   └── functions/
│       └── airtable-submit.js          # Serverless Airtable submission (6.5 KB) ✨ UPDATED
├── .git/                               # Git repository
├── .gitignore                          # Git ignore rules
├── netlify.toml                        # Netlify configuration
├── log.txt                             # Detailed change log ✨ NEW
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
         │ Auto-save after each step
         │ Final submit with Quote HTML
         ↓
┌─────────────────┐
│   Netlify       │
│   Function      │
│   /airtable-    │
│   submit        │
│   ✨ NEW:       │
│   - CORS        │
│   - Defensive   │
│     cleaning    │
└────────┬────────┘
         │ POST with Bearer Token
         ↓
┌─────────────────┐
│   Airtable      │
│   Database      │
│   "Form         │
│   Submissions"  │
│   Status:       │
│   in_progress → │
│   completed     │
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
1. **Contact Information** - Name, email, phone, company (if business) ✨ AUTO-SAVED
2. **Service Classification** - Import/Export, Business/Personal ✨ AUTO-SAVED
3. **Goods Timing** - Arrival status (imports only) ✨ AUTO-SAVED
4. **Arrival Details** - Shipment method, payment terms ✨ AUTO-SAVED
5. **Delivery Options** - Port delivery requirements ✨ AUTO-SAVED
6. **Cargo Type** - Goods classification ✨ AUTO-SAVED
7. **Document Upload** - Required shipping documents ✨ AUTO-SAVED
8. **Customs Code** - Client code status (imports only) ✨ AUTO-SAVED
9. **Review** - Confirmation screen with pricing → FINAL SUBMIT

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
2. Add both variables with scopes: Builds, Functions, Post processing
3. Redeploy site for changes to take effect

**IMPORTANT:** Environment variables are NOT stored in .env files on Netlify - they're configured in the dashboard.

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
- `goods_location` (Single select: arrived/1_2_days/1_week/more_than_week/not_shipped_yet)
- `arrival_method` (Single select: sea_port/air_freight/courier/other)
- `customs_code_status` (Single select: have_code/need_help/apply_myself)
- `customs_code_number` (Single line text)

**Service Fields:**
- `shipping_payment` (Single select: supplier_pays_cif/customer_pays_fob/customer_pays_exw/not_sure)
- `local_delivery` (Single select: yes/no)
- `needs_port_delivery` (Single select: yes/no)
- `delivery_address` (Long text)
- `shipment_method` (Single select: air_freight/sea_freight/courier/not_sure)
- `container_type` (Single select: lcl/fcl)
- `air_weight_category` (Single select: under_100kg/over_100kg)

**Export Fields:**
- `export_service_needed` (Single select: **full_service/docs_only/not_sure**) ✨ FIXED
- `destination_country` (Single line text)

**Cargo Fields:**
- `cargo_type` (Single select: general_goods/food_beverages/personal_effects/vehicles_machinery/chemicals_dangerous/other)
- `cargo_details` (Long text)
- `other_cargo_description` (Long text)
- `personal_item_condition` (Single select: used/new/both)
- `personal_item_mixed` (Checkbox)
- `requires_temperature_control` (Checkbox)
- `packing_info_combined` (Long text)

**Document Status Fields:**
- `air_waybill_status` (Single select: upload/dont_have/need_help)
- `bill_of_lading_status` (Single select: upload/dont_have/need_help)
- `courier_receipt_status` (Single select: upload/dont_have/need_help)
- `commercial_invoice_status` (Single select: upload/dont_have/need_help)
- `packing_list_status` (Single select: upload/dont_have/need_help)
- `export_declaration_status` (Single select: upload/dont_have)
- `msds_status` (Single select: upload/dont_have/need_help)

**Quote Fields:**
- `quote_html` (Long text) - Complete HTML quote for PDF generation
- `quote_date` (Date & time) - ISO timestamp of quote generation
- `quote_reference` (Single line text) - Unique quote reference ID
- `estimated_value` (Number) - Estimated shipment value ✨ NEW

**System Fields:**
- `status` (Single select: **in_progress/completed/abandoned**) ✨ UPDATED
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
   - Set functions directory: `netlify/functions`
   - Add environment variables:
     - `AIRTABLE_API_KEY` (with scopes: Builds, Functions, Post processing)
     - `AIRTABLE_BASE_ID` (with scopes: Builds, Functions, Post processing)

3. **Deploy:**
   - Automatic deployment on push to `main` branch
   - Manual deploy: Use Netlify dashboard "Deploy" button
   - Build time: ~15-20 seconds

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

## 🔄 Recent Changes (November 9, 2025)

### Version 20251109e - Field Value Alignment
**Status:** ✅ DEPLOYED

**Changes:**
- Fixed `export_service_needed` field value mismatch
- Changed form values to match AirTable schema:
  - `shipping_and_clearance` → `full_service`
  - `clearance_only` → `docs_only`
- Eliminated "Insufficient permissions to create new select option" errors

### Version 20251109d - Enhanced Defensive Coding
**Status:** ✅ DEPLOYED

**Changes:**
- Improved serverless function to handle multiple levels of JSON encoding
- Added while loop to recursively parse `""value""`, `"""value"""`, etc.
- Prevents infinite loops with length checks and try-catch
- Handles edge cases in form data submission

### Version 20251109c - Auto-Save Implementation
**Status:** ✅ DEPLOYED

**Changes:**
- ✅ Enabled `autoSaveToAirTable()` function (was commented out)
- ✅ Enabled `showAutoSaveIndicator()` for visual feedback
- ✅ Updated auto-save endpoint to `esfquote.netlify.app`
- ✅ Auto-save triggers in `nextStep()` after validation passes
- ✅ Records saved with `status='in_progress'` until final submission
- ✅ Final submission updates status to `completed`

**How it works:**
1. User fills Step 1 (contact info) → clicks Next
2. Form validates → calls `autoSaveToAirTable()`
3. Creates new AirTable record with `status='in_progress'`
4. Stores `airtable_record_id` for future updates
5. User fills Step 2 → clicks Next
6. Form updates same record (using record ID)
7. ... continues for all steps
8. Final submit → updates record with `status='completed'` and quote HTML

**Benefits:**
- ✅ Zero data loss - every step is saved
- ✅ Users can abandon and return - progress is preserved
- ✅ Enables abandoned cart email automation
- ✅ Tracks completion percentage for analytics

### Version 20251109b - Serverless Security
**Status:** ✅ DEPLOYED

**Changes:**
- Added defensive code to strip double-encoded JSON strings
- Handles malformed values from browser cache/session storage
- Created `estimated_value` field in AirTable
- Created `quote_html`, `quote_date`, `quote_reference` fields

### Version 20251109a - Netlify Endpoint Migration
**Status:** ✅ DEPLOYED

**Changes:**
- Updated Netlify endpoint from `esfgrowin.netlify.app` to `esfquote.netlify.app`
- Merged latest design updates from GitHub repository
- Reverted unnecessary `urgency_score`/`last_activity_time` payload changes (handled by AirTable)
- Synchronized codebase across all deployment environments

---

## 🐛 Bug Fixes & Known Issues

### ✅ Fixed Issues

1. **CORS Errors (v20251106h)**
   - Added proper CORS headers to serverless function
   - Added OPTIONS preflight handler
   - Allows cross-origin requests from any domain

2. **Submit Button Not Working (v20251106i)**
   - Removed calls to deleted `showLoadingScreen()` and `hideLoadingScreen()` methods
   - Simplified `submitForm()` for direct submission

3. **Double-Encoded JSON Values (v20251109d)**
   - Added recursive parsing to handle `""value""` encoding
   - Prevents "create new select option" errors

4. **Field Value Mismatches (v20251109e)**
   - Aligned all form field values with AirTable schema
   - Fixed `export_service_needed` options

### ⚠️ Known Issues

1. **File Upload:** Currently simulated - files not actually uploaded to server (frontend only)
2. **Payment Integration:** "Pay Now" button placeholder only (Stripe integration pending)
3. **Non-critical UI Bug:** `this.bindEvents is not a function` error (cosmetic only, doesn't affect functionality)

---

## 🎯 Planned Enhancements

### Short Term
- [ ] Implement actual file upload to cloud storage (Cloudflare R2 or AWS S3)
- [ ] Add email notifications via SendGrid/Mailgun
- [ ] Implement Stripe payment integration
- [ ] Add PDF download button for client
- [ ] Create email automation workflows in AirTable

### Long Term
- [ ] Real-time quote updates via WebSocket
- [ ] Multi-language support (Māori, Pacific languages)
- [ ] Customer portal for quote history
- [ ] Integration with Easy Freight CRM system
- [ ] Analytics dashboard for conversion tracking

---

## 👥 Development Team Notes

### For AI Assistants (Claude, AI Developer, etc.)

**When working on this project:**

1. **Always read this README first** to understand current state
2. **Read log.txt** for detailed change history
3. **Check Git history** for recent changes: `git log --oneline -20`
4. **Test JavaScript syntax** after changes: `node -c js/app.js`
5. **Verify form flow** in browser before committing
6. **Update this README** if you make significant changes
7. **Update log.txt** with all conceptual changes
8. **Follow commit message conventions:** `feat:`, `fix:`, `docs:`, `refactor:`

### For Human Developers

**Key Files to Know:**
- `js/app.js` - Main form logic (look for `EasyFreightForm` class)
  - Line 2011: Auto-save function call
  - Line 5745: Auto-save implementation
  - Line 5875: AirTable payload preparation
- `netlify/functions/airtable-submit.js` - Backend submission handler
  - Line 98: Defensive data cleaning
  - Line 114: AirTable API call
- `index.html` line 141 - Google Places API bootstrap
- `css/style.css` - Custom styles (TailwindCSS also used via CDN)
- `log.txt` - Detailed change log with version history

**Common Tasks:**
- **Add new form step:** Modify `initializeSteps()` method in `app.js`
- **Change pricing:** Modify `calculatePricingEstimate()` method
- **Update Airtable fields:** Modify `prepareAirTablePayload()` method (line 5875)
- **Change routing logic:** Modify `determineRouting()` method
- **Fix field values:** Search for field name in `app.js`, update `value="..."` attributes
- **Check AirTable schema:** Use Meta API or check via UI

---

## 📞 Support & Contact

**Project Owner:** Easy Freight Customs Brokers

**Repository:** https://github.com/shadoff88/esf_quote

**Live Site:** https://esfquote.netlify.app

**Deployment Platform:** Netlify

**Issues:** Report via GitHub Issues or contact development team

---

## 📄 Licence

Proprietary - All rights reserved to Easy Freight Customs Brokers

---

**Document Version:** 2.0
**Last Updated:** 9th November 2025 (v20251109e)
**Updated By:** AI Developer (Claude) - Auto-save implementation, serverless migration, field alignment
