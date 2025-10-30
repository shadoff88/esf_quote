# Easy Freight - AirTable Implementation Guide

## Overview

This guide provides complete specifications for implementing the Easy Freight customs clearance quote request form system in AirTable, including form logic, data structures, automation workflows, and email handling.

**Last Updated:** December 2024  
**Form Version:** 2.1 (Latest Prototype Refinements)  
**Business Logic Status:** Production Ready

## 🗂️ Data Structure & Tables

### Main Form Submissions Table

**Table Name:** `form_submissions`

| Field Name | Type | Description | Options/Validation |
|------------|------|-------------|-------------------|
| `id` | Auto Number | Primary key | Auto-generated |
| `submission_id` | Formula | Unique identifier | `CONCATENATE("EF-", YEAR(created_time), "-", {id})` |
| `created_time` | Created Time | Form start timestamp | Auto-generated |
| `updated_time` | Last Modified Time | Last activity timestamp | Auto-generated |
| `status` | Single Select | Form completion status | `in_progress`, `completed`, `abandoned` |
| `session_id` | Single Line Text | Browser session identifier | For tracking partial completions |

### Contact Information

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| `first_name` | Single Line Text | Customer first name | Yes |
| `last_name` | Single Line Text | Customer last name | Yes |
| `email` | Email | Contact email address | Yes |
| `phone` | Phone Number | Contact phone number | Yes |
| `company_name` | Single Line Text | Business name | Conditional (if customer_type = 'business') |
| `customer_type` | Single Select | Customer classification | Options: `business`, `personal` |
| `consent_checkbox` | Checkbox | Marketing consent | Yes |

### Service Classification

| Field Name | Type | Description | Options |
|------------|------|-------------|---------|
| `direction` | Single Select | Service type | `import`, `export` |
| `goods_location` | Single Select | Timing/urgency indicator | `arrived`, `1_2_days`, `1_week`, `more_than_week`, `not_shipped_yet` |
| `shipment_method` | Single Select | Transport method | `air_freight`, `sea_freight`, `courier`, `not_sure` |
| `container_type` | Single Select | For sea freight | `lcl`, `fcl` |
| `air_weight_category` | Single Select | For air freight | `under_100kg`, `over_100kg` |
| `shipping_payment` | Single Select | Payment terms | `supplier_pays_cif`, `customer_pays_fob`, `customer_pays_exw` |
| `local_delivery` | Single Select | Delivery service | `yes`, `no` |
| `needs_port_delivery` | Single Select | Port/airport delivery | `yes`, `no` |
| `delivery_address` | Long Text | Optional delivery/collection address | Free text field |

### Export-Specific Fields

| Field Name | Type | Description | Options |
|------------|------|-------------|---------|
| `export_service_needed` | Single Select | Export service type | `shipping_and_clearance`, `clearance_only`, `not_sure` |
| `destination_country` | Single Select | Export destination | Country list |

### Cargo Details

| Field Name | Type | Description | Options |
|------------|------|-------------|---------|
| `cargo_type` | Single Select | Cargo classification | `general_goods`, `food_beverages`, `frozen_goods`, `perishable_goods`, `personal_effects`, `vehicles_machinery`, `chemicals_dangerous`, `other` |
| `cargo_details` | Single Line Text | Optional general goods details | Free text (for general_goods) |
| `other_cargo_description` | Long Text | Required for "other" cargo type | Multi-line text field |
| `personal_item_condition` | Single Select | For personal/vehicle items | `used`, `new` |
| `personal_item_mixed` | Checkbox | Mixed new/used personal items | For personal_effects only |
| `requires_temperature_control` | Checkbox | For food items only | Auto-calculated (food_beverages only) |

### Customs & Documentation

| Field Name | Type | Description | Options |
|------------|------|-------------|---------|
| `customs_code_status` | Single Select | Customs code availability | `have_code`, `need_help`, `apply_myself` |
| `customs_code_number` | Single Line Text | 8-character customs code | Validation: 8 chars, alphanumeric |
| `packing_info_combined` | Long Text | Packing details when no document | Multi-line text field |

### Field Validation Rules

