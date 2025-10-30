# Destination Port Field Analysis

**Date:** 22 October 2025  
**Question:** "Do we still capture destination port in the form? why is it present in fields within implementation guide?"  
**Analysis by:** Documentation Review System

---

## Executive Summary

**Direct Answer:** 
- ❌ **NO** - `destination_port` field does NOT exist in the current form
- ❌ **NO** - `destination_port` field is NOT present in Implementation Guide V4.0
- ✅ **YES** - The form DOES capture arrival port/location information through `arrival_method` field

**Key Finding:**  
Your question revealed the field exists neither in the form nor guide. However, the investigation uncovered that **arrival/port information IS captured**, just using different field names than expected.

---

## 1. Field Search Results

### destination_port Field:
```bash
Form (app_new.js):        0 occurrences
Guide V4.0:               0 occurrences
Status:                   ❌ DOES NOT EXIST
```

**Conclusion:** The `destination_port` field name you mentioned does not exist in either the form or the implementation guide.

---

## 2. What DOES Capture Port/Arrival Information?

### The Form Uses: `arrival_method` Field

**Field Name:** `arrival_method`  
**Type:** Single Select (Radio buttons)  
**Purpose:** Captures WHERE goods arrived in New Zealand  
**Shown When:** `goods_location = 'arrived'`

**Options:**

| Value | Display Name | Description |
|-------|-------------|-------------|
| `sea_port` | 🚢 Sea freight (Port) | Auckland/Wellington/Christchurch Port |
| `air_freight` | ✈️ Air freight | Auckland Airport |
| `courier` | 📮 NZ Post/Courier | Small package delivery |
| `other` | ❓ Other location | Different arrival method |

**Form Implementation:** Lines 560-593 in app_new.js

**This field effectively serves the same purpose as a "destination port" field** - it identifies the specific arrival location/port in New Zealand.

---

## 3. Related Field: arrival_timeline

The form also has a NEW field for timing:

**Field Name:** `arrival_timeline`  
**Type:** Single Select (Radio buttons)  
**Purpose:** Captures WHEN goods expected to arrive  
**Shown When:** `goods_location = 'in_transit'`

**Options:**

| Value | Display Name | Description |
|-------|-------------|-------------|
| `within_week` | 🚨 Within 1 week | Urgent preparation needed |
| `1_4_weeks` | 📅 1-4 weeks | Standard processing timeline |
| `over_month` | 📆 More than 1 month | Plenty of time |

**Form Implementation:** Lines 605-630 in app_new.js

---

## 4. Field Structure in Guide V4.0

### Current Documentation Status:

