import { fetchCms } from "@/lib/cms";

export type DocumentRequirement = {
  serviceSlug: string;
  documentKey: string;
  title: string;
  description: string;
  required: boolean;
  allowMultiple: boolean;
  sortOrder: number;
};

export const documentServiceOptions = [
  { value: "insurance-claim-support", label: "Insurance Claim Support" },
  { value: "insurance-claim-documentation-support", label: "Insurance Claim Documentation" },
  { value: "insurance-claim-rejected", label: "Insurance Claim Rejected" },
  { value: "health-insurance-claim-help", label: "Health Insurance Claim" },
  { value: "life-insurance-claim-assistance", label: "Life Insurance Claim Assistance" },
  { value: "motor-insurance-claim-support", label: "Motor Insurance Claim Support" },
  { value: "personal-accident-insurance-claim", label: "Personal Accident Claim" },
  { value: "claim-form-preparation-support", label: "Claim Form Preparation" },
  { value: "insurance-claim-follow-up", label: "Insurance Claim Follow-up" },
  { value: "settlement-documentation-assistance", label: "Settlement Documentation" },
  { value: "nominee-claim-assistance", label: "Nominee Claim Assistance" },
  { value: "mediclaim-reimbursement-help", label: "Mediclaim Reimbursement" },
  { value: "cashless-claim-denied", label: "Cashless Claim Denied" },
  { value: "life-insurance-claim-dispute", label: "Life Insurance Claim Dispute" },
  { value: "motor-insurance-claim-dispute", label: "Motor Insurance Claim Dispute" },
  { value: "property-insurance-claim-help", label: "Property / Business Insurance Claim" },
  { value: "insurance-legal-escalation-support", label: "Insurance Legal Escalation" },
  { value: "salary-itr-filing", label: "Salary ITR / Form 16" },
  { value: "itr-1-filing", label: "ITR-1 Filing" },
  { value: "itr-2-capital-gains-filing", label: "ITR-2 / Capital Gains" },
  { value: "freelancer-business-itr", label: "Freelancer / Business ITR" },
  { value: "gst-registration", label: "GST Registration" },
  { value: "gst-return-filing", label: "GST Return Filing" },
  { value: "bookkeeping", label: "Bookkeeping" },
  { value: "tds-return-filing", label: "TDS Return Filing" },
  { value: "tax-notice-help", label: "Tax Notice Help" },
  { value: "business-registration", label: "Business Registration" },
  { value: "msme-udyam-registration", label: "MSME / Udyam Registration" },
  { value: "loan-project-report", label: "Loan Project Report" },
  { value: "subsidy-scheme-guidance", label: "Subsidy Scheme Guidance" },
  { value: "not-sure", label: "Not Sure" }
] as const;

function req(
  serviceSlug: string,
  documentKey: string,
  title: string,
  description: string,
  required = false,
  allowMultiple = false,
  sortOrder = 0
): DocumentRequirement {
  return { serviceSlug, documentKey, title, description, required, allowMultiple, sortOrder };
}

const salaryRequirements = [
  req("salary-itr-filing", "form_16", "Form 16", "Upload Form 16 from your employer.", true, false, 1),
  req("salary-itr-filing", "pan", "PAN", "PAN card copy or clear PAN details.", false, false, 2),
  req("salary-itr-filing", "aadhaar", "Aadhaar", "Aadhaar copy if available.", false, false, 3),
  req("salary-itr-filing", "ais_26as", "AIS / Form 26AS", "Upload AIS or Form 26AS if you have it.", false, true, 4),
  req("salary-itr-filing", "bank_details", "Bank details", "Cancelled cheque, passbook page or bank details.", false, true, 5),
  req("salary-itr-filing", "investment_proofs", "Investment proofs", "Insurance, rent, home loan or deduction proofs if any.", false, true, 6),
  req("salary-itr-filing", "previous_itr", "Previous year ITR", "Previous ITR acknowledgement if available.", false, true, 7),
  req("salary-itr-filing", "other_documents", "Other documents", "Upload any other relevant records.", false, true, 99)
];

const insuranceRequirements = [
  req("insurance-claim-support", "policy_copy", "Policy Copy", "Upload the policy schedule and wording available with you.", true, true, 1),
  req("insurance-claim-support", "claim_form", "Claim Form", "Upload the submitted or partly completed claim form and acknowledgement if available.", false, true, 2),
  req("insurance-claim-support", "rejection_status_letter", "Claim Rejection / Status Letter", "Upload the rejection letter, query, settlement note or latest claim status.", false, true, 3),
  req("insurance-claim-support", "insurer_communication", "Insurance Company Communication", "Upload relevant email, SMS, WhatsApp screenshots or letters.", false, true, 4),
  req("insurance-claim-support", "medical_records", "Bills / Reports / Discharge Summary", "For health claims, upload bills, discharge summary, reports and prescriptions.", false, true, 5),
  req("insurance-claim-support", "motor_records", "FIR / Repair Estimate / Survey Report", "For motor claims, upload the FIR if applicable, repair estimate, survey report and vehicle papers.", false, true, 6),
  req("insurance-claim-support", "id_proof", "ID Proof", "Upload the claimant or nominee identity proof if available.", false, true, 7),
  req("insurance-claim-support", "nominee_documents", "Nominee Documents", "Upload nominee identity, relationship and other insurer-requested papers if applicable.", false, true, 8),
  req("insurance-claim-support", "settlement_documents", "Settlement Documents", "Upload settlement notes, discharge forms, deduction details or bank proof if applicable.", false, true, 9),
  req("insurance-claim-support", "other_documents", "Other Supporting Documents", "Upload any other document that explains the claim issue.", false, true, 99)
];