| Field Name | Validation Rule | Error Message |
|------------|----------------|---------------|
| `cargo_details` | Optional, max 200 chars | "Please keep details under 200 characters" |
| `other_cargo_description` | Required when cargo_type='other', max 500 chars | "Please describe your cargo type" |
| `personal_item_mixed` | Only enabled when cargo_type='personal_effects' | N/A (UI control) |
| `shipment_method='not_sure'` | Only available when goods_location='not_shipped_yet' | N/A (UI control) |
| `delivery_address` | Optional, max 500 chars | "Please keep address under 500 characters" |
| `delivery_address` | Show only when needs_port_delivery='yes' | N/A (UI control) |

### Document Status Fields

| Field Name | Type | Description | Options |
|------------|------|-------------|---------|
| `air_waybill_status` | Single Select | Air waybill status | `upload`, `dont_have`, `need_help` |
| `bill_of_lading_status` | Single Select | Bill of lading status | `upload`, `dont_have`, `need_help` |
| `courier_receipt_status` | Single Select | Courier receipt status | `upload`, `dont_have`, `need_help` |
| `commercial_invoice_status` | Single Select | Commercial invoice status | `upload`, `dont_have`, `need_help` |
| `packing_list_status` | Single Select | Packing list status | `upload`, `dont_have`, `need_help` |
| `export_declaration_status` | Single Select | Export declaration status | `upload`, `dont_have` |
| `msds_status` | Single Select | MSDS status | `upload`, `dont_have`, `need_help` |

### Scoring & Routing

| Field Name | Type | Description | Formula/Logic |
|------------|------|-------------|---------------|
| `urgency_score` | Number | Urgency calculation | See scoring logic below |
| `complexity_score` | Number | Complexity calculation | See scoring logic below |
| `readiness_score` | Number | Readiness calculation | See scoring logic below |
| `routing_decision` | Single Select | Final routing | `urgent`, `standard`, `education`, `specialist` |

### Email Tracking

| Field Name | Type | Description | Purpose |
|------------|------|-------------|---------|
| `last_activity_time` | Last Modified Time | Track inactivity | For 3-minute rule |
| `reminder_sent` | Checkbox | 3-minute reminder sent | Automation flag |
| `follow_up_sent` | Checkbox | Follow-up email sent | Automation flag |
| `sales_manager_notified` | Checkbox | Urgent notification sent | Internal tracking |
| `email_sequence_stage` | Single Select | Email automation stage | `none`, `reminder_sent`, `follow_up_sent`, `abandoned` |

## 🧮 Scoring Logic Implementation

### Urgency Score Calculation

**Formula Field: `urgency_score`**

```javascript
SWITCH(
  {goods_location},
  "arrived", 10,
  "1_2_days", IF({shipment_method} = "air_freight", 9, 8),
  "1_week", 5,
  "more_than_week", 2,
  "not_shipped_yet", 1,
  0
) + 
SWITCH(
  {cargo_type},
  "food_beverages", 2,
  "chemicals_dangerous", 3,
  0
)
```

### Complexity Score Calculation

**Formula Field: `complexity_score`**

```javascript
SWITCH({cargo_type},
  "other", 1,
  "general_goods", 1,
  "personal_effects", 2,
  "food_beverages", 4,
  "frozen_goods", 5,
  "perishable_goods", 5,
  "vehicles_machinery", 5,
  "chemicals_dangerous", 8,
  0
) +
SWITCH({shipping_payment},
  "customer_pays_exw", 4,
  "customer_pays_fob", 2,
  0
)
```

### Readiness Score Calculation

**Formula Field: `readiness_score`**

```javascript
IF({commercial_invoice_status} = "upload", 3, 
   IF({commercial_invoice_status} = "dont_have", 1, 0)) +
IF({packing_list_status} = "upload", 2,
   IF({packing_list_status} = "dont_have", 1, 0)) +
IF(OR({air_waybill_status} = "upload", {bill_of_lading_status} = "upload", {courier_receipt_status} = "upload"), 2, 0) +
IF({customs_code_status} = "have_code", 3,
   IF({customs_code_status} = "apply_myself", 2, 1))
```

**Note:** Third customs code option "apply_myself" gets 2 points (between have_code=3 and need_help=1)

### Routing Decision Logic

**Formula Field: `routing_decision`**