| Field | Form Status | Guide V4.0 Status | Impact |
|-------|------------|-------------------|---------|
| `destination_port` | ❌ Not present | ❌ Not documented | ✅ Correct (doesn't exist) |
| `arrival_method` | ✅ Present (lines 560-593) | ❌ NOT documented | 🔴 **CRITICAL GAP** |
| `arrival_timeline` | ✅ Present (lines 605-630) | ❌ NOT documented | 🔴 **CRITICAL GAP** |

### goods_location Field Discrepancy:

**Guide V4.0 Documents:**
```
Options: arrived, 1_2_days, 1_week, more_than_week, not_shipped_yet
```

**Actual Form Has:**
```
Options: arrived, 1_2_days, 1_week, more_than_week, not_shipped_yet
```

✅ **Status:** This field is correctly documented (5 options match)

---

## 5. Form Logic Flow

### Current User Journey for Arrived Goods:

```
Step 1: goods_location selection
↓
User selects: "Arrived"
↓
Step 2: arrival_method selection (NEW FIELD)
↓
User selects: "Sea freight (Port)" / "Air freight" / "Courier" / "Other"
↓
This captures the specific arrival location/port
```

### Current User Journey for In-Transit Goods:

```
Step 1: goods_location selection
↓
User selects: "1_2_days" / "1_week" / "more_than_week"
↓
Step 2: arrival_timeline selection (NEW FIELD - for in_transit status)
↓
User selects timing expectation
↓
This captures urgency for goods not yet arrived
```

---

## 6. Why This Matters for AirTable Implementation

### Missing Field Impacts:

1. **AirTable Schema Incomplete**
   - `arrival_method` field needs to be created in AirTable
   - `arrival_timeline` field needs to be created in AirTable
   - Field types, options, and conditional logic need documentation

2. **Data Capture Gap**
   - Current guide doesn't tell implementer to create these fields
   - Port/arrival location information would be lost
   - Urgency timing for in-transit goods would be lost

3. **Conditional Logic Missing**
   - Guide doesn't document when `arrival_method` appears
   - Guide doesn't document when `arrival_timeline` appears
   - Validation rules not documented

4. **Urgency Scoring May Be Affected**
   - `arrival_method = 'air_freight'` may provide urgency bonus
   - `arrival_timeline` values may affect scoring
   - Current guide urgency formula may be incomplete

---

## 7. Validation Code from Form

### arrival_method Validation:
```javascript
// Line 1656-1657
if (this.formData.goods_location === 'arrived_nz' && !this.formData.arrival_method) {
    this.showFieldError('arrival_method', 'Please select how your goods arrived');
}
```

**Note:** Code references `'arrived_nz'` but form template uses `'arrived'` - this may be a code inconsistency.

### arrival_timeline Validation:
```javascript
// Line 1661-1662
if (this.formData.goods_location === 'in_transit' && !this.formData.arrival_timeline) {
    this.showFieldError('arrival_timeline', 'Please select expected arrival timeline');
}
```

**Note:** Code references `'in_transit'` but form template doesn't show this value in goods_location options - this may be another inconsistency.

---

## 8. Recommendations

### IMMEDIATE ACTION REQUIRED:

1. ✅ **Answer Your Question:**
   - `destination_port` does NOT exist
   - But `arrival_method` captures the same information (WHERE goods arrived)
   - `sea_port` option specifically identifies port arrival

2. 🔴 **Update Guide to V4.1:**
   - Add `arrival_method` field full documentation
   - Add `arrival_timeline` field full documentation
   - Document conditional display logic
   - Update urgency scoring if these fields affect it
   - Verify goods_location value inconsistencies ('arrived' vs 'arrived_nz', 'in_transit' vs actual options)

3. 🔍 **Investigate Code Inconsistencies:**
   - Validation code uses `'arrived_nz'` but template uses `'arrived'`
   - Validation code uses `'in_transit'` but this value not in template
   - These may be old code references or template errors

4. 📊 **Verify Urgency Scoring:**
   - Check if `arrival_method = 'air_freight'` should add urgency points
   - Check if `arrival_timeline` values affect urgency score
   - Current guide formula only uses `goods_location` field

---

## 9. Conclusion

**Your Question:** "Do we still capture destination port in the form?"

**Answer:** The form does NOT use a field called `destination_port`, but it DOES capture the equivalent information through the `arrival_method` field, which includes a `sea_port` option that identifies Auckland/Wellington/Christchurch Port as the arrival location.

**Why is it present in the implementation guide?**

**Answer:** It is NOT present in the guide. Your question helped identify that:
1. `destination_port` doesn't exist anywhere (correct)
2. `arrival_method` DOES exist in form but is MISSING from guide (critical gap)
3. `arrival_timeline` DOES exist in form but is MISSING from guide (critical gap)

**Impact:** Guide V4.0 is missing two fields that exist in the current form. These fields are critical for capturing:
- WHERE goods arrived (port vs airport vs courier)
- WHEN in-transit goods expected to arrive (urgency timing)

**Status:** 🔴 **V4.0 REQUIRES V4.1 UPDATE** to document these missing fields.

---

## 10. Next Steps

**Waiting for Your Direction:**

Would you like me to:
1. ✅ Create Implementation Guide V4.1 with `arrival_method` and `arrival_timeline` fields fully documented?
2. 🔍 Investigate the code inconsistencies (arrived vs arrived_nz, in_transit status)?
3. 📊 Audit urgency scoring formula to verify if these new fields affect scoring?
4. 📋 Create a complete field-by-field comparison between form and guide?

Please advise which action you'd prefer to prioritise.
