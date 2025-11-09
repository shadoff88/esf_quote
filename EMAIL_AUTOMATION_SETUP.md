# Email Automation Setup for Easy Freight Form

## Overview

This document outlines the complete email automation system based on the flowchart in `email_mermaid.mermaid`. The system uses AirTable automations to send targeted emails based on user behavior, urgency scores, and inactivity periods.

---

## 📊 Current AirTable Setup

### Tables

**1. Form Submissions** (Primary table - `tblI8G1VSbw9hww0M`)
- Contains all form data and user information
- Has `urgency_score` (formula field - auto-calculated)
- Has `status` field: in_progress → completed → abandoned
- Has `email_sequence_stage`: none → reminder_sent → follow_up_sent → abandoned

**2. Email Automations** (Tracking table - `tblG0KM2KWttCQTy2`)
- Linked to Form Submissions via email
- Tracks email sending status
- Manages nurture sequence journey stages

---

## 🚨 SMARTER APPROACH: Use Single Table

**Recommendation:** Don't use the Email Automations table. Instead, add all tracking fields directly to Form Submissions table.

**Why?**
- ✅ Simpler - No lookup fields needed
- ✅ Faster - Direct field access in automations
- ✅ Atomic - All data in one place
- ✅ Easier debugging - See everything in one record
- ✅ No sync issues - Can't get out of sync

**Migration Plan:**
Add these fields to Form Submissions table:
```
reminder_sent (checkbox) - default: false
follow_up_sent (checkbox) - default: false
abandoned_email_sent (checkbox) - default: false
journey_stage (single select) - options: new, resources_sent, planning_sent,
                                case_studies_sent, consultation_offered,
                                final_touchpoint, converted, archived
minutes_inactive (formula) - DATETIME_DIFF(NOW(), {last_activity_time}, 'minutes')
hours_inactive (formula) - DATETIME_DIFF(NOW(), {last_activity_time}, 'hours')
days_inactive (formula) - DATETIME_DIFF(NOW(), {last_activity_time}, 'days')
is_urgent (formula) - {urgency_score} >= 8
is_educational (formula) - AND({goods_location} = 'not_shipped_yet', {shipment_method} = 'not_sure')
```

Then **delete** the Email Automations table as it's redundant.

---

## 📧 Email Sequence Structure

### Email Pathways

**URGENT PATHWAY** (urgency_score ≥ 8)
- 3 min: Quick reminder
- 1 hour: Urgent follow-up
- 4 hours: Abandoned + call offer

**STANDARD PATHWAY** (urgency_score < 8, not educational)
- 3 min: Quick reminder
- 24 hours: Standard follow-up
- 48 hours: Abandoned + consultation offer

**EDUCATIONAL PATHWAY** (goods_location='not_shipped_yet' AND shipment_method='not_sure')
- 3 min: Quick reminder
- 24 hours: Educational content
- 48 hours: Abandoned
- Then: 30-day nurture sequence (Days 3, 7, 14, 21, 30)

---

## 🤖 AirTable Automation Setup

### Automation 1: 3-Minute Reminder
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress
- `minutes_inactive` > 3
- `reminder_sent` = false (checkbox is empty)

**Actions:**
1. Send email to `{email}`
   - Subject: "You're almost done with your customs quote!"
   - Body: Include `{first_name}`, resume link with `{airtable_record_id}`
2. Update record:
   - Set `reminder_sent` = true
   - Set `email_sequence_stage` = reminder_sent

**Email Template:**
```html
Hi {first_name},

You started a customs clearance quote just a few minutes ago.

You're only a few steps away from getting your personalized quote!

[Resume Your Quote] → https://esfquote.netlify.app?resume={airtable_record_id}

Need help? Just reply to this email.

Best regards,
Easy Freight Team
```

---

### Automation 2A: Urgent 1-Hour Follow-up
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress
- `is_urgent` = true (formula)
- `hours_inactive` >= 1
- `follow_up_sent` = false

**Actions:**
1. Send email
   - Subject: "⏰ URGENT: Your time-sensitive shipment quote"
   - Emphasize urgency
2. Update record:
   - Set `follow_up_sent` = true
   - Set `email_sequence_stage` = follow_up_sent

---

### Automation 2B: Standard 24-Hour Follow-up
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress
- `is_urgent` = false
- `is_educational` = false
- `hours_inactive` >= 24
- `follow_up_sent` = false

**Actions:**
1. Send email
   - Subject: "Quick questions about your customs clearance?"
   - Helpful tone, offer assistance
2. Update record:
   - Set `follow_up_sent` = true
   - Set `email_sequence_stage` = follow_up_sent

---

### Automation 2C: Educational 24-Hour Follow-up
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress
- `is_educational` = true (formula)
- `hours_inactive` >= 24
- `follow_up_sent` = false

**Actions:**
1. Send email
   - Subject: "Planning your first shipment to NZ?"
   - Educational resources
2. Update record:
   - Set `follow_up_sent` = true
   - Set `email_sequence_stage` = follow_up_sent

---

### Automation 3A: Urgent 4-Hour Abandoned
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress (NOT abandoned yet)
- `is_urgent` = true
- `hours_inactive` >= 4
- `abandoned_email_sent` = false