```javascript
IF({container_type} = "fcl", "specialist",
IF({urgency_score} >= 8, "urgent",
IF({complexity_score} >= 8, "specialist",
IF(AND({shipping_payment} = "supplier_pays_cif", {urgency_score} >= 4), "standard",
IF(AND(OR({shipping_payment} = "customer_pays_fob", {shipping_payment} = "customer_pays_exw"), {complexity_score} >= 4), "specialist",
IF(OR(AND({urgency_score} >= 4, {readiness_score} >= 6), AND({urgency_score} >= 4, {shipment_method} = "sea_freight")), "standard",
"education"))))))
```

**Note:** Complexity threshold raised from 6 to 8 to allow more cases to show pricing instead of routing to specialist.

## 📋 Form Logic & Conditional Fields

### Step Visibility Logic

| Step | Show If Condition |
|------|-------------------|
| `goods_location` | `direction = 'import'` |
| `delivery_options` | Always shown (including for educational pathway) |
| `customs_code` | `direction = 'import'` |

### Conditional Field Logic

| Field | Show/Hide Condition | Notes |
|-------|-------------------|-------|
| `shipment_method = 'not_sure'` | Only when `goods_location = 'not_shipped_yet'` | Educational pathway option |
| `cargo_type = 'vehicles_machinery'` | Hidden when `shipment_method = 'courier'` | Courier can't handle vehicles |
| `cargo_details` | Only when `cargo_type = 'general_goods'` | Optional specification field |
| `other_cargo_description` | Only when `cargo_type = 'other'` | Required text field |
| `personal_item_mixed` | Only when `cargo_type = 'personal_effects'` | Checkbox for mixed items |
| `packing_info_combined` | **Required** when `needs_port_delivery = 'yes'` | **Optional** when no delivery service |

### Required Documents by Scenario

**Import Documents:**
- **Air Freight**: Air Waybill + Commercial Invoice/Draft + Packing List/Draft *(if delivery requested)*
- **Sea Freight**: Bill of Lading + Commercial Invoice/Draft + Packing List/Draft *(if delivery requested)*
- **Courier**: Courier Receipt + Commercial Invoice/Draft + Packing List/Draft *(if delivery requested)*
- **Educational Pathway** (`not_shipped_yet`): Commercial Invoice/Draft + Packing List/Draft *(no transport docs)*
- **Hazardous Goods**: Add MSDS (Material Safety Data Sheet)

**Export Documents:**
- Commercial Invoice/Draft + Packing List/Draft + Export Declaration *(no "need help" for export declaration)*
- **Hazardous Goods**: Add MSDS

### Document Requirement Logic

| Document | Required When | Optional When |
|----------|---------------|---------------|
| Transport Docs | NOT `goods_location = 'not_shipped_yet'` | Educational pathway |
| Packing List/Info | `needs_port_delivery = 'yes'` | When no delivery service requested |
| Commercial Invoice | Always | Never (always required) |
| MSDS | `cargo_type = 'chemicals_dangerous'` | Other cargo types |

### **Updated Packing Information Logic** *(December 2024)*

**Business Rule:** Packing information is only required when local delivery service is requested, as detailed cargo information is essential for delivery logistics but optional for customs clearance only.

**Implementation:**
```javascript
packing_required = (needs_port_delivery === 'yes')

if (packing_required && !packing_info_combined.trim()) {
  validation_error = "Please provide packing information - required for delivery service"
} else {
  validation_passed = true
}
```

**UI Behavior:**
- **Delivery Service = Yes**: "Packing Information Required *" (red/blue border)
- **Delivery Service = No**: "Packing Information (Optional)" (green border)
- **Validation**: Only enforced when delivery service is requested

## 🔄 Form Flow & User Experience

### Step Progression

1. **Contact Information** (Always shown)
2. **Service Classification** (Always shown) 
3. **Goods Location/Timing** (Import only)
4. **Shipping Method** (Conditional - includes "Not sure" for educational)
5. **Payment Terms** (Conditional - updated descriptions)
6. **Delivery Options** (Always shown - including educational pathway)
7. **Cargo Type** (Always shown - enhanced with new options)
8. **Document Upload** (Always shown - conditional requirements)
9. **Customs Code** (Import only)
10. **Review & Submit** (Always shown)

### Payment Terms Updated Descriptions

| Option | New Description |
|--------|-----------------|
| `supplier_pays_cif` | "Supplier arranges shipping to New Zealand - I just need NZ customs clearance (CIF/DDU)" |
| `customer_pays_fob` | "I arrange shipping to New Zealand from origin port - I need shipping + NZ customs clearance (FOB)" |  
| `customer_pays_exw` | "I arrange everything from supplier's door - I need origin services + shipping + NZ customs clearance (EXW/FCA)" |

