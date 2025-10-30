# Easy Freight - Mermaid Flowcharts V4.1

**Version 4.1** - Updated with arrival_method and arrival_timeline fields  
**Last Updated**: 23 October 2025  
**Compatible with**: Mermaid Live Editor, draw.io (with Mermaid plugin), Notion, Obsidian

---

## 🎯 V4.1 Updates

**Changes from V2.0:**
1. ✅ **ADDED:** arrival_method field to Flowchart 1 (Import Form Progression)
2. ✅ **ADDED:** arrival_timeline field to Flowchart 1 (Import Form Progression)
3. ✅ **UPDATED:** Flowchart 3 (Form Step Progression) with conditional arrival fields
4. ✅ **CLARIFIED:** goods_location = 'arrived' means "arrived_nz" (in port/airport)
5. ✅ **CLARIFIED:** In-transit states (1_2_days, 1_week, more_than_week) show arrival_timeline
6. ✅ **MAINTAINED:** All field mappings align with Implementation Guide V4.1

---

## How to Use These Flowcharts

### Mermaid Live Editor (Recommended)
1. Visit: https://mermaid.live
2. Copy the code block for each flowchart
3. Paste into the editor
4. Diagram renders automatically
5. Export as PNG/SVG for documentation

### draw.io
1. Install Mermaid plugin
2. Insert → Advanced → Mermaid
3. Paste the code
4. Render diagram

### Notion/Obsidian
1. Create code block with language set to `mermaid`
2. Paste the flowchart code
3. Renders automatically (Notion: use `/code`, select Mermaid)

---

## Flowchart 1: Import Form Progression with Conditional Fields

**Purpose:** Shows complete import pathway with all conditional field branches

**Field Mappings:**
- All form field names match AirTable Base field names
- All conditions match Implementation Guide V4.1 conditional logic
- arrival_method and arrival_timeline fields shown in correct conditional branches

```mermaid
flowchart TD
    Start([User Starts Form]) --> Direction{direction}
    Direction -->|import| GoodsLocation[goods_location<br/>5 options]
    Direction -->|export| ExportPath[Export Pathway<br/>See Flowchart 2]
    
    GoodsLocation --> LocationCheck{Which option?}
    
    LocationCheck -->|arrived| ArrivalMethod[arrival_method<br/>WHERE arrived:<br/>sea_port / air_freight<br/>courier / other]
    LocationCheck -->|1_2_days / 1_week<br/>more_than_week| ArrivalTimeline[arrival_timeline<br/>WHEN expected:<br/>within_week / 1_4_weeks<br/>over_month]
    LocationCheck -->|not_shipped_yet| ShippingPayment[shipping_payment<br/>CIF / FOB / EXW / not_sure]
    
    ArrivalMethod --> ServiceDetails[Service Classification]
    ArrivalTimeline --> ServiceDetails
    ShippingPayment --> EducationalCheck{shipment_method<br/>selection}
    
    EducationalCheck -->|not_sure| Educational[Educational Pathway<br/>routing=education]
    EducationalCheck -->|air_freight<br/>sea_freight<br/>courier| ServiceDetails
    
    ServiceDetails --> ShipmentMethod[shipment_method<br/>air / sea / courier]
    
    ShipmentMethod -->|sea_freight| ContainerType[container_type<br/>LCL / FCL]
    ShipmentMethod -->|air_freight| AirWeight[air_weight_category<br/>under_100kg / over_100kg]
    ShipmentMethod -->|courier| CourierFlow[Courier selected]
    
    ContainerType --> CargoType[cargo_type]
    AirWeight --> CargoType
    CourierFlow --> CargoType
    
    CargoType --> CargoCheck{Which type?}
    
    CargoCheck -->|general_goods| CargoDetails[cargo_details<br/>optional text]
    CargoCheck -->|other| OtherDescription[other_cargo_description<br/>required text]
    CargoCheck -->|personal_effects<br/>vehicles_machinery| PersonalCondition[personal_item_condition<br/>used / new / both]
    CargoCheck -->|food_beverages<br/>chemicals_dangerous| TempControl[requires_temperature_control<br/>checkbox +$67]
    CargoCheck -->|Other types| Documents[Document Upload]
    
    CargoDetails --> Documents
    OtherDescription --> Documents
    PersonalCondition --> MixedCheck{condition=both?}
    MixedCheck -->|Yes| MixedCheckbox[personal_item_mixed<br/>checkbox]
    MixedCheck -->|No| Documents
    MixedCheckbox --> Documents
    TempControl --> Documents
    
    Documents --> PackingCheck{packing_list<br/>status?}
    PackingCheck -->|dont_have| PackingText[packing_info_combined<br/>manual entry required]
    PackingCheck -->|upload| CustomsCode[customs_code_status]
    
    PackingText --> CustomsCode
    CustomsCode --> CodeCheck{have_code?}
    CodeCheck -->|Yes| CodeNumber[customs_code_number<br/>8 characters]
    CodeCheck -->|No| Review[Step 9: Review]
    CodeNumber --> Review
    
    Review --> Scoring[Calculate Scores:<br/>urgency_score<br/>complexity_score<br/>readiness_score]
    Scoring --> Routing[routing_decision:<br/>urgent / standard<br/>specialist / education]
    Routing --> Submit([Form Submitted])
    
    Educational --> CargoType

    style ArrivalMethod fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style ArrivalTimeline fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Educational fill:#fff9c4,stroke:#f57c00
    style Routing fill:#c8e6c9,stroke:#388e3c
```

