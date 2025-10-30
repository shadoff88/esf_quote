# Remaining Production Fixes - Easy Freight Form

## ✅ Just Completed
1. Removed remaining icons from Steps 2, 4, 5, 6, 7
   - From New Zealand (removed 🌏)
   - Business/Personal (removed 🏢 and 👤)
   - FCL container (removed 🚛)
   - Delivery Yes/No (removed ✅ and 📦)
   - Temperature control (removed ❄️ and 🌡️)
   - Payment terms (removed 🏭 and 🏪)
   - Document icons: Bill of Lading, Air Waybill, MSDS (changed all to 📄)

2. Updated Google Places API script to new bootstrap loader

## 🔴 CRITICAL - Still Need to Fix

### 1. Google Places Autocomplete Implementation
**Status**: Script loaded but not initialized
**Action Required**: Add initialization code in js/app.js

```javascript
// Add after EasyFreightForm class definition
async function initAddressAutocomplete() {
    const { PlacesService, AutocompleteSuggestion } = await google.maps.importLibrary("places");
    
    // Function to initialize autocomplete on address fields
    const setupAutocomplete = () => {
        const addressFields = document.querySelectorAll('[name="delivery_address"]');
        
        addressFields.forEach(field => {
            if (field && !field.dataset.autocompleteInitialized) {
                const autocompleteInput = new google.maps.places.PlaceAutocompleteElement({
                    componentRestrictions: { country: ['nz'] },
                });
                
                autocompleteInput.addEventListener('gmp-placeselect', async ({ place }) => {
                    await place.fetchFields({
                        fields: ['displayName', 'formattedAddress'],
                    });
                    
                    field.value = place.formattedAddress;
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                });
                
                // Insert autocomplete element before textarea
                field.parentNode.insertBefore(autocompleteInput, field);
                field.style.display = 'none'; // Hide original field
                field.dataset.autocompleteInitialized = 'true';
            }
        });
    };
    
    // Setup on page load
    setupAutocomplete();
    
    // Re-setup when form changes (MutationObserver)
    const observer = new MutationObserver(setupAutocomplete);
    observer.observe(document.getElementById('formContent'), {
        childList: true,
        subtree: true
    });
}

// Initialize when Google Maps loads
window.addEventListener('load', () => {
    if (window.google && window.google.maps) {
        initAddressAutocomplete();
    }
});
```

### 2. Upload File Functionality
**Status**: Not working, needs fixing
**Locations**: 
- Packing List upload
- All document uploads

**Action Required**:
1. Find current upload button implementation
2. Fix file selection trigger
3. Add file display
4. Prepare for Google Drive integration

**Search for**: `Upload file`, `file upload`, `document upload`

### 3. Shipping Method Display Fix
**Issue**: Shows "sea_freight" instead of "Sea Freight" on final screen
**Location**: Final screen quote display

**Investigation needed**: 
- Check if it's in the final quote HTML or results screen
- The review step uses correct labels from generateSummary()
- May need to update getShipmentMethodDisplayText() usage

### 4. Center Align Button Labels
**Status**: Not done
**Action**: Add CSS to center all button text

```css
/* Add to css/style.css */
.btn, button {
    text-align: center;
}
```

### 5. Terms & Conditions Link
**Status**: Not done
**Location**: Payment Terms section in quote display
**Text to Add**: "Additional information is in Terms & Conditions"
**Link**: https://easyfreight.co.nz/wp-content/themes/easyfreight/terms/terms_conditions.pdf

**Location in code**: Around line 3672 in js/app.js (Payment Terms section)

```javascript
<div style="padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.4rem; font-size: 0.7rem;">
    <strong>Payment Terms:</strong> Easy Freight service fee payable before work begins. Government fees collected separately when known.
    <br><br>
    Additional information is in <a href="https://easyfreight.co.nz/wp-content/themes/easyfreight/terms/terms_conditions.pdf" target="_blank" style="color: #fff; text-decoration: underline;">Terms & Conditions</a>
</div>
```

### 6. Broker Assignment Notification
**Status**: Not done  
**Location**: Final screen - replace Urgency status section
**Text**: "Task has been assigned to the brokers and we will be in contact soon, please review quote estimate below."

**Action**: Find urgency display section and replace with notification

### 7. Remove � and ⏳ from Document Status
**Status**: Not done
**Location**: Step 9 Review - Document Status section
**Action**: Find and remove these symbols from Commercial Invoice and Packing List

**Search for**: `�`, `⏳`, or check document status rendering

### 8. Replace Download Data with Pay Now Button
**Status**: Not done
**Location**: Final screen (results)
**Action**:
1. Remove Download Data button (ID: downloadSubmissionBtn)
2. Add Pay Now button (centered)
3. Prepare for Airtable/Stripe integration

```javascript
// Replace in results screen generation
<button id="payNowBtn" class="btn btn-success" style="margin: 0 auto; display: block;">
    Pay Now
</button>
```

### 9. Remove Urgency Status Section
**Status**: Not done
**Location**: Final screen results
**Action**: Find and remove urgency indication display

### 10. Remove "Need help creating" Buttons
**Status**: Not done
**Locations**: 
- Commercial Invoice section (Export)
- MSDS section (Export)

**Search for**: "Need help creating"

### 11. Ensure All Upload Labels Say "Upload file(s)"
**Status**: Needs verification
**Action**: Check all upload buttons have consistent labeling

## 📋 Quick Implementation Guide

### Priority Order:
1. **Fix Upload Functionality** (Critical for usability)
2. **Terms & Conditions Link** (Legal requirement)
3. **Pay Now Button** (Business critical)
4. **Broker Notification** (User experience)
5. **Remove symbols from Document Status** (Visual bug)
6. **Remove "Need help" buttons** (Simplification)
7. **Center button labels** (Visual polish)
8. **Shipping Method display** (Data display bug)
9. **Google Places Autocomplete** (Enhancement)
10. **Remove Urgency section** (Cleanup)

### Estimated Time:
- Quick fixes (5-10): 2-3 hours
- Upload functionality fix: 2-4 hours
- Google Places implementation: 1-2 hours
- **Total: 5-9 hours**

## 🔍 Search Patterns to Find Code

```bash
# Find upload functionality
grep -r "Upload file" js/
grep -r "file upload" js/
grep -r "uploadModal" js/

# Find Download Data button
grep -r "downloadSubmissionBtn" js/

# Find Urgency display
grep -r "urgency" js/ | grep -i "display\|show\|render"

# Find "Need help creating"
grep -r "Need help creating" js/

# Find document status symbols
grep -r "⏳\|�" js/

# Find shipping method display in final screen
grep -r "Shipping Method" js/ | grep -v "step-title"
```

## ✅ Changes Already Made Today

1. ✅ Consent text updated
2. ✅ Most icons removed (form is 95% icon-free now)
3. ✅ Quote Reference format (EF-YYYYMMDDHHmmss)
4. ✅ Customs Code fee ($65 → $95)
5. ✅ Easy Freight logo added to quotes
6. ✅ getFieldDisplayValue() method created
7. ✅ Packing Details text color (#000000)
8. ✅ Calculator alert removed
9. ✅ Google Places API script updated

## 🎯 Next Developer Actions

1. Run the search patterns above to locate code sections
2. Implement fixes in priority order
3. Test each fix as you go
4. Update this document with completion status
5. Final testing of all functionality

All code examples and guidance are provided above for each remaining fix.