### Progress Bar Logic

- Calculate visible steps based on conditions
- Show progress as percentage of visible steps completed
- Fill 100% on final review step
- Display "Ready to submit" on last step

### Auto-Focus & Navigation

- Scroll to next unanswered question after completion
- Highlight current active section
- Validate each step before allowing progression

## 📧 Email Automation Workflows

### 3-Minute Inactivity Rule

**Trigger:** `last_activity_time` is more than 3 minutes ago AND `status = 'in_progress'` AND `reminder_sent = false`

**Actions:**
1. Send reminder email with continuation link
2. Set `reminder_sent = true`
3. Set `email_sequence_stage = 'reminder_sent'`

**Email Template: "Continue Your Quote Request"**
```
Subject: Don't lose your customs clearance quote - 2 minutes to finish

Hi [first_name],

You're almost done with your customs clearance quote request! 

Continue where you left off: [continuation_link]

Need help? Reply to this email or call us at [phone_number]

Best regards,
Easy Freight Team
```

### Follow-Up Email Logic

**Normal Cases (24-hour follow-up):**
**Trigger:** `reminder_sent = true` AND `last_activity_time` is more than 24 hours ago AND `follow_up_sent = false`

**Urgent Cases (1-hour follow-up):**
**Trigger:** `reminder_sent = true` AND `urgency_score >= 8` AND `last_activity_time` is more than 1 hour ago AND `follow_up_sent = false`

**Actions:**
1. Send follow-up email
2. Set `follow_up_sent = true` 
3. Set `email_sequence_stage = 'follow_up_sent'`

**Email Template: "Your Shipment Needs Attention"**
```
Subject: [URGENT - if urgent_score >= 8] Your [cargo_type] shipment quote

Hi [first_name],

We noticed you didn't complete your customs clearance quote for your [cargo_type] shipment.

Quick questions to get your quote:
1. When do your goods arrive? [goods_location] 
2. Do you have documents ready? [Yes/No buttons]
3. Do you need delivery from port/airport? [Yes/No buttons]

*Educational pathway users get guidance instead of quotes*

Get instant quote: [continuation_link]

For immediate assistance: [phone_number]

Best regards,
Easy Freight Team
```

### Abandoned Form Recovery

**Trigger:** `follow_up_sent = true` AND `last_activity_time` is more than 48 hours ago (normal) OR more than 4 hours ago (urgent)

**Actions:**
1. Send abandoned form email
2. Set `status = 'abandoned'`
3. Set `email_sequence_stage = 'abandoned'`

**Email Template: "We're Here to Help"**
```
Subject: Need help with your customs clearance?

Hi [first_name],

Customs clearance can be complex. That's why we're here to help.

Instead of forms, how about a quick 5-minute call?

Book a time: [calendar_link]
Or call us now: [phone_number]

We'll give you a quote over the phone and handle everything for you.

Best regards,
[Sales Manager Name]
Easy Freight
```

## 🚨 Urgent Shipment Handling

### Immediate Sales Manager Notification

**Trigger:** `urgency_score >= 8` (arrived goods or 48-hour air freight)

**Actions:**
1. Send immediate notification to Sales Manager
2. Set `sales_manager_notified = true`
3. Skip standard email reminders
4. Flag as high priority in internal system

**Internal Email Template:**
```
Subject: 🚨 URGENT SHIPMENT - Immediate Action Required

Priority: HIGH
Customer: [first_name] [last_name]
Company: [company_name]
Email: [email]
Phone: [phone]

Shipment Details:
- Status: [goods_location]
- Type: [cargo_type] 
- Method: [shipment_method]
- Urgency Score: [urgency_score]

Form Link: [admin_form_link]

Action Required: Contact customer within 30 minutes

[Sales Manager Dashboard Link]
```

## 🎯 Pricing Logic Implementation

### Should Show Pricing Logic

**Formula Field: `show_pricing`**

```javascript
AND(
  NOT({routing_decision} = "specialist"),
  NOT({container_type} = "fcl"),
  OR(
    {shipping_payment} = "supplier_pays_cif",
    {routing_decision} = "urgent", 
    {routing_decision} = "standard"
  )
)
```