---

## Flowchart 2: Export Form Progression

**Purpose:** Shows export pathway (no changes from V2.0 - included for completeness)

```mermaid
flowchart TD
    Start([Direction: Export]) --> ExportService[export_service_needed<br/>full_service / docs_only]
    ExportService --> DestCountry[destination_country<br/>dropdown]
    DestCountry --> CargoType[cargo_type]
    
    CargoType --> CargoCheck{Which type?}
    
    CargoCheck -->|general_goods| CargoDetails[cargo_details<br/>optional]
    CargoCheck -->|other| OtherDescription[other_cargo_description<br/>required]
    CargoCheck -->|personal_effects<br/>vehicles_machinery| PersonalCondition[personal_item_condition]
    CargoCheck -->|food_beverages<br/>chemicals_dangerous| TempControl[requires_temperature_control]
    CargoCheck -->|Other types| Documents[Document Upload]
    
    CargoDetails --> Documents
    OtherDescription --> Documents
    PersonalCondition --> Documents
    TempControl --> Documents
    
    Documents --> HazCheck{chemicals_dangerous?}
    HazCheck -->|Yes| MSDS[MSDS required]
    HazCheck -->|No| ExportDocs[Export Declaration<br/>required]
    MSDS --> ExportDocs
    
    ExportDocs --> Review[Step 9: Review]
    Review --> Scoring[Calculate Scores]
    Scoring --> Routing[routing_decision]
    Routing --> Submit([Form Submitted])
    
    style Routing fill:#c8e6c9,stroke:#388e3c
```

---

## Flowchart 3: Complete Form Step Progression (All Pathways)

**Purpose:** Shows all form steps including conditional arrival fields

**Updated for V4.1:** arrival_method and arrival_timeline steps added