const requirements: Record<string, DocumentRequirement[]> = {
  "insurance-claim-support": insuranceRequirements,
  "salary-itr-filing": salaryRequirements,
  "itr-1-filing": salaryRequirements.map((item) => ({ ...item, serviceSlug: "itr-1-filing" })),
  "itr-2-capital-gains-filing": [
    req("itr-2-capital-gains-filing", "capital_gains_statement", "Capital gains statement", "Broker or mutual fund capital gains statement.", true, true, 1),
    req("itr-2-capital-gains-filing", "pan", "PAN", "PAN card copy or PAN details.", false, false, 2),
    req("itr-2-capital-gains-filing", "aadhaar", "Aadhaar", "Aadhaar copy if available.", false, false, 3),
    req("itr-2-capital-gains-filing", "ais_26as", "AIS / Form 26AS", "Official tax statement if available.", false, true, 4),
    req("itr-2-capital-gains-filing", "broker_report", "Broker report", "Share, mutual fund or securities report.", false, true, 5),
    req("itr-2-capital-gains-filing", "bank_details", "Bank details", "Bank proof or statement if relevant.", false, true, 6),
    req("itr-2-capital-gains-filing", "previous_itr", "Previous year ITR", "Previous ITR acknowledgement if available.", false, true, 7),
    req("itr-2-capital-gains-filing", "other_documents", "Other documents", "Upload any other related document.", false, true, 99)
  ],
  "freelancer-business-itr": [
    req("freelancer-business-itr", "income_details", "Income details", "Invoices, receipts, payment summary or income sheet.", true, true, 1),
    req("freelancer-business-itr", "expense_records", "Expense records", "Bills, expense sheet or business purchase records.", false, true, 2),
    req("freelancer-business-itr", "bank_statement", "Bank statement", "Bank statement for business or professional receipts.", false, true, 3),
    req("freelancer-business-itr", "gst_returns", "GST returns", "GST return records if applicable.", false, true, 4),
    req("freelancer-business-itr", "previous_itr", "Previous year ITR", "Previous ITR acknowledgement if available.", false, true, 5),
    req("freelancer-business-itr", "other_documents", "Other documents", "Upload any other related document.", false, true, 99)
  ],
  "gst-registration": [
    req("gst-registration", "business_address_proof", "Business address proof", "Rent agreement, electricity bill, tax receipt or ownership proof.", true, true, 1),
    req("gst-registration", "business_details", "Business details", "Business name, activity, owner details and place of business.", true, true, 2),
    req("gst-registration", "pan", "PAN", "PAN of owner or business as applicable.", false, false, 3),
    req("gst-registration", "aadhaar", "Aadhaar", "Aadhaar of proprietor or authorized person.", false, false, 4),
    req("gst-registration", "bank_details", "Bank details", "Cancelled cheque or bank account proof.", false, true, 5),
    req("gst-registration", "other_documents", "Other documents", "Upload any other business proof.", false, true, 99)
  ],
  "gst-return-filing": [
    req("gst-return-filing", "sales_data", "Sales data", "Sales invoices, sales sheet or outward supply data.", true, true, 1),
    req("gst-return-filing", "purchase_data", "Purchase data", "Purchase invoices, purchase sheet or inward supply data.", true, true, 2),
    req("gst-return-filing", "gst_login_note", "GST login support note", "Do not upload passwords here. Our team will contact you for safe next steps.", false, false, 3),
    req("gst-return-filing", "bank_statement", "Bank statement", "Bank statement if needed for checking records.", false, true, 4),
    req("gst-return-filing", "previous_return", "Previous return", "Previous GST return if available.", false, true, 5),
    req("gst-return-filing", "other_documents", "Other documents", "Upload any other related GST record.", false, true, 99)
  ],
  bookkeeping: [
    req("bookkeeping", "sales_invoices", "Sales invoices", "Sales invoices or sales data.", true, true, 1),
    req("bookkeeping", "purchase_bills", "Purchase bills", "Purchase bills and expense records.", true, true, 2),
    req("bookkeeping", "bank_statement", "Bank statement", "Bank statement for the period.", false, true, 3),
    req("bookkeeping", "other_documents", "Other documents", "Upload any other business records.", false, true, 99)
  ],
  "tds-return-filing": [
    req("tds-return-filing", "tan_details", "TAN details", "TAN and deductor details.", true, false, 1),
    req("tds-return-filing", "deductee_details", "Deductee details", "Deductee PAN and payment summary.", true, true, 2),
    req("tds-return-filing", "challans", "TDS challans", "TDS challan copies.", false, true, 3),
    req("tds-return-filing", "other_documents", "Other documents", "Upload any other TDS records.", false, true, 99)
  ],
  "tax-notice-help": [
    req("tax-notice-help", "notice_copy", "Notice copy", "Upload the income tax notice PDF, image or screenshot.", true, true, 1),
    req("tax-notice-help", "pan", "PAN", "PAN card copy or PAN details.", false, false, 2),
    req("tax-notice-help", "related_itr", "Related ITR", "ITR acknowledgement or computation if available.", false, true, 3),
    req("tax-notice-help", "supporting_records", "Supporting records", "AIS, Form 26AS, bank or income records.", false, true, 4),
    req("tax-notice-help", "other_documents", "Other documents", "Upload any other related document.", false, true, 99)
  ],
  "business-registration": [
    req("business-registration", "business_details", "Business details", "Business name, activity, owner details and address.", true, true, 1),
    req("business-registration", "identity_address_proof", "Identity and address proof", "PAN, Aadhaar and address proof if available.", false, true, 2),
    req("business-registration", "bank_details", "Bank details", "Bank proof if available.", false, true, 3),
    req("business-registration", "other_documents", "Other documents", "Upload any other registration document.", false, true, 99)
  ],
  "msme-udyam-registration": [
    req("msme-udyam-registration", "business_details", "Business details", "Business name, activity and address details.", true, true, 1),
    req("msme-udyam-registration", "aadhaar", "Aadhaar", "Aadhaar of proprietor or authorized person.", false, false, 2),
    req("msme-udyam-registration", "pan", "PAN", "PAN details if available.", false, false, 3),
    req("msme-udyam-registration", "bank_details", "Bank details", "Bank details if available.", false, true, 4),
    req("msme-udyam-registration", "other_documents", "Other documents", "Upload any other relevant record.", false, true, 99)
  ],
  "loan-project-report": [
    req("loan-project-report", "business_details", "Business details", "Business activity, owner details and project summary.", true, true, 1),
    req("loan-project-report", "project_estimate", "Project estimate / quotation", "Quotation, cost estimate or project inputs.", true, true, 2),
    req("loan-project-report", "bank_statement", "Bank statement", "Bank statement if available.", false, true, 3),
    req("loan-project-report", "existing_loan", "Existing loan details", "Existing loan details if any.", false, true, 4),
    req("loan-project-report", "identity_address_proof", "Identity / address proof", "Identity and address proof if available.", false, true, 5),
    req("loan-project-report", "other_documents", "Other documents", "Upload any other project or loan record.", false, true, 99)
  ],
  "subsidy-scheme-guidance": [
    req("subsidy-scheme-guidance", "business_details", "Business details", "Business activity, owner details and project summary.", true, true, 1),
    req("subsidy-scheme-guidance", "project_estimate", "Project estimate / quotation", "Quotation, cost estimate or scheme inputs.", true, true, 2),
    req("subsidy-scheme-guidance", "scheme_details", "Scheme details", "Scheme name, link or notice if available.", false, true, 3),
    req("subsidy-scheme-guidance", "identity_address_proof", "Identity / address proof", "Identity and address proof if available.", false, true, 4),
    req("subsidy-scheme-guidance", "other_documents", "Other documents", "Upload any other subsidy-related record.", false, true, 99)
  ],
  "not-sure": [
    req("not-sure", "relevant_documents", "Any relevant document", "Upload what you have. Add a message so we understand your need.", false, true, 1)
  ]
};