### Base Pricing Calculation

**Formula Field: `base_service_fee`**

```javascript
197 + 
IF({customs_code_status} = "need_help", 65, 0) +
IF({cargo_type} = "food_beverages", 67, 0) +
(MAX({commercial_invoice_lines}, 5) - 5) * 5
```

**Notes:** 
- **BIO Security Logic Corrected**: Applied to ALL food/beverages cargo (not just temperature controlled)
- BIO Security fee: $67 for any food/beverage import (biosecurity clearance required)
- Local delivery service shows as "Variable*" in separate section when needed

## 📊 Reporting & Analytics

### Key Metrics to Track

1. **Conversion Rates**
   - Form start to completion rate
   - Email reminder effectiveness
   - Urgent vs standard completion rates

2. **Performance Metrics**
   - Average form completion time
   - Step abandonment rates
   - Email open/click rates

3. **Business Intelligence**
   - Routing decision distribution (urgent/standard/educational/specialist)
   - Common cargo types and "other" category analysis
   - Educational pathway conversion rates
   - Geographic distribution
   - Delivery service demand patterns

### Dashboard Views

1. **Active Forms** - In-progress submissions needing attention
2. **Urgent Queue** - High-priority shipments for immediate action
3. **Abandoned Forms** - Recovery opportunities
4. **Completed Quotes** - Ready for processing

## 🆕 Enhanced Features & Educational Pathway

### Educational Pathway Support

**Trigger Conditions:**
- `goods_location = 'not_shipped_yet'`
- `shipment_method = 'not_sure'` (available only for educational pathway)

**Special Handling:**
1. **Document Requirements**: Transport documents (Air Waybill/Bill of Lading/Courier Receipt) are hidden
2. **Packing List**: Made optional instead of required
3. **Extended Flow**: Full delivery service step included for planning purposes
4. **Routing**: Automatically routes to "education" pathway for nurturing

### Enhanced Cargo Classification

**New Options:**
- **General Goods**: Optional `cargo_details` text field for specification
- **Other**: Replaces "Documents/samples" with required `other_cargo_description` field
- **Personal Effects**: Added `personal_item_mixed` checkbox for mixed new/used items

**Dynamic Options:**
- **Vehicles/Machinery**: Hidden when `shipment_method = 'courier'`
- **Temperature Control**: Only applies to `food_beverages` (removed from hazardous goods)

### Improved User Experience

**Progress Bar Logic:**
- Fills 100% on final step (instead of 85%)
- Shows "Ready to submit" instead of time remaining on last step
- More accurate time estimation algorithm

**Document Management:**
- Packing list example updated: "per pallet/unit" and "5.4 m³" volume
- Supporting text shows "Commercial Invoice or Draft Invoice"
- Supporting text shows "Packing List or Draft packing list"

**Review Section Enhancements:**
- Separate sections for main summary, documents, and packing info
- Smart customs code display (shows number if provided, hides redundant fields)
- 2-column document status display with clean status indicators

## 🔧 Technical Implementation Notes

### AirTable Automation Triggers

1. **Form Activity Tracker**
   - Monitor `last_activity_time` changes
   - Trigger email sequences based on inactivity

2. **Urgency Detector**
   - Watch for `urgency_score >= 8`
   - Immediately notify sales team

3. **Routing Calculator**
   - Recalculate routing when form data changes
   - Update pricing visibility

4. **Conditional Field Display** *(NEW)*
   - Monitor `needs_port_delivery` changes
   - Show/hide `delivery_address` field dynamically
   - Update form rendering when selection changes

5. **Container Calculator Integration** *(NEW)*
   - Trigger calculator availability based on `container_type = 'fcl'`
   - Populate `packing_info_combined` from calculator results
   - Track calculator usage and completion rates

### Integration Requirements

1. **Email Service** (e.g., SendGrid, Mailchimp)
2. **Calendar Booking** (e.g., Calendly integration)
3. **Phone System** (click-to-call functionality)
4. **Document Storage** (file upload handling)
5. **Container Calculator API** *(NEW)* - Integration for FCL volume/weight calculations
6. **Mobile-Responsive Framework** *(NEW)* - Dynamic viewport handling for mobile devices

### Data Model Changes Summary (December 2024)

