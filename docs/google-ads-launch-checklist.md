# Google Ads Launch Checklist for VBC Bharat

Primary launch service: Insurance Claim Support.

Primary landing page:
- `https://www.vbcbharat.com/insurance-claim-support`

## 1. Required Vercel Environment Variables

Set these in Vercel for the `frontend` project:

```env
NEXT_PUBLIC_SITE_URL=https://www.vbcbharat.com
NEXT_PUBLIC_API_BASE_URL=https://api.vbcbharat.com
NEXT_PUBLIC_BRAND_NAME=VB Consultants
NEXT_PUBLIC_PUBLIC_PHONE=+917327854329
NEXT_PUBLIC_WHATSAPP_NUMBER=917327854329
NEXT_PUBLIC_PUBLIC_EMAIL=consult@api.vbcbharat.com

NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=
NEXT_PUBLIC_GOOGLE_ADS_INSURANCE_LEAD_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_FORM_SUBMIT_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CLICK_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_PHONE_CLICK_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_DOCUMENT_UPLOAD_LABEL=

NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_URL=
NEXT_PUBLIC_GOOGLE_REVIEW_URL=
```

Keep values blank until the real Google IDs are available. Blank tracking values do not break the build.

## 2. Google Ads Conversion Labels Needed

Create conversion actions for:
- Insurance lead submit
- General form submit
- WhatsApp click
- Phone click
- Document upload submit

Copy each conversion label into the matching Vercel variable.

## 3. GTM / GA4 Values Needed

Recommended:
- Google Tag Manager container ID: `GTM-XXXXXXX`
- GA4 Measurement ID: `G-XXXXXXXXXX`
- Google Ads conversion ID: `AW-XXXXXXXXXX`

If GTM is used for all tags, still keep the frontend conversion labels available for direct conversion events.

## 4. Recommended First Campaign Structure

Campaigns:
- Insurance Claim Rejected
- Health Insurance Claim Help
- Cashless Claim Denied
- Mediclaim Reimbursement Stuck
- Motor Insurance Claim Support

Ad groups:
- Insurance claim rejected help
- Health insurance claim rejected
- Cashless claim denied
- Mediclaim reimbursement stuck
- Motor insurance claim dispute
- Claim amount reduced
- Insurance claim delay

## 5. Landing Pages

Use these pages first:
- `/insurance-claim-support`
- `/insurance-claim-rejected`
- `/health-insurance-claim-help`
- `/cashless-claim-denied`
- `/mediclaim-reimbursement-help`
- `/motor-insurance-claim-support`

Cross-sell pages shown to ad visitors:
- `/salary-itr-filing`
- `/gst-services`
- `/tax-notice-help`
- `/loan-project-report`

## 6. Negative Keywords

Start with:
- job
- salary
- pdf
- free meaning
- government job
- template
- sample letter
- format only
- course
- training
- recruitment
- login

Review search terms daily during the first week.

## 7. Pre-Spend Testing Steps

1. Open `/insurance-claim-support` on mobile.
2. Confirm hero says: “Insurance Claim Rejected or Delayed? Get Claim Support”.
3. Click `Call Now` and confirm phone opens.
4. Click `Talk on WhatsApp` and confirm WhatsApp opens with a prefilled message.
5. Submit the guest request form with a test phone.
6. Confirm `/thank-you?service=insurance-claim-support&request=...` opens.
7. Confirm the request appears in backend admin.
8. Open `/upload-documents?service=insurance-claim-support`.
9. Upload multiple test files and confirm every file appears in admin.
10. Test with URL params: `?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=test123`.
11. Confirm admin request/lead shows source, campaign, landing page and service.
12. Confirm missing tracking IDs do not break the page.

## 8. What To Verify Before Spending Money

- Google Business Profile links are configured.
- Phone number is `+91 73278 54329`.
- WhatsApp number is `917327854329`.
- Privacy Policy and Terms are linked in footer.
- Lead form does not force login.
- Thank-you page fires conversion once per request/session.
- Admin can identify Google Ads insurance leads.
- SMTP is not required for lead creation.
- No fake guarantee wording appears.