**Actions:**
1. Send email
   - Subject: "Can we call you about your urgent shipment?"
   - Offer immediate phone consultation
2. Update record:
   - Set `abandoned_email_sent` = true
   - Set `status` = abandoned
   - Set `email_sequence_stage` = abandoned

---

### Automation 3B: Standard 48-Hour Abandoned
**Trigger:** When record enters view
**View Filter:**
- `status` = in_progress
- `is_urgent` = false
- `hours_inactive` >= 48
- `abandoned_email_sent` = false

**Actions:**
1. Send email
   - Subject: "We're here to help with your customs clearance"
   - Book consultation offer
2. Update record:
   - Set `abandoned_email_sent` = true
   - Set `status` = abandoned
   - Set `email_sequence_stage` = abandoned

---

### Automation 4: Educational Nurture - Day 3
**Trigger:** When record enters view
**View Filter:**
- `is_educational` = true
- `status` = abandoned
- `days_inactive` >= 3
- `journey_stage` = blank OR = new

**Actions:**
1. Send email
   - Subject: "📚 Your Customs Clearance Resource Library"
   - Content: Guides, videos, calculators
2. Update record:
   - Set `journey_stage` = resources_sent

---

### Automation 5: Educational Nurture - Day 7
**Trigger:** When record enters view
**View Filter:**
- `is_educational` = true
- `days_inactive` >= 7
- `journey_stage` = resources_sent

**Actions:**
1. Send email
   - Subject: "✅ Your Import Planning Checklist"
   - Content: Step-by-step guide
2. Update record:
   - Set `journey_stage` = planning_sent

---

### Automation 6: Educational Nurture - Day 14
**Trigger:** When record enters view
**View Filter:**
- `is_educational` = true
- `days_inactive` >= 14
- `journey_stage` = planning_sent

**Actions:**
1. Send email
   - Subject: "📊 See How Others Simplified Their Imports"
   - Content: Case studies
2. Update record:
   - Set `journey_stage` = case_studies_sent

---

### Automation 7: Educational Nurture - Day 21
**Trigger:** When record enters view
**View Filter:**
- `is_educational` = true
- `days_inactive` >= 21
- `journey_stage` = case_studies_sent

**Actions:**
1. Send email
   - Subject: "☎️ Free 15-Minute Customs Consultation"
   - Content: Book a call
2. Update record:
   - Set `journey_stage` = consultation_offered

---

### Automation 8: Educational Nurture - Day 30
**Trigger:** When record enters view
**View Filter:**
- `is_educational` = true
- `days_inactive` >= 30
- `journey_stage` = consultation_offered

**Actions:**
1. Send email
   - Subject: "Ready to move forward with your import?"
   - Content: Final check-in
2. Update record:
   - Set `journey_stage` = final_touchpoint

---

### Automation 9: Internal Alert - Urgent Completed Form
**Trigger:** When record matches conditions
**View Filter:**
- `status` = completed (just changed from in_progress)
- `is_urgent` = true

**Actions:**
1. Send email to sales@easyfreight.co.nz
   - Subject: "🚨 URGENT LEAD: {first_name} {last_name}"
   - Include: urgency_score, goods_location, email, phone
   - SLA: Respond within 30 minutes

---

### Automation 10: Daily Lead Summary
**Trigger:** Scheduled daily at 8:00am NZST

**Actions:**
1. Find records from last 24 hours
2. Send summary email to team
   - Urgent queue (urgency_score ≥ 8)
   - Standard queue
   - Educational leads
   - Conversion metrics

---

## 📝 Formula Fields to Add

Add these to Form Submissions table:

### 1. minutes_inactive (Formula)
```
DATETIME_DIFF(NOW(), {last_activity_time}, 'minutes')
```

### 2. hours_inactive (Formula)
```
DATETIME_DIFF(NOW(), {last_activity_time}, 'hours')
```

### 3. days_inactive (Formula)
```
DATETIME_DIFF(NOW(), {last_activity_time}, 'days')
```

### 4. is_urgent (Formula)
```
{urgency_score} >= 8
```

### 5. is_educational (Formula)
```
AND({goods_location} = 'not_shipped_yet', {shipment_method} = 'not_sure')
```

### 6. urgency_score (Formula - Already exists, verify formula)
```
IF(
  {goods_location} = 'arrived', 10,
  IF({goods_location} = '1_2_days', 8,
  IF({goods_location} = '1_week', 5,
  IF({goods_location} = 'more_than_week', 2,
  IF({goods_location} = 'not_shipped_yet', 1, 0)))))
+
IF({cargo_type} = 'food_beverages', 2, 0)
+
IF({cargo_type} = 'chemicals_dangerous', 3, 0)
```

---

## 🎯 Smart Optimization Suggestions

### 1. **Use Views Instead of Complex Filters**
Create named views for each automation trigger:
- View: "3min Reminder Queue"
- View: "Urgent 1h Queue"
- View: "Standard 24h Queue"
- View: "Educational 24h Queue"
- View: "Nurture Day 3 Queue"
- etc.