#### **New Fields Added**
```javascript
delivery_address: {
  type: 'Long Text',
  required: false,
  conditional_display: 'needs_port_delivery === "yes"',
  max_length: 500
}

customs_code_status: {
  type: 'Single Select',
  options: ['have_code', 'need_help', 'apply_myself'], // Added third option
  readiness_points: {have_code: 3, apply_myself: 2, need_help: 1}
}
```

#### **Updated Pricing Structure**
```javascript
BIO_Security_Fee: 67,        // Updated from $50 to $67
Customs_Code_Fee: 65,        // When need_help selected
Local_Delivery: 'Variable*', // Separate section, not in subtotal
Base_Clearance: 197          // Unchanged
```

#### **Quote Generation Updates**
- **Print Quotes**: Include all services in main table, local delivery as "Variable*"
- **Download Quotes**: Separate LOCAL DELIVERY SERVICE section
- **Step 9 Review**: Mobile-optimized single columns, delivery address integration

### Security Considerations

1. **Data Privacy** - GDPR compliance for form data
2. **Email Validation** - Prevent spam submissions
3. **Rate Limiting** - Prevent form abuse
4. **Data Retention** - Archive old submissions

## 🎨 User Experience Guidelines

### Mobile Optimization
- Single column layout on mobile
- Large touch targets (44px minimum)
- Progressive disclosure of information
- Auto-save functionality

### Accessibility
- WCAG AA compliance
- Screen reader compatibility
- Keyboard navigation support
- High contrast options

### Performance
- Step-by-step loading
- Optimized for 3G connections
- Offline form saving capability

## 📈 Success Metrics

### Primary KPIs
- **Form Completion Rate**: Target >75% (>85% for educational pathway)
- **Response Time**: Urgent cases <30 minutes, Educational <24 hours
- **Customer Satisfaction**: >4.5/5 rating
- **Quote Accuracy**: >90% first-time accuracy
- **Educational Conversion**: >20% of educational leads convert to active quotes within 30 days

### Email Performance
- **3-Minute Reminder**: >25% return rate
- **Follow-up Email**: >15% completion rate
- **Abandoned Recovery**: >10% conversion rate

---

## Implementation Checklist

### Phase 1: Core Setup (Updated December 2024)
- [ ] Set up AirTable base with all tables and fields (including delivery_address field)
- [ ] Configure formula fields for scoring and routing (updated complexity thresholds)
- [ ] Create customer-facing form interface with educational pathway support
- [ ] Implement enhanced cargo classification with conditional options
- [ ] Set up conditional document requirements logic
- [ ] **NEW**: Add third customs code option (apply_myself) with 2-point scoring
- [ ] **NEW**: Implement delivery address conditional display logic

### Phase 2: Advanced Features (Enhanced)
- [ ] Configure email automation workflows (educational vs urgent pathways)
- [ ] Implement file upload functionality with conditional requirements
- [ ] Set up enhanced progress tracking (100% completion, time estimation)
- [ ] Create separate review sections (summary, documents, packing info)
- [ ] Configure smart customs code display logic (all 3 options)
- [ ] **NEW**: Integrate container calculator for FCL shipments only
- [ ] **NEW**: Implement mobile-responsive single-column layouts

### Phase 3: Business Logic (Refined)
- [ ] Configure urgent notification system (30-minute response)
- [ ] Set up educational pathway nurturing (24-hour follow-up)
- [ ] Implement pricing logic with BIO Security terminology ($67 fee)
- [ ] Create dynamic payment terms descriptions
- [ ] Set up conditional delivery service options
- [ ] **NEW**: Configure "Variable*" pricing display for local delivery
- [ ] **NEW**: Update quote templates (print/download) with all services

### Phase 4: Launch & Monitoring (Production Ready)
- [ ] Set up reporting dashboards with educational conversion tracking
- [ ] Test all email sequences (urgent, standard, educational)
- [ ] Train sales team on educational pathway handling
- [ ] Configure analytics for cargo type analysis and delivery patterns
- [ ] Launch with A/B testing on educational pathway effectiveness
- [ ] **NEW**: Monitor container calculator usage and accuracy
- [ ] **NEW**: Track delivery address completion rates and service conversion

## 🆕 Latest Prototype Refinements (December 2024)

### Enhanced Form UX & Functionality