requirements["business-loan-paperwork"] = requirements["loan-project-report"].map((item) => ({
  ...item,
  serviceSlug: "business-loan-paperwork"
}));

for (const serviceSlug of [
  "insurance-claim-rejected",
  "insurance-claim-documentation-support",
  "health-insurance-claim-help",
  "life-insurance-claim-assistance",
  "motor-insurance-claim-support",
  "personal-accident-insurance-claim",
  "claim-form-preparation-support",
  "insurance-claim-follow-up",
  "settlement-documentation-assistance",
  "nominee-claim-assistance",
  "mediclaim-reimbursement-help",
  "cashless-claim-denied",
  "life-insurance-claim-dispute",
  "motor-insurance-claim-dispute",
  "property-insurance-claim-help",
  "insurance-legal-escalation-support"
]) {
  requirements[serviceSlug] = insuranceRequirements.map((item) => ({ ...item, serviceSlug }));
}

export function getFallbackDocumentRequirements(serviceSlug: string): DocumentRequirement[] {
  return [...(requirements[serviceSlug] || requirements["not-sure"])].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getDocumentRequirements(serviceSlug: string): Promise<DocumentRequirement[]> {
  const remote = await fetchCms<DocumentRequirement[]>(
    `/api/content/service-document-requirements?service=${encodeURIComponent(serviceSlug)}`,
    { revalidate: 300, timeoutMs: 2500 }
  );
  return remote?.length ? remote : getFallbackDocumentRequirements(serviceSlug);
}