```mermaid
flowchart TD
    Step1[Step 1: Contact Information<br/>first_name, last_name<br/>company_name, email, phone<br/>consent_checkbox] --> Step2
    
    Step2[Step 2: Classification<br/>direction: import/export<br/>customer_type: business/personal] --> DirectionSplit{direction?}
    
    DirectionSplit -->|import| Step3Import[Step 3: Goods Location<br/>goods_location:<br/>arrived, 1_2_days, 1_week<br/>more_than_week, not_shipped_yet]
    DirectionSplit -->|export| Step3Export[Step 3: Export Service<br/>export_service_needed<br/>destination_country]
    
    Step3Import --> GoodsCheck{goods_location?}
    
    GoodsCheck -->|arrived| Step3a[Step 3a: Arrival Method<br/>arrival_method:<br/>sea_port, air_freight<br/>courier, other]
    GoodsCheck -->|1_2_days / 1_week<br/>more_than_week| Step3b[Step 3b: Arrival Timeline<br/>arrival_timeline:<br/>within_week, 1_4_weeks<br/>over_month]
    GoodsCheck -->|not_shipped_yet| Step4Payment[Step 4: Shipping Payment<br/>shipping_payment:<br/>CIF, FOB, EXW, not_sure]
    
    Step3a --> Step5Import[Step 5: Service Details]
    Step3b --> Step5Import
    Step4Payment --> Step5Import
    
    Step5Import[Step 5: Service Classification<br/>local_delivery<br/>needs_port_delivery<br/>shipment_method<br/>container_type OR air_weight_category] --> Step6Import
    
    Step3Export --> Step6Export[Step 6: Cargo Type]
    
    Step6Import[Step 6: Cargo Type<br/>cargo_type selection<br/>conditional fields:<br/>cargo_details, other_description<br/>personal_condition, temp_control] --> Step7Import
    
    Step6Export --> Step7Export[Step 7: Documents]
    
    Step7Import[Step 7: Documents<br/>Conditional based on:<br/>shipment_method<br/>goods_location<br/>cargo_type] --> Step8Import
    
    Step7Export --> Step8Export[Step 8: Review]
    
    Step8Import[Step 8: Customs Code<br/>customs_code_status<br/>customs_code_number] --> Step9Import
    
    Step9Import[Step 9: Review All Details<br/>Reference ID: EF-timestamp<br/>Print Quote Option<br/>Download Data Options] --> Scoring
    
    Step8Export[Step 8: Review All Details<br/>Reference ID: EF-timestamp<br/>Print Quote Option<br/>Download Data Options] --> Scoring
    
    Scoring[Automatic Scoring:<br/>urgency_score<br/>complexity_score<br/>readiness_score] --> Routing
    
    Routing[routing_decision:<br/>urgent / standard<br/>education / specialist] --> Submit([Form Submitted<br/>Email sent<br/>AirTable record created])
    
    style Step3a fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Step3b fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Step4Payment fill:#fff9c4,stroke:#f57c00
    style Routing fill:#c8e6c9,stroke:#388e3c
```

---

## Flowchart 4: Urgency Scoring Logic

**Purpose:** Shows urgency score calculation with arrival_timeline context

**Updated for V4.1:** Shows arrival_timeline field captured but not yet used in scoring

```mermaid
flowchart TD
    Start([Calculate Urgency Score]) --> GoodsLocation{goods_location}
    
    GoodsLocation -->|arrived| Score10[Base Score: 10<br/>HIGHEST PRIORITY<br/>Goods in port/airport]
    
    GoodsLocation -->|1_2_days| CheckAir{shipment_method<br/>= air_freight?}
    CheckAir -->|Yes| Score9[Base Score: 9<br/>URGENT Air Freight]
    CheckAir -->|No| Score8[Base Score: 8<br/>HIGH Arriving 48hrs]
    
    GoodsLocation -->|1_week| Score5[Base Score: 5<br/>MEDIUM Within week]
    
    GoodsLocation -->|more_than_week| Score2[Base Score: 2<br/>LOW More than week]
    
    GoodsLocation -->|not_shipped_yet| Score1[Base Score: 1<br/>PLANNING Not shipped]
    
    Score10 --> TimelineNote[arrival_timeline captured<br/>but NOT in scoring]
    Score9 --> TimelineNote
    Score8 --> TimelineNote
    Score5 --> TimelineNote
    Score2 --> TimelineNote
    Score1 --> CargoMod{cargo_type?}
    
    TimelineNote --> CargoMod
    
    CargoMod -->|food_beverages| AddFood[Add 2 points<br/>Perishable urgency]
    CargoMod -->|chemicals_dangerous| AddHaz[Add 3 points<br/>Safety urgency]
    CargoMod -->|Other| NoAdd[No modifier]
    
    AddFood --> Cap[Cap at maximum 10]
    AddHaz --> Cap
    NoAdd --> Cap
    
    Cap --> Final[Final urgency_score<br/>Range: 1-10]
    Final --> End([Score Calculated])
    
    style Score10 fill:#ff5252,color:#fff
    style Score9 fill:#ff7043,color:#fff
    style Score8 fill:#ffa726
    style Score5 fill:#fff176
    style Score2 fill:#aed581
    style Score1 fill:#81c784
    style TimelineNote fill:#e1f5ff,stroke:#0288d1,stroke-width:2px,stroke-dasharray: 5 5
```

**Note:** The `arrival_timeline` field is captured in the form but NOT currently used in the urgency scoring formula. The dashed box indicates this is additional context data available for future enhancements or customer service planning.

---

## Flowchart 5: Routing Decision Logic

**Purpose:** Shows routing hierarchy (no changes - included for completeness)

