# Easy Freight Production Deployment Checklist

## ✅ Completed Tasks

### 1. Consent Text Updated
- Changed from "estimate pricing of services and to contact me regarding my customs clearance inquiry"
- To: "prepare an estimate and contact me about my quote request"

### 2. Icons Removed (Partial)
- Removed major emoji icons from form fields
- Removed FontAwesome icons from container calculator
- Remaining: Few icons in navigation buttons and modals

### 3. Quote Reference Format Updated
- New format: EF-[YYYYMMDDHHmmss]
- Added `generateReferenceId()` method
- All quote references now use timestamp format

### 4. Customs Client Code Fee Updated
- Increased from NZD $65 to NZD $95
- Updated in all locations (display text, calculations, quotes)

### 5. Google Places API Added
- Script added to index.html
- API Key: AIzaSyATHnCNdVj_VrJNTFlNrvh3ilQNjgfRD1c
- Ready for address autocomplete implementation

## 🔄 In Progress / Pending Tasks

### High Priority

#### 3. Google Places Autocomplete Implementation
-Status: Script added, need to implement initMap() and attach to address fields
- Location: delivery_address textarea fields
- Required: initMap() function and autocomplete initialization

#### 16. getFieldDisplayValue() Method
- Status: Not started
- Need to create method that converts raw values to user-friendly labels
- Examples: sea_freight → "Sea Freight", lcl → "LCL"
- Update all quote generation to use display values

#### 18. Add Easy Freight Logo
- Status: Not started  
- Logo URL: https://easyfreight.co.nz/wp-content/themes/easyfreight/img/logo.svg
- Color: #170b33
- Replace "Easy Freight" text in viewable and print quotes

#### 8. Hide Print/Pay Buttons for Specialist Routes
- Status: Not started
- Condition: if routing_decision === 'specialist'
- Show only Reference ID for specialist communication

#### 6. Google Drive Integration Prep
- Status: Not started
- All upload buttons need Google Drive upload functionality
- Airtable to store Google Drive links

#### 7. Airtable Integration Prep
- Status: Not started
- Store all form fields and steps
- Store final submitted data
- Link to Google Drive uploads

### Medium Priority

#### 4. Remove "Need help creating" Buttons
- Status: Not started
- Location: Commercial Invoice and MSDS sections in Export Document Upload
- Simply remove these helper buttons

#### 5. Fix Packing List Upload Functionality
- Status: Not started
- Current upload button doesn't work properly
- Needs integration with Google Drive

#### 9. Remove Planning Assistance/Urgency Block
- Status: Not started
- Remove from final results screen
- Keep other quote information

#### 10. Remove Download Data Button
- Status: Not started
- Remove from final screen
- Data will be generated from Airtable instead

#### 13. Remove Alert from Use This Calculation
- Status: Not started
- Just paste to Packing Details field and close popup
- No browser alert needed

#### 14. Add 15px Gap Between Columns
- Status: Not started
- Location: Step 9 Request Summary on desktop view
- CSS adjustment needed

#### 15. Add Pay Now Button
- Status: Not started
- Replace Download Data button
- Center placement
- Link to Airtable/Stripe integration

#### 19. Add Broker Assignment Notification
- Status: Not started
- Location: Final step where Urgency block was
- Text: "Task has been assigned to the brokers and we will be in contact soon, please review quote estimate below."

#### 23. Update Top Bar When Submitted
- Status: Not started
- Change "Ready to submit" to "Submitted"
- Hide "Step 9 of 9" text

#### 17. Ensure Consistent Font Family
- Status: Partially done
- Need to verify Arial is used throughout entire form
- Check all sections and modals

### Low Priority

#### 12. Packing Details Text Color
- Status: Not started
- Change text color to #000000
- Differentiate from placeholder

#### 20. Add Terms & Conditions Link
- Status: Not started
- Location: Payment term section
- Text: "Additional information is in Terms & Conditions"
- Link: https://easyfreight.co.nz/wp-content/themes/easyfreight/terms/terms_conditions.pdf

#### 22. Remove � Symbols
- Status: Not started
- Location: Step 9 Document Status
- Remove from Commercial Invoice and Packing List

## 📋 Implementation Notes

### Google Places Autocomplete
```javascript
function initMap() {
    // Initialize autocomplete for delivery address fields
    const addressFields = document.querySelectorAll('[name="delivery_address"]');
    addressFields.forEach(field => {
        const autocomplete = new google.maps.places.Autocomplete(field, {
            componentRestrictions: { country: 'nz' },
            fields: ['formatted_address', 'address_components']
        });
    });
}
```

### getFieldDisplayValue() Method
```javascript
getFieldDisplayValue(field, value) {
    const displayMappings = {
        shipment_method: {
            'sea_freight': 'Sea Freight',
            'air_freight': 'Air Freight',
            'courier': 'Courier/Express'
        },
        container_type: {
            'fcl': 'FCL (Full Container Load)',
            'lcl': 'LCL (Less than Container Load)'
        },
        // Add more mappings as needed
    };
    
    return displayMappings[field]?.[value] || value;
}
```

### Logo Implementation
Replace in viewable quote:
```html
<div class="header">
    <img src="https://easyfreight.co.nz/wp-content/themes/easyfreight/img/logo.svg" 
         alt="Easy Freight" 
         style="height: 60px; filter: brightness(0) saturate(100%) invert(8%) sepia(17%) saturate(4858%) hue-rotate(246deg) brightness(92%) contrast(98%);">
    <div class="company-tagline">Licensed Customs Broker & Freight Forwarder</div>
</div>
```

## 🚀 Next Steps for Developer

1. Implement Google Places autocomplete with initMap()
2. Create getFieldDisplayValue() method and update all quote displays
3. Add Easy Freight logo to quotes
4. Implement specialist route conditional logic for buttons
5. Set up Google Drive upload integration
6. Set up Airtable integration
7. Complete remaining UI/UX refinements

## ⚠️ Important Notes

- All file uploads should go to Google Drive
- Airtable stores all form data and Google Drive links
- Specialist routes show Reference ID only (no pricing/pay buttons)
- Quote Reference format must be EF-[YYYYMMDDHHmmss]
- Customs Code fee is NZD $95 (not $65)
