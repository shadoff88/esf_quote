# Easy Freight - Complete AirTable Implementation Guide

**Version 4.1 - Form Structure Alignment & Field Mappings**  
**Last Updated**: 23 October 2025

## 🔄 V4.1 Critical Updates

**Purpose:** This version aligns the implementation guide with the approved prototype form structure.

### Changes from V4.0:

1. ✅ **ADDED:** `arrival_method` field specification (WHERE goods arrived - port/airport/courier)
2. ✅ **ADDED:** `arrival_timeline` field specification (WHEN in-transit goods expected)
3. ✅ **ADDED:** Complete Form → AirTable → Mermaid field mapping table
4. ✅ **CLARIFIED:** `goods_location = 'arrived'` means "arrived_nz" (in port/airport already)
5. ✅ **CLARIFIED:** In-transit state uses `goods_location` values (`1_2_days`, `1_week`, `more_than_week`)
6. ✅ **CLARIFIED:** `not_shipped_yet` is a distinct planning state (educational pathway trigger)
7. ✅ **UPDATED:** Urgency scoring to include `arrival_timeline` for future in-transit scoring
8. ✅ **UPDATED:** All Mermaid flowcharts to reflect actual form field structure

### Previous V4.0 Updates:
- ✅ CORRECTED: BIO Security pricing $67 NZD (was $50)
- ✅ ADDED: Container Estimation Calculator, Print Quote, Data Download features
- ✅ ADDED: Reference ID generation system
- ℹ️ CLARIFIED: destination_country (EXPORT only), payment terms hints (still present)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [🗺️ Complete Field Mapping](#-complete-field-mapping-form--airtable--mermaid)
3. [Data Structure & Tables](#data-structure--tables)
4. [Scoring Logic Implementation](#scoring-logic-implementation)
5. [Form Logic & Conditional Fields](#form-logic--conditional-fields)
6. [Educational Pathway Support](#educational-pathway-support)
7. [Document Requirements Logic](#document-requirements-logic)
8. [Email Automation Workflows](#email-automation-workflows)
9. [Pricing Logic Implementation](#pricing-logic-implementation)
10. [New Features Documentation](#new-features-documentation)
11. [Reporting & Analytics](#reporting--analytics)
12. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

This guide provides complete specifications for implementing the Easy Freight customs clearance quote request form system in AirTable Forms and Base. The system features intelligent routing based on urgency and complexity scoring, an educational pathway for early-stage customers, and automated email sequences for lead nurturing.

### Key Features

- **Educational Pathway**: Supports customers in planning stages (not_shipped_yet + not_sure on method)
- **Dynamic Form Logic**: Shows/hides fields based on user selections and shipment status
- **Intelligent Routing**: 4-tier routing system (Urgent, Standard, Education, Specialist)
- **Smart Document Requirements**: Conditional based on goods status and shipment method
- **Arrival State Tracking**: Captures WHERE (arrival_method) and urgency timing
- **Container Calculator**: Multi-product CBM estimation with volumetric weight calculation
- **Print Quote & Download**: Professional quote formatting with Reference ID tracking
- **Automated Email Sequences**: 3-minute reminder, 24-hour/1-hour follow-up, abandoned recovery

---

## 🗺️ Complete Field Mapping (Form ↔ AirTable ↔ Mermaid)

### Purpose of This Section

This table ensures **complete alignment** between:
- **Web Form** field names (HTML input names)
- **AirTable Base** field names (database columns)
- **Mermaid Diagrams** field references (flowchart labels)

Use this as your **single source of truth** for implementation.

---

### 📊 Master Field Mapping Table

| Web Form Field Name | AirTable Field Name | Field Type | Mermaid Chart Reference | Options/Values | Notes |
|---------------------|---------------------|------------|-------------------------|----------------|-------|
| **STEP 1: Contact Information** |||||
| `first_name` | First Name | Single Line Text | first_name | - | Required |
| `last_name` | Last Name | Single Line Text | last_name | - | Required |
| `company_name` | Company Name | Single Line Text | company_name | - | Optional |
| `email` | Email | Email | email | - | Required, validation |
| `phone` | Phone | Phone Number | phone | - | Required, NZ format |
| `consent_checkbox` | Privacy Consent | Checkbox | consent | true/false | Required = true |
| **STEP 2: Classification** |||||
| `direction` | Direction | Single Select | direction | `import`, `export` | Required, pathway split |
| `customer_type` | Customer Type | Single Select | customer_type | `business`, `personal` | Required |
| **STEP 3: Goods Location & Timing (IMPORT ONLY)** |||||
| `goods_location` | Goods Location Status | Single Select | goods_location | `arrived`, `1_2_days`, `1_week`, `more_than_week`, `not_shipped_yet` | **arrived = arrived_nz** (in port already) |
| `arrival_method` | Arrival Method | Single Select | arrival_method | `sea_port`, `air_freight`, `courier`, `other` | **NEW V4.1** - Shown when goods_location='arrived' |
| `arrival_timeline` | Expected Arrival Timeline | Single Select | arrival_timeline | `within_week`, `1_4_weeks`, `over_month` | **NEW V4.1** - Shown when goods in-transit (1_2_days/1_week/more_than_week) |
| **STEP 4: Shipping Payment Terms (Conditional)** |||||
| `shipping_payment` | Shipping Payment Terms | Single Select | shipping_payment | `supplier_pays_cif`, `customer_pays_fob`, `customer_pays_exw`, `not_sure` | Shown when goods_location='not_shipped_yet' |
| **STEP 5: Local Delivery** |||||
| `local_delivery` | Local Delivery Needed | Single Select | local_delivery | Values TBD | **Field exists in form** |
| `needs_port_delivery` | Port/Airport Delivery | Single Select | needs_port_delivery | `yes`, `no` | Delivery from port/airport |
| **STEP 6: Shipment Method** |||||
| `shipment_method` | Shipment Method | Single Select | shipment_method | `air_freight`, `sea_freight`, `courier`, `not_sure` | `not_sure` only for not_shipped_yet |
| `container_type` | Container Type | Single Select | container_type | `lcl`, `fcl` | Shown for sea_freight |
| `air_weight_category` | Air Weight Category | Single Select | air_weight_category | `under_100kg`, `over_100kg` | Shown for air_freight |
| **STEP 7: Export-Specific Fields (EXPORT ONLY)** |||||
| `export_service_needed` | Export Service Type | Single Select | export_service | `full_service`, `docs_only` | Export pathway only |
| `destination_country` | Destination Country | Single Select | dest_country | Country list | Export pathway only |
| **STEP 8: Cargo Type & Details** |||||
| `cargo_type` | Cargo Type | Single Select | cargo_type | `general_goods`, `personal_effects`, `food_beverages`, `frozen_goods`, `perishable_goods`, `vehicles_machinery`, `chemicals_dangerous`, `documents_samples`, `other` | Required |
| `cargo_details` | Cargo Details Description | Long Text | cargo_details | Free text | For general_goods and other |
| `personal_item_condition` | Personal Item Condition | Single Select | item_condition | `used`, `new`, `both` | For personal_effects & vehicles_machinery |
| `personal_item_mixed` | Mixed Condition Items | Checkbox | mixed_items | true/false | Checkbox for both new & used |
| `other_cargo_description` | Other Cargo Description | Long Text | other_description | Free text | When cargo_type='other' |
| `requires_temperature_control` | Temperature Control Required | Checkbox | temp_control | true/false | For food_beverages & chemicals_dangerous ($67 charge) |
| **STEP 9: Packing Information** |||||
| `packing_info_combined` | Packing Information Combined | Long Text | packing_info | Free text | When no packing list uploaded |
| `packing_dimensions` | Packing Dimensions | Single Line Text | dimensions | Text | Legacy field (use combined) |
| `total_pallets` | Total Pallets | Number | pallets | Integer | Legacy field (use combined) |
| `pallet_weight` | Pallet Weight | Single Line Text | weight | Text | Legacy field (use combined) |
| **STEP 10: Customs Code** |||||
| `customs_code_status` | Has Customs Client Code | Single Select | customs_status | `have_code`, `need_code` | Required for imports |
| `customs_code_number` | Customs Client Code | Single Line Text | customs_code | 8-character code | When have_code=true |
| **STEP 11: Document Uploads** |||||
| `documents` | Documents (Attachments) | Attachment | documents | File objects | Conditional based on goods_location & method |
| `document_status` | Document Status Tracking | JSON/Long Text | doc_status | JSON object | Tracks: ready/pending/dont_have |
| **SCORING & ROUTING (Calculated Fields)** |||||
| `urgency_score` | Urgency Score | Formula (Number) | urgency | 1-10 | See scoring logic section |
| `complexity_score` | Complexity Score | Formula (Number) | complexity | 0-15+ | See scoring logic section |
| `readiness_score` | Readiness Score | Formula (Number) | readiness | 0-10 | See scoring logic section |
| `routing_decision` | Routing Decision | Formula (Text) | routing | `urgent`, `standard`, `education`, `specialist` | See routing logic section |
| **NEW FEATURES (V4.0+)** |||||
| - | Reference ID | Formula (Text) | ref_id | EF-[TIMESTAMP] | Auto-generated: `"EF-" & DATETIME_FORMAT(Created, 'YYYYMMDDHHmmss')` |
| - | Submission Date | Created Time | created | Auto | AirTable auto-field |
| - | Last Modified | Last Modified Time | modified | Auto | AirTable auto-field |

---

### 🔍 Critical Field Clarifications

#### 1. goods_location Field Values & Meanings

| Value | Meaning | Urgency Implication | Conditional Fields Triggered |
|-------|---------|---------------------|------------------------------|
| `arrived` | **Goods already in NZ port/airport** (arrived_nz) | HIGHEST (score=10) | Shows `arrival_method` field |
| `1_2_days` | Goods arriving within 48 hours (in-transit) | HIGH (score=8, or 9 if air) | Shows `arrival_timeline` field |
| `1_week` | Goods arriving within one week (in-transit) | MEDIUM (score=5) | Shows `arrival_timeline` field |
| `more_than_week` | Goods arriving more than a week (in-transit) | LOW (score=2) | Shows `arrival_timeline` field |
| `not_shipped_yet` | Goods not shipped yet (planning stage) | LOWEST (score=1) | Shows `shipping_payment` field, enables `shipment_method='not_sure'` (educational pathway) |

**Key Understanding:**
- `arrived` = arrived_nz = "already in New Zealand port/airport destination"
- In-transit states (`1_2_days`, `1_week`, `more_than_week`) represent goods currently in-transit
- `arrival_timeline` field appears for in-transit goods to capture future urgency expectations
- `not_shipped_yet` is distinct planning state enabling educational pathway

#### 2. arrival_method Field (NEW - V4.1)

**Purpose:** Captures WHERE goods arrived when they're already in NZ

**Conditional Display:** Only shown when `goods_location = 'arrived'`

**Options:**

| Value | Display Label | Description | AirTable Display |
|-------|---------------|-------------|------------------|
| `sea_port` | 🚢 Sea freight (Port) | Auckland/Wellington/Christchurch Port | Sea Freight (Port) |
| `air_freight` | ✈️ Air freight | Auckland Airport | Air Freight |
| `courier` | 📮 NZ Post/Courier | Small package delivery | Courier |
| `other` | ❓ Other location | Different arrival method | Other Location |

**AirTable Implementation:**
- Field Type: Single Select
- Options: Sea Freight (Port), Air Freight, Courier, Other Location
- Conditional: goods_location = 'arrived'
- Required: Yes (when visible)
- Purpose: Identifies specific arrival location/port for logistics coordination

**Mermaid Chart Reference:** `arrival_method`

#### 3. arrival_timeline Field (NEW - V4.1)

**Purpose:** Captures WHEN in-transit goods expected to arrive (future urgency planning)

**Conditional Display:** Only shown when `goods_location` is in-transit (`1_2_days`, `1_week`, or `more_than_week`)

**Options:**

| Value | Display Label | Description | Urgency Implication |
|-------|---------------|-------------|---------------------|
| `within_week` | 🚨 Within 1 week | Urgent preparation needed | Future HIGH urgency |
| `1_4_weeks` | 📅 1-4 weeks | Standard processing timeline | Future MEDIUM urgency |
| `over_month` | 📆 More than 1 month | Plenty of time for preparation | Future LOW urgency |

**AirTable Implementation:**
- Field Type: Single Select
- Options: Within 1 Week (Urgent), 1-4 Weeks (Standard), Over 1 Month (Plenty of Time)
- Conditional: goods_location IN ('1_2_days', '1_week', 'more_than_week')
- Required: Yes (when visible)
- Purpose: Captures expected arrival timing for goods currently in-transit
- **Future Use:** Can be incorporated into urgency scoring or email automation timing

**Mermaid Chart Reference:** `arrival_timeline`

**Note:** Currently NOT used in urgency scoring formula, but captured for future enhancement and customer service planning.

---

## 🗂️ Data Structure & Tables

### Main Form Submissions Table

**Table Name:** `Form Submissions` or `Quote Requests`

#### Contact Fields

| Field Name | Type | Required | Options/Format | Notes |
|------------|------|----------|----------------|-------|
| First Name | Single Line Text | Yes | - | - |
| Last Name | Single Line Text | Yes | - | - |
| Company Name | Single Line Text | No | - | Optional for personal customers |
| Email | Email | Yes | Valid email format | Used for automation |
| Phone | Phone Number | Yes | NZ format preferred | - |
| Privacy Consent | Checkbox | Yes | Must be checked | GDPR/Privacy Act compliance |

#### Classification Fields

| Field Name | Type | Required | Options | Notes |
|------------|------|----------|---------|-------|
| Direction | Single Select | Yes | Import, Export | Primary pathway split |
| Customer Type | Single Select | Yes | Business, Personal | Affects complexity scoring |

#### Import-Specific Timing Fields

| Field Name | Type | Required | Options | Conditional Logic |
|------------|------|----------|---------|-------------------|
| Goods Location Status | Single Select | Yes (Import) | Arrived, 1-2 Days, 1 Week, More Than Week, Not Shipped Yet | Import direction only |
| Arrival Method | Single Select | Yes (when visible) | Sea Freight (Port), Air Freight, Courier, Other Location | **V4.1 NEW** - When Goods Location='Arrived' |
| Expected Arrival Timeline | Single Select | Yes (when visible) | Within 1 Week (Urgent), 1-4 Weeks (Standard), Over 1 Month (Plenty of Time) | **V4.1 NEW** - When Goods Location=In-Transit (1-2 Days/1 Week/More Than Week) |

#### Service Classification Fields

| Field Name | Type | Required | Options | Conditional Logic |
|------------|------|----------|---------|-------------------|
| Shipping Payment Terms | Single Select | Conditional | Supplier Pays (CIF), Customer Pays - Port (FOB), Customer Pays - Supplier (EXW), Not Sure | Only when goods_location='not_shipped_yet' |
| Local Delivery Needed | Single Select | Yes | TBD | Always shown |
| Port/Airport Delivery | Single Select | Yes | Yes, No | Delivery service from port/airport |
| Shipment Method | Single Select | Yes | Air Freight, Sea Freight, Courier, Not Sure | Not Sure only for not_shipped_yet |
| Container Type | Single Select | Conditional | LCL (Shared), FCL (Full Container) | Only for sea_freight |
| Air Weight Category | Single Select | Conditional | Under 100kg, Over 100kg | Only for air_freight |

#### Export-Specific Fields

| Field Name | Type | Required | Options | Conditional Logic |
|------------|------|----------|---------|-------------------|
| Export Service Type | Single Select | Yes (Export) | Full Service, Documents Only | Export direction only |
| Destination Country | Single Select | Yes (Export) | Country dropdown list | Export direction only |

#### Cargo Type & Details

| Field Name | Type | Required | Options/Format | Conditional Logic |
|------------|------|----------|----------------|-------------------|
| Cargo Type | Single Select | Yes | General Goods, Personal Effects, Food/Beverages, Frozen Goods, Perishable Goods, Vehicles/Machinery, Chemicals/Dangerous Goods, Documents/Samples, Other | - |
| Cargo Details Description | Long Text | Conditional | Free text | For general_goods and other |
| Personal Item Condition | Single Select | Conditional | Used, New, Both | For personal_effects & vehicles_machinery |
| Mixed Condition Items | Checkbox | No | - | For 'Both' selection |
| Other Cargo Description | Long Text | Conditional | Free text | When cargo_type='other' |
| Temperature Control Required | Checkbox | Conditional | - | For food_beverages & chemicals_dangerous (+$67 charge) |

#### Packing Information

| Field Name | Type | Required | Options/Format | Notes |
|------------|------|----------|----------------|-------|
| Packing Information Combined | Long Text | Conditional | Free text format | When packing list not uploaded |

**Expected Format:**
```
Dimensions: [dimensions per pallet]
Total Pallets: [number]
Weight: [weight per pallet and total]
```

#### Customs Code

| Field Name | Type | Required | Options | Conditional Logic |
|------------|------|----------|---------|-------------------|
| Has Customs Client Code | Single Select | Yes (Import) | Have Code, Need Code | Import only |
| Customs Client Code | Single Line Text | Conditional | 8 characters | When Have Code selected |

**Validation:** Must be exactly 8 characters when provided.

#### Document Uploads & Status

| Field Name | Type | Required | Format | Notes |
|------------|------|----------|--------|-------|
| Documents | Attachment | Conditional | Multiple files | See Document Requirements Logic |
| Document Status Tracking | Long Text (JSON) | No | JSON format | Tracks status: ready/pending/dont_have |

**Document Status JSON Structure:**
```json
{
  "commercial_invoice": "ready",
  "packing_list": "dont_have",
  "bill_of_lading": "pending",
  "certificate_of_origin": "ready"
}
```

#### Calculated Fields (Formulas)

| Field Name | Formula Type | Purpose | See Section |
|------------|--------------|---------|-------------|
| Urgency Score | Number (1-10) | Priority ranking | [Scoring Logic](#scoring-logic-implementation) |
| Complexity Score | Number (0-15+) | Service complexity | [Scoring Logic](#scoring-logic-implementation) |
| Readiness Score | Number (0-10) | Document preparedness | [Scoring Logic](#scoring-logic-implementation) |
| Routing Decision | Text | Queue assignment | [Routing Logic](#routing-logic) |
| Reference ID | Text | Unique identifier | Format: `EF-[YYYYMMDDHHmmss]` |

#### Metadata Fields

| Field Name | Type | Auto-Generated | Format |
|------------|------|----------------|--------|
| Submission Date | Created Time | Yes | AirTable auto-field |
| Last Modified | Last Modified Time | Yes | AirTable auto-field |

---

## 🧮 Scoring Logic Implementation

### Urgency Score Calculation

**Formula Field: `urgency_score`**  
**Type:** Number (0-10)  
**Purpose:** Determines priority level based on goods timing and cargo type

#### Current Implementation (Matches Approved Form)

```javascript
SWITCH({goods_location},
  "arrived", 10,
  "1_2_days", IF({shipment_method} = "air_freight", 9, 8),
  "1_week", 5,
  "more_than_week", 2,
  "not_shipped_yet", 1,
  0
) +
IF({cargo_type} = "food_beverages", 2, 0) +
IF({cargo_type} = "chemicals_dangerous", 3, 0)
```

**Maximum Score:** 10 (capped)

#### Urgency Scoring Breakdown

| Condition | Base Score | Notes |
|-----------|------------|-------|
| **Goods Location** |||
| `arrived` (arrived_nz - in port/airport) | 10 | HIGHEST PRIORITY - Goods waiting at port/airport |
| `1_2_days` | 8 | HIGH - Arriving within 48 hours |
| `1_2_days` + `air_freight` | 9 | URGENT - Air freight arriving soon |
| `1_week` | 5 | MEDIUM - Arriving within one week |
| `more_than_week` | 2 | LOW - More than a week away |
| `not_shipped_yet` | 1 | PLANNING - Not yet shipped |
| **Cargo Type Modifiers** |||
| `food_beverages` | +2 | Perishable items urgency |
| `chemicals_dangerous` | +3 | Safety/compliance urgency |

**Total Score Calculation:**
```
urgency_score = MIN(
  goods_location_score + cargo_type_modifier,
  10
)
```

#### arrival_timeline Field (Future Enhancement)

**Status:** Field captured in form but NOT currently used in urgency scoring

**Purpose:** Provides additional timing context for in-transit goods (goods_location = 1_2_days/1_week/more_than_week)

**Captured Values:**
- `within_week` = 🚨 Within 1 week (Urgent preparation needed)
- `1_4_weeks` = 📅 1-4 weeks (Standard processing timeline)
- `over_month` = 📆 More than 1 month (Plenty of time)

**Future Formula Enhancement (Optional):**
```javascript
// If you want to use arrival_timeline in scoring:
SWITCH({goods_location},
  "arrived", 10,
  "1_2_days", IF({shipment_method} = "air_freight", 9, 8),
  "1_week", IF({arrival_timeline} = "within_week", 6, 5),
  "more_than_week", IF({arrival_timeline} = "within_week", 4, 2),
  "not_shipped_yet", 1,
  0
) +
IF({cargo_type} = "food_beverages", 2, 0) +
IF({cargo_type} = "chemicals_dangerous", 3, 0)
```

**Recommendation:** Keep current formula as approved unless business requires arrival_timeline urgency differentiation.

---

### Complexity Score Calculation

**Formula Field: `complexity_score`**  
**Type:** Number (0-15+)  
**Purpose:** Determines service complexity and specialist routing needs

```javascript
SWITCH({cargo_type},
  "documents_samples", 0,
  "general_goods", 1,
  "other", 1,
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
) +
IF({container_type} = "fcl", 5, 0) +
IF({requires_temperature_control} = TRUE, 3, 0)
```

#### Complexity Scoring Breakdown

| Factor | Score | Notes |
|--------|-------|-------|
| **Cargo Type** |||
| Documents/Samples | 0 | Simplest |
| General Goods | 1 | Standard commercial goods |
| Other | 1 | Custom category |
| Personal Effects | 2 | Used goods valuation |
| Food/Beverages | 4 | MPI compliance |
| Frozen/Perishable/Vehicles/Machinery | 5 | Special handling |
| Chemicals/Dangerous Goods | 8 | High compliance requirements |
| **Shipping Payment Terms** |||
| EXW (Supplier door) | +4 | Full freight forwarding service |
| FOB (Origin port) | +2 | Shipping + customs |
| CIF/Not Sure | 0 | Customs clearance only |
| **Container Type** |||
| FCL (Full Container Load) | +5 | Freight forwarding required |
| LCL/Not Applicable | 0 | Standard handling |
| **Special Requirements** |||
| Temperature Control | +3 | Refrigerated containers ($67 surcharge) |

**Specialist Routing Threshold:** complexity_score ≥ 8

---

### Readiness Score Calculation

**Formula Field: `readiness_score`**  
**Type:** Number (0-10)  
**Purpose:** Measures customer document preparedness

```javascript
IF({commercial_invoice_status} = "ready", 3, 
   IF({commercial_invoice_status} = "dont_have", 1, 0)) +
IF({packing_list_status} = "ready", 2,
   IF({packing_list_status} = "dont_have", 1, 0)) +
IF(OR(
   {air_waybill_status} = "ready", 
   {bill_of_lading_status} = "ready", 
   {courier_receipt_status} = "ready"
), 2, 0) +
IF({customs_code_status} = "have_code", 3, 1)
```

**Note:** `document_status` values are: `ready`, `pending`, `dont_have`

#### Readiness Scoring Breakdown

| Document | Ready | Don't Have | Pending/Not Applicable |
|----------|-------|------------|------------------------|
| Commercial Invoice | 3 | 1 | 0 |
| Packing List | 2 | 1 | 0 |
| Transport Document (AWB/BOL/Courier) | 2 | 0 | 0 |
| Customs Client Code | 3 | 1 | - |

**Maximum Score:** 10 (all documents ready + customs code)

**Standard Routing Threshold:** readiness_score ≥ 6

---

### Routing Decision Logic

**Formula Field: `routing_decision`**  
**Type:** Single Select Text  
**Options:** `urgent`, `standard`, `education`, `specialist`

#### Master Routing Formula

```javascript
IF(AND({goods_location} = "not_shipped_yet", {shipment_method} = "not_sure"), "education",
IF({container_type} = "fcl", "specialist",
IF({urgency_score} >= 8, "urgent",
IF({complexity_score} >= 8, "specialist",
IF(AND({shipping_payment} = "supplier_pays_cif", {urgency_score} >= 4), "standard",
IF(AND(OR({shipping_payment} = "customer_pays_fob", {shipping_payment} = "customer_pays_exw"), {complexity_score} >= 4), "specialist",
IF(OR(AND({urgency_score} >= 4, {readiness_score} >= 6), AND({urgency_score} >= 4, {shipment_method} = "sea_freight")), "standard",
"education")))))))
```

#### Routing Priority Hierarchy (Checked in Order)

| Priority | Condition | Route To | Rationale |
|----------|-----------|----------|-----------|
| **1** | `goods_location = 'not_shipped_yet'` AND `shipment_method = 'not_sure'` | **EDUCATION** | First-time importer needs guidance (educational pathway) |
| **2** | `container_type = 'fcl'` | **SPECIALIST** | Full container requires freight forwarding |
| **3** | `urgency_score >= 8` | **URGENT** | Immediate action required |
| **4** | `complexity_score >= 8` | **SPECIALIST** | Hazardous/complex goods need expert handling |
| **5** | `shipping_payment = 'supplier_pays_cif'` AND `urgency_score >= 4` | **STANDARD** | Customs clearance only, moderately urgent, ready to process |
| **6** | `shipping_payment IN ('customer_pays_fob', 'customer_pays_exw')` AND `complexity_score >= 4` | **SPECIALIST** | Freight forwarding with complexity |
| **7** | (`urgency_score >= 4` AND `readiness_score >= 6`) OR (`urgency_score >= 4` AND `shipment_method = 'sea_freight'`) | **STANDARD** | Ready with documents OR standard sea freight process |
| **8** | None of above | **EDUCATION** | Default fallback - needs guidance |

#### Routing Outcomes

| Route | Meaning | Service Level | Price Tier |
|-------|---------|---------------|------------|
| **URGENT** | Immediate action needed | Priority response (same-day) | Premium |
| **STANDARD** | Ready to process | Standard response (24-48 hours) | Standard |
| **SPECIALIST** | Complex/requires forwarding | Expert consultation | Custom quote |
| **EDUCATION** | Needs guidance | Educational resources + follow-up | Educational pricing |

---

## 📋 Form Logic & Conditional Fields

### Step Visibility Logic

| Step | Show If Condition | Import/Export |
|------|-------------------|---------------|
| Goods Location | `direction = 'import'` | Import only |
| Arrival Method | `goods_location = 'arrived'` | Import only |
| Arrival Timeline | `goods_location IN ('1_2_days', '1_week', 'more_than_week')` | Import only |
| Shipping Payment Terms | `goods_location = 'not_shipped_yet'` | Import only |
| Export Service Type | `direction = 'export'` | Export only |
| Destination Country | `direction = 'export'` | Export only |
| Customs Code | `direction = 'import'` | Import only |

### Conditional Field Logic

| Field | Show/Hide Condition | Required When Visible | Notes |
|-------|---------------------|----------------------|-------|
| `shipment_method = 'not_sure'` | Only when `goods_location = 'not_shipped_yet'` | No | **Educational pathway trigger** |
| `arrival_method` | Only when `goods_location = 'arrived'` | Yes | **V4.1 NEW** - WHERE goods arrived |
| `arrival_timeline` | Only when `goods_location IN ('1_2_days', '1_week', 'more_than_week')` | Yes | **V4.1 NEW** - WHEN in-transit goods expected |
| `container_type` | Only when `shipment_method = 'sea_freight'` | Yes | LCL vs FCL |
| `air_weight_category` | Only when `shipment_method = 'air_freight'` | Yes | Under/Over 100kg |
| `cargo_type = 'vehicles_machinery'` | Hidden when `shipment_method = 'courier'` | N/A | Courier can't handle vehicles |
| `cargo_details` | Only when `cargo_type = 'general_goods'` | No | Optional specification (max 200 chars) |
| `other_cargo_description` | Only when `cargo_type = 'other'` | Yes | **Required** text area (max 500 chars) |
| `personal_item_condition` | Only when `cargo_type IN ('personal_effects', 'vehicles_machinery')` | Yes | Used/New/Both |
| `personal_item_mixed` | Only when `personal_item_condition = 'both'` | No | Checkbox for mixed items |
| `requires_temperature_control` | Only when `cargo_type IN ('food_beverages', 'chemicals_dangerous')` | Yes | Temperature control checkbox ($67 surcharge) |
| `packing_info_combined` | Only when packing_list `document_status = 'dont_have'` | Yes | Free text packing details |
| `customs_code_number` | Only when `customs_code_status = 'have_code'` | Yes | 8-character validation |

### Payment Terms Display Text

**Field:** `shipping_payment`

| Option Value | Display Label & Description |
|--------------|----------------------------|
| `supplier_pays_cif` | 🏭 Supplier arranges shipping to New Zealand - I just need NZ customs clearance (CIF/DDU)<br><small>Most common option</small> |
| `customer_pays_fob` | 🚢 I arrange shipping to New Zealand from origin port - I need shipping + NZ customs clearance (FOB)<br><small>Better freight rates</small> |
| `customer_pays_exw` | 🏪 I arrange everything from supplier's door - I need origin services + shipping + NZ customs clearance (EXW/FCA)<br><small>Full control</small> |
| `not_sure` | ❓ Not sure/Other arrangement - Need guidance on shipping terms |

**Note:** Small text hints ("Most common option", "Better freight rates", "(EXW/FCA) Full control") are present in form and should be preserved.

---

## 🎓 Educational Pathway Support (NEW)

### Trigger Conditions

The educational pathway is triggered when BOTH conditions are met:
1. `goods_location = 'not_shipped_yet'`
2. `shipment_method = 'not_sure'`

### Special Handling

#### 1. Document Requirements
- **Transport Documents HIDDEN**: Air Waybill, Bill of Lading, Courier Receipt are not shown
- **Commercial Invoice**: Still required (or draft invoice)
- **Packing List**: Changed to **optional** instead of required

#### 2. Form Flow
- **Delivery Service Step**: Still shown for planning purposes
- **Payment Terms**: Still collected for educational purposes
- **Cargo Type**: Full classification still requested

#### 3. Routing
- **Automatic**: Always routes to `routing_decision = 'education'`
- **No Pricing**: Pricing calculator is not shown
- **Follow-up**: 24-hour educational email sequence

#### 4. Email Sequence
Educational pathway users receive nurturing emails focused on:
- Shipping method guidance
- Documentation preparation advice
- Payment terms explanation
- Customs process education

### Implementation in AirTable

**Formula Field: `is_educational_pathway`**

```javascript
AND(
  {goods_location} = "not_shipped_yet",
  {shipment_method} = "not_sure"
)
```

Use this formula field to trigger:
- Document requirement visibility rules
- Email automation sequences
- Internal CRM tagging
- Analytics segmentation

### Educational KPIs

| Metric | Target | Purpose |
|--------|--------|---------|
| Educational Form Completion Rate | >85% | Track user-friendliness for early-stage customers |
| Educational to Active Conversion | >20% within 30 days | Measure nurturing effectiveness |
| Time to Conversion | <30 days | Average time from educational to active quote |
| Document Readiness Improvement | Track over time | Monitor education effectiveness |

---

## 📄 Document Requirements Logic

### Import Documents by Scenario

#### Standard Import (Goods Already Shipped or In Transit)

**Shipment Method: Air Freight**
- ✈️ Air Waybill (Required)
- 📄 Commercial Invoice or Draft Invoice (Required)
- 📋 Packing List or Draft Packing List (Required if `needs_port_delivery = 'yes'`, otherwise Optional)

**Shipment Method: Sea Freight**
- 🚢 Bill of Lading (Required)
- 📄 Commercial Invoice or Draft Invoice (Required)
- 📋 Packing List or Draft Packing List (Required if `needs_port_delivery = 'yes'`, otherwise Optional)

**Shipment Method: Courier**
- 📦 Courier Receipt/Tracking (Required)
- 📄 Commercial Invoice or Draft Invoice (Required)
- 📋 Packing List or Draft Packing List (Required if `needs_port_delivery = 'yes'`, otherwise Optional)

#### Educational Pathway (Not Shipped Yet + Not Sure)

**Documents Required:**
- 📄 Commercial Invoice or Draft Invoice (Required)
- 📋 Packing List or Draft Packing List (Optional - for planning)
- **NO Transport Documents** (Air Waybill/Bill of Lading/Courier Receipt are hidden)

#### Hazardous Goods (Import)

**All Standard Documents PLUS:**
- ⚠️ MSDS - Material Safety Data Sheet (Required for `cargo_type = 'chemicals_dangerous'`)

### Export Documents

**All Export Shipments:**
- 📄 Commercial Invoice or Draft Invoice (Required)
- 📋 Packing List or Draft Packing List (Required)
- 📋 Export Declaration (Required - NO "need_help" option, only `upload` or `dont_have`)

**Hazardous Goods (Export):**
- ⚠️ MSDS - Material Safety Data Sheet (Required for `cargo_type = 'chemicals_dangerous'`)

### Document Status Options

| Document Type | Options Available | Notes |
|---------------|-------------------|-------|
| Transport Docs (Air/Sea/Courier) | `upload`, `dont_have`, `need_help` | Hidden for educational pathway |
| Commercial Invoice | `upload`, `dont_have`, `need_help` | Always required |
| Packing List | `upload`, `dont_have` + text input alternative | Optional for educational pathway |
| Export Declaration | `upload`, `dont_have` | **NO "need_help" option** |
| MSDS | `upload`, `dont_have`, `need_help` | Only for hazardous goods |

### Packing List Alternative

When user selects "Don't have one" for Packing List, show text area for manual entry:

**Required Information:**
```
Field: packing_info_combined (Long Text)
Placeholder:
"Please include:
• Dimensions (Length x Width x Height in cm) per pallet/unit and total volume
• Total number of pallets/units  
• Weight (in kg) per pallet/unit and total weight of cargo

Example:
Each pallet: 120 x 100 x 150 cm, Total volume: 5.4 m³
Total: 3 pallets
Each pallet: 250 kg, Total weight: 750 kg"
```

---

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

#### Normal Cases (24-hour follow-up)

**Trigger:** `reminder_sent = true` AND `last_activity_time` is more than 24 hours ago AND `follow_up_sent = false`

#### Urgent Cases (1-hour follow-up)

**Trigger:** `reminder_sent = true` AND `urgency_score >= 8` AND `last_activity_time` is more than 1 hour ago AND `follow_up_sent = false`

#### Educational Pathway (24-hour follow-up with guidance)

**Trigger:** `reminder_sent = true` AND `is_educational_pathway = true` AND `last_activity_time` is more than 24 hours ago AND `follow_up_sent = false`

**Actions:**
1. Send appropriate follow-up email (urgent, standard, or educational)
2. Set `follow_up_sent = true` 
3. Set `email_sequence_stage = 'follow_up_sent'`

**Email Template: Standard Follow-Up**

```
Subject: [URGENT - if urgency_score >= 8] Your [cargo_type] shipment quote

Hi [first_name],

We noticed you didn't complete your customs clearance quote for your [cargo_type] shipment.

Quick questions to get your quote:
1. When do your goods arrive? [goods_location] 
2. Do you have documents ready? [Yes/No buttons]
3. Do you need delivery from port/airport? [Yes/No buttons]

Get instant quote: [continuation_link]

For immediate assistance: [phone_number]

Best regards,
Easy Freight Team
```

**Email Template: Educational Pathway Follow-Up**

```
Subject: Need help planning your [cargo_type] shipment to NZ?

Hi [first_name],

Planning an international shipment can feel overwhelming. We're here to help.

We can guide you on:
✓ Choosing the right shipping method for your [cargo_type]
✓ Understanding payment terms (CIF, FOB, EXW)
✓ Preparing the right documents
✓ Getting accurate customs clearance pricing

Continue your quote request: [continuation_link]

Or book a free 15-minute consultation: [calendar_link]

Best regards,
Easy Freight Team
```

### Abandoned Form Recovery

**Normal Cases:**  
**Trigger:** `follow_up_sent = true` AND `last_activity_time` is more than 48 hours ago

**Urgent Cases:**  
**Trigger:** `follow_up_sent = true` AND `urgency_score >= 8` AND `last_activity_time` is more than 4 hours ago

**Actions:**
1. Send abandoned form email
2. Set `status = 'abandoned'`
3. Set `email_sequence_stage = 'abandoned'`

**Email Template:**

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

### Urgent Shipment Handling

**Trigger:** `urgency_score >= 8` (arrived goods or 48-hour air freight)

**Actions:**
1. Send immediate notification to Sales Manager
2. Set `sales_manager_notified = true`
3. Skip standard email reminders
4. Flag as high priority in CRM

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

---

## 🎯 Pricing Logic Implementation

### Should Show Pricing Logic

**Formula Field: `show_pricing`**

```javascript
AND(
  NOT({routing_decision} = "specialist"),
  NOT({routing_decision} = "education"),
  NOT({container_type} = "fcl"),
  OR(
    {shipping_payment} = "supplier_pays_cif",
    {routing_decision} = "urgent", 
    {routing_decision} = "standard"
  )
)
```

**Pricing is NOT shown for:**
- Educational pathway (`routing_decision = "education"`)
- Specialist cases (`routing_decision = "specialist"`)
- FCL containers (`container_type = "fcl"`)

### Base Pricing Calculation

**Formula Field: `base_service_fee`**

```javascript
197 + 
IF({customs_code_status} = "need_help", 65, 0) +
IF({requires_temperature_control}, 50, 0) +
(MAX({commercial_invoice_lines}, 5) - 5) * 5
```

**Pricing Components:**
- **Base Customs Clearance**: NZD $197
- **Customs Code Application**: +NZD $65 (if `need_help`)
- **BIO Security** (Temperature Control): +NZD $67 (if `requires_temperature_control = true`) **[CORRECTED from $67]**
- **Multiple Invoice Lines**: +NZD $5 per line over 5 lines

**Note**: Temperature control renamed to "BIO Security" in customer-facing pricing display but field name remains `requires_temperature_control`.

**Display Format Example:**
```
Base Customs Clearance Service: $197.00
BIO Security (Temperature Control): $67.00
Additional Invoice Lines: $15.00 (3 lines)
---
Subtotal: $262.00
GST (15%): $39.30
---
Total Estimate: $301.30 NZD
```

---

## 📊 Reporting & Analytics

### Key Metrics to Track

#### 1. Conversion Rates
- **Form Start to Completion Rate**: Target >75%
- **Educational Pathway Completion Rate**: Target >85%
- **Educational to Active Conversion**: Target >20% within 30 days
- **Email Reminder Effectiveness**: >25% return rate
- **Urgent vs Standard Completion Rates**: Compare by routing

#### 2. Performance Metrics
- **Average Form Completion Time**: Track by pathway
- **Step Abandonment Rates**: Identify friction points
- **Email Open/Click Rates**: By email type
- **Response Time**: Urgent <30 min, Standard <2 hours, Educational <24 hours

#### 3. Business Intelligence
- **Routing Decision Distribution**: urgent / standard / educational / specialist breakdown
- **Common Cargo Types**: Frequency analysis
- **"Other" Cargo Analysis**: Extract patterns from `other_cargo_description`
- **Educational Pathway Conversion Funnel**: Track progression stages
- **Geographic Distribution**: Track destination countries
- **Delivery Service Demand**: Yes/No patterns

#### 4. Educational Pathway Specific
- **Educational Entry Rate**: % of forms starting as educational
- **Educational Completion Rate**: % completing form vs abandoning
- **Time to Conversion**: Average days from educational to active quote
- **Educational Content Engagement**: Track resource clicks in emails
- **Conversion Trigger Analysis**: What prompted conversion (email, call, self-serve)

### Dashboard Views

#### 1. Active Forms Dashboard
- **In Progress**: Forms currently being filled out
- **Recent Activity**: Last activity < 1 hour
- **Inactive**: No activity > 3 minutes (trigger reminder)
- **Stale**: No activity > 24 hours

#### 2. Urgent Queue Dashboard
- **Arrived Goods**: `goods_location = 'arrived'`
- **48-Hour Window**: `goods_location = '1_2_days'`
- **Urgency Score ≥ 8**: All urgent cases
- **Uncontacted**: `sales_manager_notified = false`
- **Response Time Tracking**: Time since submission

#### 3. Educational Pathway Dashboard
- **Active Educational**: `is_educational_pathway = true` AND `status = 'in_progress'`
- **Completed Educational**: Finished forms awaiting follow-up
- **Converted**: Moved from educational to active quote
- **Conversion Timeline**: Track days from educational entry to conversion
- **Engagement Score**: Track email opens, clicks, resource downloads

#### 4. Abandoned Forms Dashboard
- **Recent Abandons**: Last 24-48 hours
- **Recovery Opportunities**: High readiness score
- **Lost Leads**: No response to recovery emails
- **Abandonment Patterns**: Which steps lose users

#### 5. Completed Quotes Dashboard
- **Ready for Processing**: All information complete
- **Awaiting Documents**: Missing key documents
- **Follow-up Required**: Need clarification
- **Routing Category**: By urgent/standard/specialist

### Analytics Reports

#### Weekly Report Template
```
Week of [Date]

FORM ACTIVITY:
- Total Submissions: [count]
- Completion Rate: [%]
- Average Completion Time: [minutes]

ROUTING BREAKDOWN:
- Urgent: [count] ([%])
- Standard: [count] ([%])
- Educational: [count] ([%])
- Specialist: [count] ([%])

EDUCATIONAL PATHWAY:
- New Educational Entries: [count]
- Completion Rate: [%]
- Conversions to Active: [count]
- Average Time to Conversion: [days]

EMAIL PERFORMANCE:
- 3-Minute Reminders: [sent] / [returned %]
- Follow-ups: [sent] / [completed %]
- Abandoned Recovery: [sent] / [conversion %]

CARGO ANALYSIS:
- Top 5 Cargo Types: [list with counts]
- "Other" Category: [count] - [common patterns]

DELIVERY SERVICE:
- Delivery Requested: [count] ([%])
- Self Collection: [count] ([%])

ACTION ITEMS:
- [Item 1]
- [Item 2]
```

### Data Segmentation

#### Customer Segments
1. **First-Time Importers**: Educational pathway users
2. **Experienced Importers**: Direct to standard/urgent
3. **Business Users**: `customer_type = 'business'`
4. **Personal Users**: `customer_type = 'personal'`
5. **Urgent Shippers**: `urgency_score >= 8`
6. **Complex Cases**: `complexity_score >= 8`

#### Cargo Segments
1. **General Goods**: Low complexity
2. **Food & Beverage**: BIO security required
3. **Personal Effects**: Mixed condition analysis
4. **Vehicles**: High value, compliance heavy
5. **Hazardous**: MSDS requirements
6. **Other**: Requires manual classification

---

## ✅ Implementation Checklist

### Phase 1: Core Setup (Week 1-2)

#### Database Configuration
- [ ] Create AirTable base with `form_submissions` table
- [ ] Configure all 60+ fields with correct types and validations
- [ ] Set up formula fields for scoring (urgency, complexity, readiness)
- [ ] Create `is_educational_pathway` formula field
- [ ] Configure `routing_decision` formula with updated logic (threshold = 8)
- [ ] Set up linked tables for documents, countries, etc.
- [ ] Configure permissions and sharing settings

#### Field Validation
- [ ] `cargo_details`: Optional, max 200 chars (general goods only)
- [ ] `other_cargo_description`: Required, max 500 chars (other cargo only)
- [ ] `personal_item_mixed`: Checkbox (personal effects only)
- [ ] `shipment_method = 'not_sure'`: Only show when `goods_location = 'not_shipped_yet'`
- [ ] `cargo_type = 'vehicles_machinery'`: Hide when `shipment_method = 'courier'`
- [ ] `requires_temperature_control`: Only for `food_beverages` (removed from chemicals)

### Phase 2: Form Logic (Week 2-3)

#### Conditional Display Rules
- [ ] Educational pathway trigger: `not_shipped_yet` + `not_sure`
- [ ] Hide transport docs for educational pathway
- [ ] Make packing list optional for educational pathway
- [ ] Show delivery service for all pathways (including educational)
- [ ] Hide vehicles/machinery option when courier selected
- [ ] Conditional cargo detail fields (cargo_details, other_cargo_description, personal_item_mixed)

#### Document Requirements
- [ ] Configure conditional transport document visibility
- [ ] Set packing list as optional for educational + required when delivery = yes for others
- [ ] Remove "need_help" option from export declaration
- [ ] Configure MSDS for hazardous goods only
- [ ] Set up packing_info_combined text alternative

#### Progress & UX
- [ ] Implement 100% progress bar on final step (was 85%)
- [ ] Configure "Ready to submit" text on last step
- [ ] Set up smart customs code display (show number if provided)
- [ ] Create separate review sections (main, documents, packing)

### Phase 3: Email Automation (Week 3-4)

#### Sequence Configuration
- [ ] 3-minute inactivity reminder automation
- [ ] 24-hour standard follow-up automation
- [ ] 1-hour urgent follow-up automation
- [ ] 24-hour educational pathway follow-up (guidance-focused)
- [ ] 48-hour abandoned recovery (normal cases)
- [ ] 4-hour abandoned recovery (urgent cases)

#### Email Templates
- [ ] Create continuation reminder template
- [ ] Create standard follow-up template
- [ ] Create urgent follow-up template
- [ ] Create educational pathway follow-up template
- [ ] Create abandoned recovery template
- [ ] Create sales manager urgent notification template

#### Triggers & Logic
- [ ] Set up activity time tracking
- [ ] Configure urgency-based routing (1-hour vs 24-hour)
- [ ] Set up educational pathway detection for email segmentation
- [ ] Configure sales manager notification for urgency >= 8
- [ ] Set up email sequence stage tracking

### Phase 4: Pricing & Business Logic (Week 4-5)

#### Pricing Rules
- [ ] Implement `show_pricing` formula (exclude educational + specialist)
- [ ] Configure base pricing: $197 NZD
- [ ] Add customs code assistance fee: +$65 NZD
- [ ] Add BIO Security (temperature control) fee: +$67 NZD
- [ ] Configure invoice line pricing: +$5 per line over 5
- [ ] Set up GST calculation (15%)

#### Payment Terms
- [ ] Update supplier_pays_cif description with CIF/DDU clarification
- [ ] Update customer_pays_fob description with FOB clarification
- [ ] Update customer_pays_exw description with EXW/FCA clarification
- [ ] Add supporting text with use case examples

#### Routing Logic
- [ ] FCL → always specialist
- [ ] Urgency >= 8 → urgent pathway
- [ ] Complexity >= 8 → specialist (raised from 6)
- [ ] Educational pathway → automatic education routing
- [ ] Configure standard routing conditions
- [ ] Test all routing scenarios

### Phase 5: Reporting & Analytics (Week 5-6)

#### Dashboard Setup
- [ ] Active Forms dashboard with activity tracking
- [ ] Urgent Queue dashboard with response time tracking
- [ ] Educational Pathway dashboard with conversion tracking
- [ ] Abandoned Forms dashboard with recovery metrics
- [ ] Completed Quotes dashboard with routing breakdown

#### KPI Tracking
- [ ] Form completion rate (target >75%)
- [ ] Educational pathway completion rate (target >85%)
- [ ] Educational to active conversion (target >20% within 30 days)
- [ ] Email reminder effectiveness (target >25%)
- [ ] Response time tracking (urgent <30 min, educational <24 hours)

#### Analytics Reports
- [ ] Weekly activity report automation
- [ ] Routing distribution analysis
- [ ] Educational pathway funnel report
- [ ] Cargo type frequency analysis
- [ ] "Other" cargo pattern extraction
- [ ] Delivery service demand analysis
- [ ] Geographic distribution report

### Phase 6: Testing & Training (Week 6-7)

#### Testing Scenarios
- [ ] Test educational pathway (not_shipped_yet + not_sure)
- [ ] Test standard import (arrived, sea freight, CIF)
- [ ] Test urgent case (arrived, air freight, 48 hours)
- [ ] Test specialist routing (FCL, complexity >= 8)
- [ ] Test courier workflow (no vehicles option)
- [ ] Test general goods with cargo_details
- [ ] Test other cargo with description requirement
- [ ] Test personal effects with mixed checkbox
- [ ] Test temperature control (food only)
- [ ] Test all document requirement scenarios
- [ ] Test packing info text alternative
- [ ] Test progress bar (100% on final step)

#### Email Testing
- [ ] Test 3-minute reminder
- [ ] Test 24-hour standard follow-up
- [ ] Test 1-hour urgent follow-up
- [ ] Test educational pathway follow-up
- [ ] Test abandoned recovery
- [ ] Test sales manager urgent notification
- [ ] Verify email continuation links
- [ ] Test email tracking and segmentation

#### Team Training
- [ ] Train sales team on educational pathway handling
- [ ] Train on urgency triage (30-minute response for urgent)
- [ ] Train on educational nurturing approach (24-hour response)
- [ ] Train on dashboard usage and interpretation
- [ ] Train on "other" cargo classification process
- [ ] Create internal documentation
- [ ] Set up support escalation procedures

### Phase 7: Launch & Monitoring (Week 7-8)

#### Pre-Launch
- [ ] Final end-to-end testing
- [ ] Load testing for concurrent users
- [ ] Backup and recovery procedures
- [ ] Documentation finalization
- [ ] Support team readiness check

#### Launch Activities
- [ ] Soft launch to 10% of traffic
- [ ] Monitor educational pathway adoption
- [ ] Track error rates and abandonment points
- [ ] Collect user feedback
- [ ] Monitor email delivery and engagement

#### Post-Launch Monitoring
- [ ] Daily monitoring for first week
- [ ] Educational conversion rate tracking
- [ ] Adjustment of email timing based on data
- [ ] Refinement of routing thresholds
- [ ] Documentation of common "other" cargo types
- [ ] A/B testing on payment terms descriptions
- [ ] Iteration on educational pathway messaging

---

## 🔧 Technical Implementation Notes

### AirTable Automation Triggers

#### 1. Form Activity Tracker
```
Trigger: When "updated_time" changes
Condition: status = "in_progress"
Action: 
- Check if last_activity_time > 3 minutes
- If yes and reminder_sent = false, trigger 3-minute reminder
- Check if last_activity_time > 24 hours (or 1 hour if urgent)
- If yes and follow_up_sent = false, trigger follow-up
```

#### 2. Educational Pathway Detector
```
Trigger: When "shipment_method" changes to "not_sure"
Condition: goods_location = "not_shipped_yet"
Action:
- Set is_educational_pathway = true
- Tag record for educational email sequence
- Assign to educational nurturing queue
```

#### 3. Urgency Detector
```
Trigger: When "urgency_score" is calculated
Condition: urgency_score >= 8
Action:
- Set priority = "HIGH"
- Send immediate Sales Manager notification
- Set sales_manager_notified = true
- Bypass standard email reminders
```

#### 4. Routing Calculator
```
Trigger: When relevant fields change (cargo_type, shipping_payment, container_type, etc.)
Action:
- Recalculate urgency_score
- Recalculate complexity_score
- Recalculate readiness_score
- Determine routing_decision
- Update show_pricing flag
```

### Integration Requirements

1. **Email Service** (SendGrid, Mailchimp, or AirTable native)
   - Template management
   - Link tracking
   - Email scheduling
   - Segmentation support

2. **Calendar Booking** (Calendly, Acuity, or similar)
   - Sales call scheduling
   - Educational consultation booking
   - Abandoned form recovery calls

3. **Phone System** (Twilio or similar)
   - Click-to-call functionality
   - Call logging
   - SMS reminders (optional)

4. **Document Storage** (AirTable native or cloud storage)
   - PDF upload handling
   - File size validation (max 20MB)
   - Secure document access
   - Retention policies

5. **CRM Integration** (optional but recommended)
   - Lead synchronisation
   - Activity logging
   - Follow-up task creation
   - Pipeline management

### Security Considerations

1. **Data Privacy**
   - GDPR compliance for customer data
   - NZ Privacy Act compliance
   - Consent tracking and management
   - Data retention policies (7 years for customs records)

2. **Email Validation**
   - Prevent spam submissions
   - Email verification
   - Rate limiting

3. **Data Encryption**
   - Secure document uploads
   - Encrypted at rest
   - HTTPS for all communications

4. **Access Control**
   - Role-based permissions (Sales, Operations, Admin)
   - Audit logging
   - API key management

---

## 🎨 User Experience Guidelines

### Mobile Optimisation
- Single column layout on mobile devices
- Large touch targets (minimum 44px)
- Progressive disclosure of information
- Auto-save functionality every 30 seconds
- Offline capability for form data

### Accessibility
- WCAG AA compliance
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode available
- Clear error messages with guidance

### Performance
- Lazy loading of form steps
- Optimised for 3G connections
- Maximum 2-second load time per step
- Offline form data retention
- Graceful degradation

### Error Handling
- Inline validation with helpful messages
- Field-level error indicators
- Form-level error summary
- Recovery suggestions for common errors
- Save and exit functionality

---

## 📈 Success Metrics Summary

### Primary KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Form Completion Rate | >75% | - | 📊 Track |
| Educational Pathway Completion | >85% | - | 📊 Track |
| Educational to Active Conversion | >20% (30 days) | - | 📊 Track |
| Response Time - Urgent | <30 minutes | - | 📊 Track |
| Response Time - Educational | <24 hours | - | 📊 Track |
| Quote Accuracy | >90% | - | 📊 Track |
| Customer Satisfaction | >4.5/5 | - | 📊 Track |

### Email Performance Targets

| Email Type | Open Rate | Click Rate | Conversion |
|------------|-----------|------------|------------|
| 3-Minute Reminder | >40% | >25% | >25% return |
| Standard Follow-up | >30% | >20% | >15% complete |
| Urgent Follow-up | >50% | >40% | >35% complete |
| Educational Follow-up | >35% | >25% | >20% engage |
| Abandoned Recovery | >25% | >15% | >10% convert |

---

## 🔄 Version History

- **Version 2.0** (18 Oct 2025): Updated to match approved prototype logic
  - Added educational pathway support
  - Enhanced cargo classification with new fields
  - Updated payment terms descriptions
  - Modified progress bar to 100% completion
  - Raised complexity threshold from 6 to 8
  - Updated document requirements logic
  - Renamed temperature control to BIO Security
  - Added packing info combined field
  
- **Version 1.0** (16 Oct 2025): Initial comprehensive implementation guide

---

## 📞 Support & Maintenance

### Ongoing Monitoring
- Weekly review of form completion rates
- Monthly analysis of routing distribution
- Quarterly review of educational pathway conversion
- Annual review of pricing structure

### Continuous Improvement
- A/B testing on email subject lines
- User feedback collection and analysis
- Iteration on educational content
- Refinement of complexity scoring
- Enhancement of cargo classification

### Contact
For questions or updates to this implementation guide, contact:
- Technical Lead: [Contact]
- Product Owner: [Contact]
- Sales Manager: [Contact]

---

**End of Easy Freight Complete AirTable Implementation Guide v2.0**

---

## 📦 NEW FEATURES (V4.0 - October 2025)

### Container Estimation Calculator

**Overview:**  
Integrated modal-based calculator to help customers estimate container requirements directly within the form workflow.

**Trigger:**  
"Help me calculate" button in packing list section (Step 7)

**Features:**
- **Multi-Product Support**: Add multiple product types with individual specifications
- **Flexible Units**: Mixed unit support (mm, cm, m, inches, feet / kg, g, lbs, tons) with automatic conversion
- **Container Presets**:
  * 20ft Standard: 5.9m × 2.35m × 2.39m, max 25,000 kg
  * 40ft Standard: 12.03m × 2.35m × 2.39m, max 26,500 kg
  * 40ft High Cube: 12.03m × 2.35m × 2.69m, max 26,500 kg
- **Custom Containers**: Support for non-standard dimensions and weight limits
- **Advanced Calculations**:
  * Volume utilisation percentage
  * Volumetric weight formula: (Length × Width × Height) ÷ 5000
  * Chargeable weight: max(actual_weight, volumetric_weight)
  * Container capacity warnings
  * Multi-container suggestions when capacity exceeded
- **Professional Export**:
  * CSV export for spreadsheet analysis
  * Print functionality for documentation
- **Integration**: Results automatically populate packing_information field in main form
- **Advanced Mode**: Optional settings for:
  * Stackable height limits
  * Fragile item handling
  * Custom packing factors

**Implementation Files:**
- `container-calculator.js` (32.2 KB)
- `container-calculator.css` (11.0 KB)

**AirTable Field Impact:**
- Results stored in existing `packing_information` long text field
- No new AirTable fields required

---

### Quote Results Screen

**Reference ID System:**

**Format:** `EF-[TIMESTAMP]`  
**Example:** `EF-20251022140532`

**Components:**
- Prefix: "EF-" (Easy Freight)
- Timestamp: YYYYMMDDHHMMSS format
- No separators within timestamp
- Unique for each submission

**Usage:**
- Displayed prominently on results screen
- Included in all email notifications
- Printed on PDF quotes
- Included in download files
- Customer reference for follow-up

**AirTable Field:**
```
Field: reference_id
Type: Formula or Auto-number
Formula: CONCATENATE("EF-", TEXT(CREATED_TIME(), 'YYYYMMDDHHMMSS'))
```

---

### Print Quote Feature

**Overview:**  
Professional PDF-ready quote printing directly from results screen.

**Button Location:** Results screen, alongside "Start Over" button

**Print Layout Specifications:**

**Page Format:**
- A4 standard size
- Margins: 20mm all sides + 40px top padding
- Portrait orientation
- Print-optimised styling with page break controls

**Content Sections:**

1. **Header**
   - Easy Freight branding
   - Reference ID prominently displayed
   - Date of quote generation
   - ~~Status field~~ (removed for cleaner appearance)

2. **Customer Information**
   - Full name
   - Email address
   - Phone number
   - Company name (if business customer)
   - Customer type (Business/Personal)

3. **Shipment Details**
   - Direction (To/From New Zealand)
   - Goods location status
   - Shipping method (Sea/Air/Courier)
   - Payment terms (CIF/FOB/EXW)
   - Cargo type and description
   - Container type (if applicable)
   - Delivery requirements

4. **Pricing Breakdown**
   - Base customs clearance fee
   - Additional line items (if commercial_invoice_lines > 5)
   - BIO Security: $67.00* (if temperature control required)
   - Customs Client Code: $15.00* (if Easy Freight provides code) OR $0.00 (if customer provides)
   - Local Delivery: Variable* (separate section)
   - Government Fees: Variable*
   - Subtotal
   - GST (15%)
   - **Total Amount**

5. **Pricing Protections (Asterisk References)**
   - * Base rate disclaimers
   - * Additional line cost variables
   - * Payment term dependencies
   - * Government fee variables
   - * Local delivery specialist quote notice

6. **Terms & Conditions**
   - Service scope
   - Payment terms
   - Liability limitations
   - Cancellation policy

7. **Footer**
   - **Official Contact Information**:
     * Email: sales@easyfreight.co.nz
     * Phone: +64 (9) 215-4654
   - Easy Freight address
   - Website URL

**Specialist Route Variation:**
- Tailored content for quotes requiring specialist review
- "Next Steps" section outlining:
  * Specialist will contact within [timeframe]
  * Information required for accurate quote
  * Expected timeline for final pricing
- No pricing breakdown (replaced with specialist notice)

**Technical Implementation:**
- CSS `@media print` rules
- Standard typography: 12pt body text, 14pt headings
- High-contrast colours for print clarity
- Page break controls to prevent awkward splits
- Print button triggers `window.print()`

---

### Data Download Feature

**Overview:**  
Dual-format data export for customer record-keeping and technical analysis.

**Button Location:** Results screen, alongside Print Quote

**Format Options:**

#### 1. Human-Readable Text File

**Filename:** `EasyFreight_Quote_[REFERENCE_ID].txt`  
**Example:** `EasyFreight_Quote_EF-20251022140532.txt`

**Content Structure:**
```
================================
EASY FREIGHT - QUOTE SUMMARY
================================

Reference ID: EF-20251022140532
Date: 22 October 2025, 2:05 PM NZDT
Status: [Standard/Urgent/Specialist/Education]

--------------------------------
CUSTOMER INFORMATION
--------------------------------
Name: [Customer Name]
Email: [customer@email.com]
Phone: [+64 21 XXX XXXX]
Company: [Company Name] (if business)
Type: [Business/Personal]

--------------------------------
SHIPMENT DETAILS
--------------------------------
Direction: [To/From New Zealand]
Goods Location: [Arrived/In Transit/Not Shipped]
Shipping Method: [Sea Freight/Air Freight/Courier]
Payment Terms: [CIF/FOB/EXW/Not Sure]
Cargo Type: [Type and description]
Container: [FCL/LCL/N/A]
Delivery Required: [Yes/No]
Temperature Control: [Yes/No]

--------------------------------
DOCUMENT STATUS
--------------------------------
Transport Document: [Uploaded/Will Upload/Don't Have]
Commercial Invoice: [Status]
Packing List: [Status]
MSDS (if hazardous): [Status]
Customs Client Code: [Have Own/Need Code/Not Sure]

--------------------------------
PACKING INFORMATION
--------------------------------
[Customer-provided packing details or calculator results]

--------------------------------
PRICING BREAKDOWN
--------------------------------
Base Customs Clearance: $[amount]
Additional Lines: $[amount] ([X] lines)
BIO Security: $67.00 (if applicable)
Customs Code: $15.00 (if applicable)
Government Fees: Variable*
Local Delivery: Variable* (if requested)

Subtotal: $[amount]
GST (15%): $[amount]
TOTAL: $[amount]

* Variable fees determined based on specific shipment

--------------------------------
NEXT STEPS
--------------------------------
[Instructions based on routing decision]

--------------------------------
CONTACT INFORMATION
--------------------------------
Email: sales@easyfreight.co.nz
Phone: +64 (9) 215-4654
Website: www.easyfreight.co.nz

================================
```

**Features:**
- Clean, readable format suitable for printing
- All critical information included
- Proper section separation with ASCII art
- Easy to email or share with suppliers/colleagues

---

#### 2. Technical JSON Export

**Filename:** `EasyFreight_Data_[REFERENCE_ID].json`  
**Example:** `EasyFreight_Data_EF-20251022140532.json`

**Data Structure:**
```json
{
  "metadata": {
    "reference_id": "EF-20251022140532",
    "timestamp": "2025-10-22T14:05:32.123Z",
    "timestamp_nzdt": "22 October 2025, 2:05 PM NZDT",
    "form_version": "4.0",
    "routing_decision": "standard"
  },
  "scores": {
    "urgency_score": 5,
    "complexity_score": 3,
    "readiness_score": 8,
    "is_educational_pathway": false
  },
  "customer": {
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "+64211234567",
    "company_name": "Acme Ltd",
    "customer_type": "business"
  },
  "shipment": {
    "direction": "import",
    "goods_location": "arrived",
    "shipment_method": "air_freight",
    "shipping_payment": "supplier_pays_cif",
    "cargo_type": "general_goods",
    "cargo_details": "Electronics and tools",
    "container_type": "lcl",
    "needs_port_delivery": true,
    "delivery_address": "123 Main St, Auckland",
    "requires_temperature_control": false
  },
  "packing": {
    "packing_information": "3 pallets, 120x100x150cm each...",
    "commercial_invoice_lines": 8
  },
  "documents": {
    "air_waybill_status": "upload",
    "commercial_invoice_status": "upload",
    "packing_list_status": "have",
    "msds_document_status": null,
    "customs_code_status": "have_code"
  },
  "pricing": {
    "base_fee": 99,
    "additional_lines_fee": 30,
    "bio_security_fee": 0,
    "customs_code_fee": 0,
    "local_delivery_fee": "variable",
    "government_fees": "variable",
    "subtotal": 129,
    "gst": 19.35,
    "total": 148.35,
    "currency": "NZD"
  },
  "raw_form_data": {
    "step_1_customer_info": {...},
    "step_2_direction": {...},
    "step_3_goods_location": {...},
    ...
  }
}
```

**Features:**
- Complete structured data for system integration
- All calculated scores included
- Raw form data preserved
- Suitable for:
  * API integrations
  * Data analysis
  * System imports
  * Backup/archival
  * Technical debugging

**Technical Implementation:**
```javascript
const dataExport = {
  metadata: {...},
  scores: {...},
  customer: {...},
  shipment: {...},
  documents: {...},
  pricing: {...},
  raw_form_data: this.formData
};

const blob = new Blob(
  [JSON.stringify(dataExport, null, 2)],
  { type: 'application/json' }
);
const url = URL.createObjectURL(blob);
// Trigger download...
```

---

### Enhanced Step 9: Review & Submit

**December 2024 Enhancement:**  
Comprehensive information display before final submission.

**Display Sections:**

1. **Contact Information**
   - Full name
   - Email address
   - Phone number  
   - Company name (if business customer type)

2. **Shipment Overview**
   - Direction: "To New Zealand" or "From New Zealand"
   - Customer type: "Business" or "Personal"
   - Goods location: Display value (not internal code)
     * **Bug Fix:** Resolved "undefined" issue with proper value mapping
   - Shipping method: Sea Freight / Air Freight / Courier / Not Sure
   - Payment terms: Full description with icon

3. **Cargo Details**
   - Cargo type with icon
   - Cargo description/details (if provided)
   - Container type: FCL / LCL / N/A
   - Temperature control requirements (if applicable)
   - Used/New condition (if personal effects or vehicles)

4. **Packing Information**
   - Dimensions, weight, volume (if provided)
   - Number of packages/pallets
   - Commercial invoice lines count
   - Packing list details (if text input used)

5. **Delivery Requirements**
   - Port delivery needed: Yes / No
   - Delivery address (if provided)

6. **Customs Information**
   - Customs client code status:
     * "Have my own code"
     * "Need Easy Freight to provide code (+$15)"
     * "Not sure / will discuss"

7. **Document Status Summary**
   - Transport document status:
     * Air Waybill (air freight) - Status
     * Bill of Lading (sea freight) - Status  
     * Courier Receipt (courier) - Status
   - Commercial Invoice - Status
   - Packing List - Status  
   - MSDS Document (if hazardous goods) - Status

**Status Display Values:**
- ✅ "Uploaded" (status = 'upload')
- 📋 "Will upload later" (status = 'will_upload')
- ❌ "Don't have one" (status = 'dont_have')

**Progress Display:**
- Progress bar: 100% filled
- Progress text: "Ready to submit"
- Step indicator: "Step 9 of 9"

**Navigation:**
- Previous button: Return to Step 8 (Customs Code)
- Submit button: Trigger final submission and routing

**Visual Design:**
- Clean card-based layout
- Sections clearly separated
- Icons for visual hierarchy
- Responsive mobile layout
- Summary boxes with subtle borders

**Technical Implementation:**
```javascript
generateReviewSummary() {
  // Map all form data to display-friendly values
  const locationLabels = {
    'arrived': 'Already at NZ port/customs',
    '1_2_days': 'Arriving within 48 hours',
    '1_week': 'Arriving within one week',
    'more_than_week': 'More than a week away',
    'not_shipped_yet': 'Not shipped yet'
  };
  
  // Generate comprehensive HTML with all sections
  // Include conditional sections based on form data
  // Apply proper styling and responsive design
}
```

---

### Mobile Optimisations (December 2024)

**Dynamic Viewport Handling:**

**CSS Custom Property:**
```javascript
// Calculate accurate viewport height for mobile
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Update on load and resize
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH();
```

**Usage in CSS:**
```css
.container {
  height: calc(var(--vh, 1vh) * 100);
}
```

**iOS Safari Specific:**
```css
.form-container {
  height: -webkit-fill-available;
}
```

**Benefits:**
- Accurate mobile rendering across all devices
- Fixes iOS Safari viewport height issues
- Handles orientation changes smoothly
- Prevents content cutoff on mobile browsers

---

**Touch Optimisation:**

**Button Sizing:**
```css
.btn {
  min-height: 44px; /* iOS accessibility guideline */
}

@media (max-width: 576px) {
  .btn {
    min-height: 48px; /* Enhanced for small screens */
    width: 100%; /* Full-width on mobile */
  }
}
```

**Sticky Navigation:**
```css
.form-navigation {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
```

**Keyboard Interference Protection:**
```javascript
// Detect keyboard appearance
window.visualViewport.addEventListener('resize', () => {
  const isKeyboardOpen = window.visualViewport.height < window.innerHeight;
  document.body.classList.toggle('keyboard-open', isKeyboardOpen);
});
```

**Smooth Scrolling:**
```css
.form-content {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}
```

**Double-Tap Zoom Prevention:**
```css
button, input, select, textarea {
  touch-action: manipulation;
}
```

**Benefits:**
- Improved mobile usability
- Better accessibility compliance  
- Prevents button overlap with keyboard
- Smooth native scroll behaviour on iOS
- Professional mobile experience

---

### Smart Auto-Advance Prevention

**Problem Solved:**  
Form was auto-advancing to next step while users were still typing, causing frustration and data loss.

**Solution Implemented:**  
Multi-layered detection system to prevent auto-advance during any user interaction.

**Detection Methods:**

1. **Focus Detection:**
```javascript
// Prevent auto-advance when any input has focus
const isAnyInputFocused = document.activeElement.matches(
  'input, textarea, select'
);
```

2. **Typing Activity Tracking:**
```javascript
let lastKeystroke = 0;
document.addEventListener('keydown', () => {
  lastKeystroke = Date.now();
});

// 2-second protection after last keystroke
if (Date.now() - lastKeystroke < 2000) {
  return; // Don't auto-advance
}
```

3. **User Interaction Awareness:**
```javascript
let lastInteraction = 0;
['click', 'keydown', 'touchstart'].forEach(event => {
  document.addEventListener(event, () => {
    lastInteraction = Date.now();
  });
});

// 1-second protection buffer
if (Date.now() - lastInteraction < 1000) {
  return; // Don't auto-advance
}
```

4. **Event Delegation:**
```javascript
// Catch all inputs, including dynamically added ones
document.addEventListener('focus', (e) => {
  if (e.target.matches('input, textarea, select')) {
    isUserInteracting = true;
  }
}, true);
```

5. **Focus Transition Handling:**
```javascript
document.addEventListener('blur', (e) => {
  if (e.target.matches('input, textarea, select')) {
    // 50ms transition buffer
    setTimeout(() => {
      if (!document.activeElement.matches('input, textarea, select')) {
        isUserInteracting = false;
      }
    }, 50);
  }
}, true);
```

**Benefits:**
- No accidental step changes while typing
- Maintains smooth UX flow
- Prevents data loss from premature advancement
- Non-disruptive implementation
- Works with all input types

**Implementation Note:**  
All safety checks combined - auto-advance only proceeds when ALL conditions indicate user is idle.

---

### Auto-Focus Enhancement

**Feature:**  
Intelligent focus system for cargo type clarification fields.

**Behaviour:**
```javascript
// When cargo type is selected
selectCargoType(type) {
  this.formData.cargo_type = type;
  
  // Focus on clarification field if exists
  setTimeout(() => {
    const clarificationField = document.querySelector(
      `#${type}_clarification`
    );
    if (clarificationField) {
      clarificationField.focus();
      clarificationField.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, 100);
}
```

**Visual Highlighting:**
- Clarification fields highlighted with coloured left border
- Uniform background: `#f8f9fa`
- No gradient backgrounds (removed for consistency)
- Clear visual hierarchy

**Cargo Types with Auto-Focus:**
- General goods → `cargo_details` (optional text input)
- Food & beverages → `requires_temperature_control` (radio)
- Personal effects → `personal_item_mixed` (checkbox)
- Vehicles/machinery → `personal_item_condition` (radio)
- Chemicals/dangerous → `msds_document_status` (file upload)
- Other → `other_cargo_description` (required textarea)

**Benefits:**
- Faster form completion
- Clear indication of next required action
- Improved accessibility
- Better mobile experience

---

## 🔄 Version History

| Version | Date | Key Changes | Files Updated |
|---------|------|-------------|---------------|
| V1.0 | 16 Oct 2025 | Initial implementation guide | 1 file |
| V2.0 | 18 Oct 2025 | 10 logic updates, Mermaid charts, HTML updates | 20 files |
| V3.0 | 22 Oct 2025 | Sense check corrections - routing priority fix | Implementation Guide V3.0 |
| **V4.0** | **22 Oct 2025** | **New form features, pricing corrections** | **Implementation Guide V4.0** |

### V4.0 Detailed Changes:

**Pricing Corrections:**
- ✅ BIO Security fee: $67 NZD (corrected from incorrect $67)
- Updated all pricing formulas to reflect correct amount
- Updated all example calculations

**Major Feature Additions:**
- ✅ Container Estimation Calculator (32KB JS, 11KB CSS)
- ✅ Print Quote feature with professional A4 layout
- ✅ Data Download (text + JSON formats)
- ✅ Reference ID generation system
- ✅ Enhanced Step 9 review with comprehensive display

**Documentation Enhancements:**
- ✅ Mobile optimisation technical details
- ✅ Auto-advance prevention system documentation
- ✅ Auto-focus enhancement specifications
- ✅ Complete results screen specifications

**Clarifications:**
- ℹ️ destination_country field: EXISTS for EXPORT direction only
- ℹ️ Payment terms small hints: STILL PRESENT in form (not removed)

---

**Implementation Guide V4.0 Complete**  
**Status:** ✅ Ready for AirTable Implementation  
**Total Documentation:** 1,400+ lines covering all features