```mermaid
flowchart TD
    Start([Routing Decision]) --> Check1{goods_location = not_shipped_yet<br/>AND<br/>shipment_method = not_sure?}
    
    Check1 -->|Yes| Education[EDUCATION<br/>Educational pathway]
    Check1 -->|No| Check2{container_type = fcl?}
    
    Check2 -->|Yes| Specialist1[SPECIALIST<br/>FCL requires forwarding]
    Check2 -->|No| Check3{urgency_score >= 8?}
    
    Check3 -->|Yes| Urgent[URGENT<br/>Immediate action]
    Check3 -->|No| Check4{complexity_score >= 8?}
    
    Check4 -->|Yes| Specialist2[SPECIALIST<br/>Complex goods]
    Check4 -->|No| Check5{shipping_payment = CIF<br/>AND<br/>urgency_score >= 4?}
    
    Check5 -->|Yes| Standard1[STANDARD<br/>Customs clearance only]
    Check5 -->|No| Check6{shipping_payment = FOB/EXW<br/>AND<br/>complexity_score >= 4?}
    
    Check6 -->|Yes| Specialist3[SPECIALIST<br/>Forwarding complexity]
    Check6 -->|No| Check7{urgency_score >= 4<br/>AND<br/>readiness_score >= 6<br/>OR<br/>urgency_score >= 4<br/>AND<br/>shipment_method = sea_freight?}
    
    Check7 -->|Yes| Standard2[STANDARD<br/>Ready to process]
    Check7 -->|No| Default[EDUCATION<br/>Needs guidance]
    
    Education --> End([Routing Complete])
    Specialist1 --> End
    Urgent --> End
    Specialist2 --> End
    Standard1 --> End
    Specialist3 --> End
    Standard2 --> End
    Default --> End
    
    style Education fill:#fff9c4,stroke:#f57c00,stroke-width:3px
    style Urgent fill:#ff5252,color:#fff,stroke-width:3px
    style Standard1 fill:#4caf50,color:#fff,stroke-width:3px
    style Standard2 fill:#4caf50,color:#fff,stroke-width:3px
    style Specialist1 fill:#9c27b0,color:#fff,stroke-width:3px
    style Specialist2 fill:#9c27b0,color:#fff,stroke-width:3px
    style Specialist3 fill:#9c27b0,color:#fff,stroke-width:3px
    style Default fill:#fff9c4,stroke:#f57c00,stroke-width:3px
```

---

## Field Mapping Reference

All flowchart field names map directly to:
- **Web Form:** HTML input names
- **AirTable Base:** Field names (columns)
- **Implementation Guide V4.1:** Section 2 Complete Field Mapping table

### Key V4.1 Field Additions:

| Flowchart Reference | AirTable Field Name | Type | Conditional |
|---------------------|---------------------|------|-------------|
| `arrival_method` | Arrival Method | Single Select | goods_location = 'arrived' |
| `arrival_timeline` | Expected Arrival Timeline | Single Select | goods_location IN (1_2_days, 1_week, more_than_week) |

### goods_location Values Clarification:

| Value | Meaning | State |
|-------|---------|-------|
| `arrived` | Goods already in NZ port/airport (arrived_nz) | Arrived |
| `1_2_days` | Arriving within 48 hours | In-transit |
| `1_week` | Arriving within one week | In-transit |
| `more_than_week` | Arriving more than a week | In-transit |
| `not_shipped_yet` | Not shipped yet | Planning |

---

## Usage Notes

1. **Complete Alignment:** All flowcharts match Implementation Guide V4.1
2. **Color Coding:**
   - Blue boxes with thick borders = V4.1 NEW fields (arrival_method, arrival_timeline)
   - Yellow = Educational pathway
   - Green = Standard routing
   - Red = Urgent routing
   - Purple = Specialist routing
   - Dashed blue = Captured but not yet used in logic

3. **Conditional Logic:** All conditional branches match AirTable conditional field rules
4. **Field Names:** Use exact names from flowcharts when creating AirTable fields

---

## Version History

- **V4.1** (23 Oct 2025): Added arrival_method and arrival_timeline fields, clarified goods_location meanings
- **V2.0** (22 Oct 2025): Fixed Unicode characters for Mermaid v11 compatibility
- **V1.0** (Initial): Original 4 flowcharts

---

**END OF MERMAID FLOWCHARTS V4.1**
