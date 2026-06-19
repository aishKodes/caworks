import { serviceFaqs, type FAQItem } from "@/data/faqs";

export type Service = {
  slug: string;
  label: string;
  category: "itr" | "gst" | "business" | "loan" | "local" | "support";
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroText: string;
  whoFor: string[];
  whatWeDo: string[];
  documents: string[];
  process: string[];
  priceNote: string;
  faqs: FAQItem[];
  related: string[];
};

const standardProcess = [
  "Choose the service and share basic details.",
  "Create your account or request a call back.",
  "Upload documents from your phone.",
  "See the fee and choose payment mode.",
  "Track updates from your dashboard."
];

export const services: Service[] = [
  {
    slug: "salary-itr-filing",
    label: "Salary ITR Filing",
    category: "itr",
    metaTitle: "Salary ITR Filing Online | Upload Form 16 and Track Status",
    metaDescription: "Simple salary ITR filing support for Indian employees. Upload Form 16, pay securely and track status online.",
    heroTitle: "Salary ITR filing in simple online steps.",
    heroText: "Upload Form 16 and other records from your phone. We will check and contact you if more details are needed.",
    whoFor: ["Salaried people", "Pensioners", "Families filing simple returns", "People with Form 16", "People who need help choosing the right form"],
    whatWeDo: ["Check Form 16 and basic records", "Check eligible deductions from documents", "Prepare filing details", "Share status updates", "Keep records linked to your request"],
    documents: ["Form 16", "PAN", "Aadhaar", "AIS / Form 26AS if available", "Bank details", "Investment proofs if any", "Previous year ITR if available"],
    process: standardProcess,
    priceNote: "Salary ITR / ITR-1 starts from ₹199 onwards. Final fee depends on documents, income type and complexity.",
    faqs: serviceFaqs,
    related: ["itr-1-filing", "itr-2-capital-gains-filing", "upload-documents"]
  },
  {
    slug: "itr-1-filing",
    label: "ITR-1 Filing",
    category: "itr",
    metaTitle: "ITR-1 Filing Online | Simple Salary Return Support",
    metaDescription: "ITR-1 filing for eligible resident individuals with salary, pension, one house property and interest income.",
    heroTitle: "ITR-1 filing for simple salary and pension cases.",
    heroText: "Not sure if ITR-1 applies? Choose Not sure and we will guide you before work starts.",
    whoFor: ["Resident individuals", "Salary or pension income cases", "One house property cases", "Interest income cases", "Simple income profiles"],
    whatWeDo: ["Check if ITR-1 looks suitable", "Review Form 16 and AIS details", "Check eligible deductions", "Explain missing details", "Update filing status"],
    documents: ["PAN", "Aadhaar", "Form 16", "AIS / Form 26AS if available", "Bank details", "Deduction proofs"],
    process: standardProcess,
    priceNote: "ITR-1 starts from ₹199 onwards. Extra review may change the fee.",
    faqs: [
      { question: "Who can usually use ITR-1?", answer: "ITR-1 is usually for resident individuals with salary or pension income, one house property and interest income." },
      { question: "Who should not use ITR-1?", answer: "It may not fit business income, many capital gains cases, NRI cases, company directors or more complex profiles." },
      ...serviceFaqs
    ],
    related: ["salary-itr-filing", "itr-2-capital-gains-filing", "freelancer-business-itr"]
  },
  {
    slug: "itr-2-capital-gains-filing",
    label: "ITR-2 / Capital Gains Filing",
    category: "itr",
    metaTitle: "ITR-2 Capital Gains Filing Support",
    metaDescription: "Capital gains and ITR-2 filing support for shares, mutual funds, property and other records.",
    heroTitle: "ITR-2 and capital gains filing support.",
    heroText: "Share broker reports, capital gains statements and other records. We will check what applies and ask for missing details.",
    whoFor: ["People with shares or mutual funds", "People with property sale records", "People not eligible for ITR-1", "Residents with more detailed income records"],
    whatWeDo: ["Check capital gains documents", "Review broker reports", "Ask for missing purchase or sale details", "Prepare a clear quote", "Track status online"],
    documents: ["PAN", "Aadhaar", "AIS / Form 26AS", "Broker capital gains report", "Property records if any", "Bank details"],
    process: standardProcess,
    priceNote: "Capital gains and ITR-2 filing is custom priced after document review.",
    faqs: serviceFaqs,
    related: ["salary-itr-filing", "itr-1-filing", "tax-notice-help"]
  },
  {
    slug: "freelancer-business-itr",
    label: "Freelancer / Business ITR",
    category: "itr",
    metaTitle: "Freelancer and Business ITR Filing Support",
    metaDescription: "ITR filing support for freelancers, consultants, proprietors and small businesses.",
    heroTitle: "Freelancer and small business ITR help.",
    heroText: "Share income, expense and bank records. We will check documents and guide you with simple next steps.",
    whoFor: ["Freelancers", "Consultants", "Small business owners", "Proprietors", "People with professional receipts"],
    whatWeDo: ["Check income and expense records", "Review bank and invoice data", "Ask for missing business details", "Support filing workflow", "Track request status"],
    documents: ["PAN", "Aadhaar", "Invoices", "Expense proofs", "Bank statement", "GST records if any", "Previous ITR if available"],
    process: standardProcess,
    priceNote: "Business and freelancer ITR is custom priced based on records and complexity.",
    faqs: serviceFaqs,
    related: ["bookkeeping", "gst-services", "business-registration"]
  },
  {
    slug: "gst-services",
    label: "GST Services",
    category: "gst",
    metaTitle: "GST Filing Help Online | Registration and Return Support",
    metaDescription: "Online GST help for registration, return filing, invoice records and small business compliance.",
    heroTitle: "GST registration and filing help for small businesses.",
    heroText: "Get help with GST registration, return filing, sales data, purchase data and status tracking.",
    whoFor: ["Traders", "Service providers", "Freelancers", "Ecommerce sellers", "Small businesses"],
    whatWeDo: ["Guide registration documents", "Check sales and purchase data", "Support return filing workflow", "Track payment and documents", "Share updates"],
    documents: ["PAN", "Aadhaar", "Business address proof", "Sales data", "Purchase data", "Bank statement", "GST certificate if available"],
    process: standardProcess,
    priceNote: "GST services are monthly or custom priced based on volume and scope.",
    faqs: serviceFaqs,
    related: ["gst-registration", "gst-return-filing", "bookkeeping"]
  },
  {
    slug: "gst-registration",
    label: "GST Registration",
    category: "gst",
    metaTitle: "GST Registration Help Online",
    metaDescription: "Get document guidance and online support for GST registration in India.",
    heroTitle: "GST registration help with a simple checklist.",
    heroText: "Share business details and documents. We will check what is needed and guide the application process.",
    whoFor: ["New businesses", "Interstate sellers", "Ecommerce sellers", "Service providers", "Businesses asked for GSTIN"],
    whatWeDo: ["Check registration need", "Prepare document list", "Review address and bank details", "Guide application steps", "Track next actions"],
    documents: ["PAN", "Aadhaar", "Photo", "Business address proof", "Bank details", "Business constitution documents if applicable"],
    process: standardProcess,
    priceNote: "GST registration pricing depends on business type and document readiness.",
    faqs: serviceFaqs,
    related: ["gst-return-filing", "business-registration", "msme-udyam-registration"]
  },
  {
    slug: "gst-return-filing",
    label: "GST Return Filing",
    category: "gst",
    metaTitle: "GST Return Filing Help Online",
    metaDescription: "Monthly and quarterly GST return filing help with sales, purchase and payment status support.",
    heroTitle: "GST return filing with document and payment tracking.",
    heroText: "Upload sales and purchase data. Track documents, payment and review status from your dashboard.",
    whoFor: ["Registered GST users", "Small businesses", "Service providers", "Ecommerce sellers", "Businesses with monthly invoices"],
    whatWeDo: ["Review invoice data", "Check purchase records", "Support return workflow", "Track payment status", "Ask for missing details"],
    documents: ["GST certificate if available", "Sales data", "Purchase data", "Bank statement", "Previous return if available", "Other documents"],
    process: standardProcess,
    priceNote: "GST return filing is monthly or custom priced based on invoice volume.",
    faqs: serviceFaqs,
    related: ["gst-registration", "bookkeeping", "tds-return-filing"]
  },
  {
    slug: "bookkeeping",
    label: "Bookkeeping",
    category: "business",
    metaTitle: "Bookkeeping Help for Small Businesses",
    metaDescription: "Simple bookkeeping support for invoices, expenses, bank records, GST and business paperwork.",
    heroTitle: "Keep business records clean month by month.",
    heroText: "Upload invoices, expenses and bank statements. Get organized records for GST, ITR and business decisions.",
    whoFor: ["Small business owners", "Freelancers", "Agencies", "Traders", "Service businesses"],
    whatWeDo: ["Organize invoices", "Classify expenses", "Check bank records", "Prepare monthly summaries", "Support GST and ITR needs"],
    documents: ["Sales invoices", "Purchase bills", "Expense proofs", "Bank statement", "GST returns if available"],
    process: standardProcess,
    priceNote: "Bookkeeping fee depends on transaction volume and reporting needs.",
    faqs: serviceFaqs,
    related: ["gst-return-filing", "freelancer-business-itr", "payroll-compliance"]
  },
  {
    slug: "tds-return-filing",
    label: "TDS Return Filing",
    category: "business",
    metaTitle: "TDS Return Filing Help Online",
    metaDescription: "TDS return filing support for salary, contractor, rent and professional payment records.",
    heroTitle: "TDS return filing support for businesses.",
    heroText: "Share deduction and challan records. We will check details and help with the filing workflow.",
    whoFor: ["Employers", "Companies", "Firms", "Businesses paying contractors", "Businesses with TAN"],
    whatWeDo: ["Check deductee data", "Review challans", "Support return preparation", "Track status", "Ask for missing records"],
    documents: ["TAN", "Deductee PAN details", "Payment summary", "TDS challans", "Salary or contractor records"],
    process: standardProcess,
    priceNote: "TDS pricing depends on deductee count, return type and corrections if any.",
    faqs: serviceFaqs,
    related: ["payroll-compliance", "bookkeeping", "company-llp-compliance"]
  },
  {
    slug: "payroll-compliance",
    label: "Payroll Compliance",
    category: "business",
    metaTitle: "Payroll Compliance Help for Small Businesses",
    metaDescription: "Payroll paperwork support for salary records, TDS and monthly compliance tracking.",
    heroTitle: "Payroll paperwork made easier for growing teams.",
    heroText: "Keep salary records, employee details and TDS inputs organized with a simple monthly process.",
    whoFor: ["Employers", "Startups", "Small companies", "Teams with salary payments", "Businesses deducting TDS"],
    whatWeDo: ["Collect salary inputs", "Check employee records", "Support TDS coordination", "Track monthly status", "Prepare summaries"],
    documents: ["Employee details", "Salary structure", "Attendance or payout inputs", "Investment declarations if any", "TDS challans"],
    process: standardProcess,
    priceNote: "Payroll pricing depends on employee count and compliance scope.",
    faqs: serviceFaqs,
    related: ["tds-return-filing", "company-llp-compliance", "bookkeeping"]
  },
  {
    slug: "tax-notice-help",
    label: "Income Tax Notice Help",
    category: "support",
    metaTitle: "Income Tax Notice Help Online",
    metaDescription: "Get help understanding income tax notices, mismatches and document-based response steps.",
    heroTitle: "Got an income tax notice? Start with a calm document check.",
    heroText: "Upload the notice and related records. We will review the issue and contact you with next steps.",
    whoFor: ["People with tax notices", "People with AIS mismatch", "People with demand notices", "People with defective return notices"],
    whatWeDo: ["Check notice type", "Review deadline", "Compare records", "Ask for missing documents", "Guide response steps"],
    documents: ["Notice copy", "PAN", "ITR acknowledgement", "AIS / Form 26AS", "Bank and income records"],
    process: standardProcess,
    priceNote: "Notice help is custom priced after checking notice type and records.",
    faqs: serviceFaqs,
    related: ["salary-itr-filing", "itr-2-capital-gains-filing", "general-tax-support"]
  },
  {
    slug: "business-registration",
    label: "Business Registration",
    category: "business",
    metaTitle: "Business Registration Paperwork Help",
    metaDescription: "Business registration paperwork help for proprietorship, firm, GST, MSME and setup documents.",
    heroTitle: "Start business paperwork with a clear checklist.",
    heroText: "Share your business idea and details. We will help you understand documents and next steps.",
    whoFor: ["New business owners", "Freelancers formalising work", "Shops and traders", "Service businesses", "Startup founders"],
    whatWeDo: ["Understand business type", "Prepare document checklist", "Guide registration path", "Connect related GST or MSME tasks", "Track request status"],
    documents: ["PAN", "Aadhaar", "Address proof", "Business name", "Bank details", "Rent agreement if applicable"],
    process: standardProcess,
    priceNote: "Pricing depends on business type and selected registrations.",
    faqs: serviceFaqs,
    related: ["gst-registration", "msme-udyam-registration", "company-llp-compliance"]
  },
  {
    slug: "msme-udyam-registration",
    label: "MSME / Udyam Registration",
    category: "business",
    metaTitle: "MSME Udyam Registration Help Online",
    metaDescription: "MSME and Udyam registration paperwork help for small businesses in India.",
    heroTitle: "MSME / Udyam registration help online.",
    heroText: "Upload business details and identity records. We will guide the registration workflow.",
    whoFor: ["Small manufacturers", "Service providers", "Proprietors", "Partnerships", "Businesses applying for loans or tenders"],
    whatWeDo: ["Check basic details", "Guide business activity selection", "Prepare application inputs", "Track certificate status", "Share next steps"],
    documents: ["Aadhaar", "PAN", "Business details", "Bank details", "GST details if applicable"],
    process: standardProcess,
    priceNote: "MSME support fee depends on business structure and document readiness.",
    faqs: serviceFaqs,
    related: ["business-registration", "loan-project-report", "subsidy-scheme-guidance"]
  },
  {
    slug: "company-llp-compliance",
    label: "Company / LLP Compliance",
    category: "business",
    metaTitle: "Company and LLP Compliance Support",
    metaDescription: "Company and LLP compliance support for annual records, bookkeeping, GST, TDS and status tracking.",
    heroTitle: "Company and LLP compliance support in one place.",
    heroText: "Track documents, payments and status for company or LLP paperwork from your dashboard.",
    whoFor: ["Private companies", "LLPs", "Startups", "Directors", "Business owners with annual filings"],
    whatWeDo: ["Collect company records", "Track pending documents", "Coordinate bookkeeping inputs", "Support compliance workflow", "Share status updates"],
    documents: ["Company or LLP details", "Bank statements", "Invoices", "GST and TDS records", "Previous filings"],
    process: standardProcess,
    priceNote: "Pricing depends on entity type, pending work and transaction volume.",
    faqs: serviceFaqs,
    related: ["bookkeeping", "tds-return-filing", "payroll-compliance"]
  },
  {
    slug: "loan-project-report",
    label: "Loan Project Report",
    category: "loan",
    metaTitle: "Loan Project Report Help for Small Businesses",
    metaDescription: "Project report paperwork help for business loans, cost estimates, assumptions and documents.",
    heroTitle: "Loan project report paperwork with clear inputs.",
    heroText: "Share business details, cost estimates and bank records. We will help prepare structured paperwork.",
    whoFor: ["Small business owners", "MSME units", "New entrepreneurs", "Businesses applying for loans", "People preparing scheme documents"],
    whatWeDo: ["Collect business details", "Review cost estimates", "Structure assumptions", "Prepare report inputs", "Track document status"],
    documents: ["Business details", "Bank statement", "Existing loan details if any", "Quotation or project estimate", "Identity/address proof"],
    process: standardProcess,
    priceNote: "Project report fee depends on report depth and lender format.",
    faqs: serviceFaqs,
    related: ["business-loan-paperwork", "subsidy-scheme-guidance", "msme-udyam-registration"]
  },
  {
    slug: "business-loan-paperwork",
    label: "Business Loan Paperwork",
    category: "loan",
    metaTitle: "Business Loan Paperwork Help",
    metaDescription: "Business loan document checklist, project report support and paperwork guidance for small businesses.",
    heroTitle: "Business loan paperwork support for small owners.",
    heroText: "Get a clear list of documents and next steps before you apply or respond to lender requests.",
    whoFor: ["Business owners", "MSME applicants", "Shop owners", "Service providers", "Loan applicants"],
    whatWeDo: ["Prepare document checklist", "Check business details", "Support project report inputs", "Track missing documents", "Share next steps"],
    documents: ["Business details", "Bank statement", "Loan requirement", "Quotation or estimate", "Identity/address proof"],
    process: standardProcess,
    priceNote: "Pricing depends on document scope and report needs.",
    faqs: serviceFaqs,
    related: ["loan-project-report", "subsidy-scheme-guidance", "msme-udyam-registration"]
  },
  {
    slug: "subsidy-scheme-guidance",
    label: "Subsidy Scheme Guidance",
    category: "loan",
    metaTitle: "Subsidy Scheme Paperwork Guidance",
    metaDescription: "Guidance for small business subsidy scheme documents, eligibility records and application paperwork.",
    heroTitle: "Subsidy scheme paperwork guidance.",
    heroText: "Understand required records, prepare document lists and track what is still missing.",
    whoFor: ["Small business owners", "MSME units", "New entrepreneurs", "Loan applicants", "People applying for government schemes"],
    whatWeDo: ["Review scheme document needs", "Prepare checklist", "Collect business details", "Track missing documents", "Guide next steps"],
    documents: ["Business details", "Identity/address proof", "Bank statement", "Project estimate", "MSME details if available"],
    process: standardProcess,
    priceNote: "Scheme guidance is custom priced based on scheme type and paperwork scope.",
    faqs: serviceFaqs,
    related: ["loan-project-report", "business-loan-paperwork", "msme-udyam-registration"]
  },
  {
    slug: "general-tax-support",
    label: "General Tax Support",
    category: "support",
    metaTitle: "General Tax Support Online",
    metaDescription: "General online tax help for people who are not sure which filing, notice or paperwork service applies.",
    heroTitle: "Not sure what you need? Start here.",
    heroText: "Enter your phone number or create a request. Choose Not sure and we will guide you.",
    whoFor: ["People with tax questions", "People unsure about ITR form", "Families needing simple guidance", "Small businesses with paperwork doubts"],
    whatWeDo: ["Understand your issue", "Route to the right service", "Share a checklist", "Confirm fee before work", "Track request online"],
    documents: ["Any notice or form you received", "PAN", "Basic income or business details", "Message explaining the issue"],
    process: standardProcess,
    priceNote: "General support fee depends on what help is needed.",
    faqs: serviceFaqs,
    related: ["salary-itr-filing", "tax-notice-help", "gst-services"]
  },
  {
    slug: "online-tax-services-odisha",
    label: "Online Tax Services Odisha",
    category: "local",
    metaTitle: "Online Tax Services in Odisha",
    metaDescription: "Online tax filing, GST, loan paperwork and business compliance help for users in Odisha.",
    heroTitle: "Online tax and paperwork help across Odisha.",
    heroText: "Upload documents from your phone and track your request online from anywhere in Odisha.",
    whoFor: ["Salaried users in Odisha", "Families", "Freelancers", "Small businesses", "Loan paperwork applicants"],
    whatWeDo: ["Support ITR and GST workflows", "Collect documents online", "Track payment and status", "Share WhatsApp updates", "Guide next steps"],
    documents: ["Service-specific documents", "PAN", "Aadhaar", "Bank details", "Business records if needed"],
    process: standardProcess,
    priceNote: "Fee depends on service type and document complexity.",
    faqs: serviceFaqs,
    related: ["itr-filing-odisha", "itr-filing-bhubaneswar", "gst-filing-bhubaneswar"]
  },
  {
    slug: "itr-filing-odisha",
    label: "ITR Filing Odisha",
    category: "local",
    metaTitle: "ITR Filing Help in Odisha",
    metaDescription: "Online ITR filing support for salaried people, families, freelancers and small businesses in Odisha.",
    heroTitle: "ITR filing help for users in Odisha.",
    heroText: "Start with Form 16 or choose Not sure. Upload records and track status from your phone.",
    whoFor: ["Salaried people", "Pensioners", "Families", "Freelancers", "Small business owners"],
    whatWeDo: ["Check documents", "Confirm service type", "Share fee before work", "Track filing status", "Send updates"],
    documents: ["Form 16", "PAN", "Aadhaar", "AIS / Form 26AS", "Bank details", "Investment proofs if any"],
    process: standardProcess,
    priceNote: "Salary ITR starts from ₹199 onwards. Final fee depends on complexity.",
    faqs: serviceFaqs,
    related: ["salary-itr-filing", "itr-1-filing", "online-tax-services-odisha"]
  },
  {
    slug: "itr-filing-bhubaneswar",
    label: "ITR Filing Bhubaneswar",
    category: "local",
    metaTitle: "ITR Filing Help in Bhubaneswar",
    metaDescription: "Online ITR filing support in Bhubaneswar with document upload, payment and status tracking.",
    heroTitle: "ITR filing help in Bhubaneswar.",
    heroText: "Upload documents from your phone. Track request status and payment updates online.",
    whoFor: ["Salaried people in Bhubaneswar", "Pensioners", "Families", "Freelancers", "Small businesses"],
    whatWeDo: ["Collect documents", "Check service type", "Confirm fee", "Track status", "Send updates"],
    documents: ["Form 16", "PAN", "Aadhaar", "AIS / Form 26AS", "Bank details", "Investment proofs if any"],
    process: standardProcess,
    priceNote: "Simple salary ITR starts from ₹199 onwards.",
    faqs: serviceFaqs,
    related: ["salary-itr-filing", "itr-filing-odisha", "tax-notice-help-odisha"]
  },
  {
    slug: "gst-filing-bhubaneswar",
    label: "GST Filing Bhubaneswar",
    category: "local",
    metaTitle: "GST Filing Help in Bhubaneswar",
    metaDescription: "GST return filing and document support for small businesses in Bhubaneswar.",
    heroTitle: "GST filing help for Bhubaneswar businesses.",
    heroText: "Upload sales and purchase records. Track missing documents, payment and filing status online.",
    whoFor: ["Local traders", "Service providers", "Ecommerce sellers", "Small businesses", "Freelancers with GST"],
    whatWeDo: ["Collect data", "Check missing records", "Support filing workflow", "Track status", "Share updates"],
    documents: ["GST certificate if available", "Sales data", "Purchase data", "Bank statement", "Previous return if available"],
    process: standardProcess,
    priceNote: "GST filing is monthly or custom priced.",
    faqs: serviceFaqs,
    related: ["gst-return-filing", "gst-registration", "bookkeeping"]
  },
  {
    slug: "tax-notice-help-odisha",
    label: "Tax Notice Help Odisha",
    category: "local",
    metaTitle: "Income Tax Notice Help in Odisha",
    metaDescription: "Online income tax notice help for users in Odisha. Upload notice and records, then track status.",
    heroTitle: "Income tax notice help for users in Odisha.",
    heroText: "Upload the notice and records. We will check and contact you with next steps.",
    whoFor: ["People with tax notices", "People with mismatch issues", "Salary users", "Business owners", "Families"],
    whatWeDo: ["Check notice type", "Review records", "Ask for missing documents", "Guide response steps", "Track status"],
    documents: ["Notice copy", "PAN", "ITR acknowledgement", "AIS / Form 26AS", "Bank and income records"],
    process: standardProcess,
    priceNote: "Notice help is custom priced after document review.",
    faqs: serviceFaqs,
    related: ["tax-notice-help", "itr-filing-odisha", "general-tax-support"]
  }
];

export const serviceOptions = [
  { value: "salary-itr-filing", label: "Salary / Form 16 ITR" },
  { value: "itr-2-capital-gains-filing", label: "Capital gains / ITR-2" },
  { value: "freelancer-business-itr", label: "Freelancer or business ITR" },
  { value: "gst-services", label: "GST help" },
  { value: "tax-notice-help", label: "Tax notice help" },
  { value: "loan-project-report", label: "Loan project report" },
  { value: "not-sure", label: "Not sure" }
] as const;

export const popularServiceSlugs = [
  "salary-itr-filing",
  "itr-1-filing",
  "gst-return-filing",
  "tax-notice-help",
  "loan-project-report",
  "business-registration",
  "bookkeeping",
  "general-tax-support"
] as const;

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(slugs: string[]) {
  return slugs.map((slug) => getServiceBySlug(slug)).filter((service): service is Service => Boolean(service));
}