#### **Delivery Requirements Updates**
- **Button Styling**: Restored standard radio-card styling to match other form steps
- **Conditional Address Field**: `delivery_address` now dynamically shows/hides based on `needs_port_delivery` selection
- **Dynamic Re-rendering**: Form updates immediately when delivery service selection changes
- **Data Integration**: Delivery address properly included in Step 9 review, print quotes, and downloads

#### **Customs Code Enhancements**  
- **Three Options Available**: 
  1. `have_code` - "I have a Customs Client Code" 
  2. `need_help` - "I need help getting one" (Additional charge apply + NZD 65 +GST)
  3. `apply_myself` - "I'll apply myself" (Independent application)
- **Layout Fix**: Removed two-column constraint to properly display all three options
- **Scoring Update**: `apply_myself` gets 2 readiness points (between have_code=3 and need_help=1)

#### **Container Calculator Integration**
- **FCL-Only Operation**: Calculator only available for Full Container Load shipments
- **Simplified Interface**: 
  - Container options: 20ft, 40ft, Other (with open text field)
  - "Other" field placeholder: "Other: e.g. Open top"
  - Package Type label (changed from Product Name)
  - Results show only Total Volume and Total Weight
- **Form Integration**: "Use This Calculation" populates main form packing information
- **No Advanced Mode**: Removed toggle and advanced options for simplified UX

#### **Packing Information Logic Enhancement** *(NEW)*
- **Conditional Requirement**: Packing information only required when `needs_port_delivery = 'yes'`
- **Smart Validation**: Form validates packing details only for delivery service requests
- **Visual Indicators**: 
  - **Required**: "Packing Information Required *" with blue/red border
  - **Optional**: "Packing Information (Optional)" with green border
- **Business Logic**: Detailed cargo info essential for delivery logistics but optional for customs-only clearance

#### **Quote Output Improvements**
- **Step 9 Review**: 
  - Shows only delivery address (removed Port/Airport Delivery line)
  - Single-column Document Status for mobile compatibility  
  - Packing Information styling matches Document Status sections
- **Print Quote**: 
  - All services included: Customs Client Code Application, BIO Security, Local Delivery
  - Local Delivery Service in main service table as "Variable*"
  - Proper fee calculations and GST handling
- **Download Quote**: 
  - Separate "LOCAL DELIVERY SERVICE" section with "Variable*" pricing
  - Local delivery disclaimer in Important Notes
  - Removed "Response Time" line for cleaner output

### Updated Business Logic

#### **Service Fee Structure**
```javascript
Base Clearance Fee: $197.00
+ Customs Code Application: $65.00 (if need_help selected)  
+ BIO Security: $67.00 (for ALL food/beverages cargo - biosecurity clearance required)
+ Local Delivery Service: Variable* (priced separately)
```

#### **Conditional Display Logic**
```javascript
// Delivery address field
show_delivery_address = (needs_port_delivery === 'yes')

// Container calculator
show_calculator = (shipment_method === 'sea_freight' && container_type === 'fcl')

// Packing information requirement
packing_required = (needs_port_delivery === 'yes')
packing_validation = packing_required ? 'Required *' : '(Optional)'

// Customs code options (all three always visible)
customs_options = ['have_code', 'need_help', 'apply_myself']
```

#### **Mobile Optimization Updates**
- **Single Column Layouts**: Document Status and summary sections optimized for mobile
- **Consistent Styling**: All Step 9 sections use uniform background and spacing
- **Touch-Friendly**: Proper button sizing and spacing for mobile interaction

### Implementation Priority Updates

#### **High Priority Changes**
1. **Update Customs Code Field**: Add `apply_myself` option to Single Select field
2. **Add Delivery Address**: New Long Text field with conditional display logic
3. **Update Pricing Formulas**: BIO Security fee $50 → $67, add third customs option handling
4. **Mobile Responsive Views**: Single-column layout for document status on mobile devices

#### **Integration Requirements**  
1. **Container Calculator API**: Integrate calculation results with main form packing field
2. **Dynamic Field Display**: Implement conditional showing/hiding of delivery address
3. **Quote Generation**: Update templates to include all services and proper variable pricing
4. **Mobile Views**: Ensure single-column layouts work properly on mobile devices

This implementation guide provides the complete foundation for building a sophisticated, automated customs clearance quote system that handles complex business logic while providing an excellent user experience with the latest UX refinements and business process optimizations.