**Benefit:** Easier to test, debug, and monitor.

### 2. **Add Email Deliverability Fields**
```
email_bounced (checkbox)
email_opened (number) - track opens via tracking pixel
email_clicked (number) - track link clicks
last_email_sent (datetime)
```

### 3. **Add Conversion Tracking**
```
converted (checkbox)
conversion_date (datetime)
conversion_source (single select): reminder_email, follow_up_email, nurture_sequence, direct
days_to_conversion (formula) - DATETIME_DIFF({conversion_date}, {created_time}, 'days')
```

### 4. **Prevent Email Spam**
Add formula field:
```
can_send_email (formula)
IF(
  AND(
    {email_bounced} = FALSE(),
    {status} != 'completed',
    DATETIME_DIFF(NOW(), {last_email_sent}, 'hours') >= 4
  ),
  TRUE(),
  FALSE()
)
```

Use this in all automation view filters.

### 5. **A/B Testing Support**
```
email_variant (single select): A, B, Control
```

Randomly assign in automation, track conversion by variant.

### 6. **Engagement Scoring**
```
engagement_score (formula)
({email_opened} * 2) + ({email_clicked} * 5) + IF({status} = 'completed', 20, 0)
```

High engagement = prioritize for sales team.

---

## 🔄 Implementation Priority

### Phase 1: Core Automations (Week 1)
1. ✅ Add formula fields to Form Submissions
2. ✅ Add tracking checkboxes (reminder_sent, follow_up_sent, etc.)
3. ✅ Create Automation 1: 3-Minute Reminder
4. ✅ Create Automation 2A: Urgent 1-Hour
5. ✅ Create Automation 2B: Standard 24-Hour
6. ✅ Test with real form submissions

### Phase 2: Abandoned Cart (Week 2)
7. ✅ Create Automation 3A: Urgent 4-Hour Abandoned
8. ✅ Create Automation 3B: Standard 48-Hour Abandoned
9. ✅ Create internal alert automation
10. ✅ Monitor and optimize timing

### Phase 3: Nurture Sequence (Week 3)
11. ✅ Create Automations 4-8: Educational nurture sequence
12. ✅ Write email content for all nurture emails
13. ✅ Test full 30-day sequence

### Phase 4: Analytics & Optimization (Week 4)
14. ✅ Add conversion tracking fields
15. ✅ Create daily summary automation
16. ✅ Build reporting dashboard
17. ✅ A/B test subject lines and CTAs

---

## 📧 Email Template Guidelines

### All Emails Should Include:
1. **Personalization:** {first_name}
2. **Clear CTA:** One primary action
3. **Resume Link:** https://esfquote.netlify.app?resume={airtable_record_id}
4. **Mobile-friendly:** 60% of users on mobile
5. **Reply-to:** Direct to sales team
6. **Unsubscribe:** Legal requirement

### Tone by Pathway:
- **Urgent:** Professional, direct, time-sensitive
- **Standard:** Helpful, consultative, patient
- **Educational:** Informative, valuable, non-pushy

---

## 🎯 Success Metrics

### Target KPIs (30-day view)
- **Email Open Rate:** >25%
- **Click-Through Rate:** >15%
- **3-Min Reminder Completion:** >40%
- **Abandoned Recovery:** >20%
- **Urgent Lead Response Time:** <30 minutes
- **Educational Nurture Conversion:** >20% by Day 90

### Monitor Weekly:
- Emails sent by type
- Completion rate by email pathway
- Average time to completion
- Bounce/spam rates
- Conversion by source

---

## 🔧 Technical Implementation Checklist

### AirTable Setup
- [ ] Add formula fields: `minutes_inactive`, `hours_inactive`, `days_inactive`
- [ ] Add formula fields: `is_urgent`, `is_educational`
- [ ] Verify `urgency_score` formula is correct
- [ ] Add checkbox fields: `reminder_sent`, `follow_up_sent`, `abandoned_email_sent`
- [ ] Add `journey_stage` single select field
- [ ] Create views for each automation trigger
- [ ] Delete redundant Email Automations table (optional but recommended)

### Automation Creation
- [ ] Create 10 automations as documented above
- [ ] Write email templates for each automation
- [ ] Add tracking pixels to emails (optional)
- [ ] Set up email deliverability monitoring
- [ ] Test each automation with test records

### Frontend Integration (Optional Enhancement)
- [ ] Add `?resume={record_id}` parameter handling to form
- [ ] Auto-populate form from AirTable record when resume link clicked
- [ ] Show "Welcome back!" message for returning users

---

## 🚨 Important Notes

1. **GDPR/Privacy:** Get explicit consent for marketing emails (consent_checkbox already exists)
2. **Unsubscribe:** All emails must have unsubscribe link
3. **Rate Limiting:** AirTable automation limits:
   - Free: 100 automation runs/month
   - Plus: 25,000 runs/month
4. **Timing:** All times based on `last_activity_time` which updates on each step save
5. **Testing:** Test with your own email before going live
6. **Monitoring:** Check AirTable automation run history daily for first week

---

**Document Version:** 1.0
**Last Updated:** 9th November 2025
**Created By:** AI Developer (Claude)
