export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  image: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  sections: Array<{ heading: string; paragraphs: string[] }>;
  relatedServices: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "which-itr-form-should-i-file",
    title: "Which ITR form should I file?",
    metaTitle: "Which ITR Form Should I File? Simple Indian Guide",
    metaDescription: "A simple guide to understand ITR-1, ITR-2 and business ITR choices before filing.",
    excerpt: "Understand the common ITR forms in simple language before you start filing.",
    category: "Income tax",
    image: "/images/vbc/blog-income-tax-guide.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-01",
    updatedAt: "2026-06-01",
    tags: ["ITR", "Salary", "Capital gains"],
    sections: [
      {
        heading: "Start with income type",
        paragraphs: [
          "The right ITR form depends on income type, residential status and special conditions.",
          "Salary users may use ITR-1 in simple cases. Capital gains, business income or complex records may need another form."
        ]
      },
      {
        heading: "Do not guess",
        paragraphs: [
          "If you choose the wrong form, filing can become difficult later. Choose Not sure if you need help.",
          "You can upload basic details and wait for guidance before payment."
        ]
      }
    ],
    relatedServices: ["salary-itr-filing", "itr-1-filing", "itr-2-capital-gains-filing"]
  },
  {
    slug: "documents-required-for-salary-itr-filing",
    title: "Documents required for salary ITR filing",
    metaTitle: "Documents Required for Salary ITR Filing",
    metaDescription: "Simple checklist for salary ITR filing: Form 16, PAN, Aadhaar, AIS, bank details and proofs.",
    excerpt: "Keep these common records ready before uploading documents for salary ITR.",
    category: "Salary ITR",
    image: "/images/vbc/blog-salary-itr-form-16-guide.png",
    readingTime: "4 min read",
    publishedAt: "2026-06-02",
    updatedAt: "2026-06-02",
    tags: ["Form 16", "Documents", "Salary ITR"],
    sections: [
      {
        heading: "Basic documents",
        paragraphs: [
          "Most salary ITR requests need PAN, Aadhaar, Form 16, bank details and AIS or Form 26AS if available.",
          "If you have rent, home loan, insurance or investments, keep the proofs ready."
        ]
      },
      {
        heading: "Upload only what is needed",
        paragraphs: [
          "Share clear files. Do not upload unrelated personal documents.",
          "If something is missing, the filing team will ask for it."
        ]
      }
    ],
    relatedServices: ["salary-itr-filing", "upload-documents"]
  },
  {
    slug: "itr-1-eligibility-simple-guide",
    title: "ITR-1 eligibility: simple guide",
    metaTitle: "ITR-1 Eligibility Simple Guide",
    metaDescription: "Understand who can usually file ITR-1 and who may need another ITR form.",
    excerpt: "ITR-1 is useful for simple salary and pension cases, but it does not fit every person.",
    category: "ITR-1",
    image: "/images/vbc/blog-salary-itr-form-16-guide.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-03",
    updatedAt: "2026-06-03",
    tags: ["ITR-1", "Salary", "Eligibility"],
    sections: [
      {
        heading: "Who can usually use ITR-1",
        paragraphs: [
          "ITR-1 is usually for resident individuals with salary or pension income, one house property and interest income.",
          "It is common for simple Form 16 cases."
        ]
      },
      {
        heading: "When ITR-1 may not fit",
        paragraphs: [
          "Business income, many capital gains cases, NRI status, directorship or complex profiles may need another form.",
          "Choose Not sure if you want the filing route checked first."
        ]
      }
    ],
    relatedServices: ["itr-1-filing", "salary-itr-filing"]
  },
  {
    slug: "form-16-itr-filing-guide",
    title: "Form 16 ITR filing guide",
    metaTitle: "Form 16 ITR Filing Guide",
    metaDescription: "Learn how Form 16 helps salary ITR filing and what other records may still be needed.",
    excerpt: "Form 16 is important, but AIS, bank details and deduction proofs may also be needed.",
    category: "Salary ITR",
    image: "/images/vbc/blog-salary-itr-form-16-guide.png",
    readingTime: "4 min read",
    publishedAt: "2026-06-04",
    updatedAt: "2026-06-04",
    tags: ["Form 16", "ITR"],
    sections: [
      {
        heading: "What Form 16 shows",
        paragraphs: [
          "Form 16 usually shows salary, tax deducted by employer and some deduction details.",
          "It helps prepare salary ITR, but it may not show every transaction reported in official records."
        ]
      },
      {
        heading: "Check other records too",
        paragraphs: [
          "AIS or Form 26AS can show TDS, interest and other reported information.",
          "Upload available records so the filing support process has a clear picture."
        ]
      }
    ],
    relatedServices: ["salary-itr-filing", "upload-documents"]
  },
  {
    slug: "old-tax-regime-vs-new-tax-regime",
    title: "Old tax regime vs new tax regime",
    metaTitle: "Old Tax Regime vs New Tax Regime Simple Guide",
    metaDescription: "Simple explanation of old and new tax regime choices for Indian salary ITR filing.",
    excerpt: "The right tax regime depends on income, deductions and official rules for the year.",
    category: "Income tax",
    image: "/images/vbc/blog-income-tax-guide.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-05",
    updatedAt: "2026-06-05",
    tags: ["Tax regime", "Salary"],
    sections: [
      {
        heading: "Why the choice matters",
        paragraphs: [
          "The old and new regimes treat deductions differently. One may be better for one person and not for another.",
          "Do not rely on a general promise. Use your actual documents."
        ]
      },
      {
        heading: "Documents help decide",
        paragraphs: [
          "Investment proofs, insurance, rent, home loan and other records can affect the comparison.",
          "The final tax depends on official records and eligibility."
        ]
      }
    ],
    relatedServices: ["salary-itr-filing", "itr-1-filing"]
  },
  {
    slug: "gst-registration-for-small-business",
    title: "GST registration for small business",
    metaTitle: "GST Registration for Small Business",
    metaDescription: "Simple GST registration guide for small Indian businesses, traders and service providers.",
    excerpt: "Understand when GST registration may be needed and which documents are common.",
    category: "GST",
    image: "/images/vbc/blog-gst-small-business-guide.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-06",
    updatedAt: "2026-06-06",
    tags: ["GST", "Small business"],
    sections: [
      {
        heading: "When GST may be needed",
        paragraphs: [
          "GST registration can depend on turnover, state, ecommerce activity, client needs and type of supply.",
          "Rules can differ by business type, so document review is useful."
        ]
      },
      {
        heading: "After GSTIN",
        paragraphs: [
          "After registration, return filing and invoice records become important.",
          "Keep sales data, purchase data and bank records ready."
        ]
      }
    ],
    relatedServices: ["gst-registration", "gst-return-filing"]
  },
  {
    slug: "ca-services-required-for-small-business",
    title: "Professional services required for small business",
    metaTitle: "Professional Paperwork Services Required for Small Business",
    metaDescription: "Neutral guide to bookkeeping, GST, TDS, payroll, loan paperwork and compliance support for small businesses.",
    excerpt: "Small businesses often need regular help with records, GST, TDS, payroll and loan documents.",
    category: "Small business",
    image: "/images/vbc/blog-business-paperwork-guide.png",
    readingTime: "6 min read",
    publishedAt: "2026-06-07",
    updatedAt: "2026-06-07",
    tags: ["Business paperwork", "GST", "Bookkeeping"],
    sections: [
      {
        heading: "Monthly records are important",
        paragraphs: [
          "Invoices, expenses, bank records and payment details should be organised every month.",
          "Clean records make GST, ITR, loan paperwork and business decisions easier."
        ]
      },
      {
        heading: "Common support areas",
        paragraphs: [
          "Small businesses may need bookkeeping, GST return filing, TDS return filing, payroll paperwork, registration help and project reports.",
          "The best starting point is a clear document checklist and a simple tracking system."
        ]
      }
    ],
    relatedServices: ["bookkeeping", "gst-services", "tds-return-filing"]
  },
  {
    slug: "what-to-do-if-insurance-claim-is-rejected",
    title: "What to do if your insurance claim is rejected",
    metaTitle: "Insurance Claim Rejected? Practical Next Steps",
    metaDescription: "A practical checklist for reviewing an insurance claim rejection letter, policy and supporting documents before escalation.",
    excerpt: "Keep the rejection letter and policy safe, then build a clear record before sending the next reply.",
    category: "Insurance Claims",
    image: "/images/vbc/tax-notice-help-consultation.png",
    readingTime: "6 min read",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    tags: ["Insurance claim", "Rejected claim", "Escalation"],
    sections: [
      { heading: "Read the rejection reason", paragraphs: ["Note the exact policy clause, document issue or event reason mentioned by the insurer.", "Do not rely only on a phone conversation. Keep the written decision and claim reference."] },
      { heading: "Prepare the next record", paragraphs: ["Collect the policy, claim form, evidence already submitted and all insurer communication.", "A clear chronology helps with a reply, grievance or further escalation."] }
    ],
    relatedServices: ["insurance-claim-rejected", "insurance-claim-support", "insurance-legal-escalation-support"]
  },
  {
    slug: "documents-needed-for-health-insurance-claim-support",
    title: "Documents needed for health insurance claim support",
    metaTitle: "Health Insurance Claim Documents Checklist",
    metaDescription: "Keep policy, hospital bills, discharge summary, claim form and insurer communication ready for health insurance claim support.",
    excerpt: "A clean hospital and policy file makes it easier to answer insurer queries or challenge a claim decision.",
    category: "Insurance Claims",
    image: "/images/vbc/tax-notice-help-consultation.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-21",
    updatedAt: "2026-06-21",
    tags: ["Health insurance", "Claim documents", "Mediclaim"],
    sections: [
      { heading: "Medical and payment papers", paragraphs: ["Keep the discharge summary, final bill, receipts, prescriptions, reports and pharmacy bills.", "Use clear scans or photos and retain the originals."] },
      { heading: "Insurer records", paragraphs: ["Keep the policy schedule, claim form, query letters, rejection or settlement note and email trail.", "Upload what you have first. Missing items can be identified after review."] }
    ],
    relatedServices: ["health-insurance-claim-help", "mediclaim-reimbursement-help"]
  },
  {
    slug: "cashless-claim-denied-documents-to-keep",
    title: "Cashless claim denied: documents to keep ready",
    metaTitle: "Cashless Claim Denied? Documents to Keep",
    metaDescription: "Documents to preserve after cashless health insurance denial, including authorization messages, hospital estimates, bills and policy papers.",
    excerpt: "Cashless denial does not remove the need to keep a complete hospital and payment record.",
    category: "Insurance Claims",
    image: "/images/vbc/tax-notice-help-consultation.png",
    readingTime: "5 min read",
    publishedAt: "2026-06-22",
    updatedAt: "2026-06-22",
    tags: ["Cashless claim", "Health insurance", "Reimbursement"],
    sections: [
      { heading: "Save the denial record", paragraphs: ["Keep the denial or authorization message, hospital estimate and stated reason.", "Ask for a written record when possible."] },
      { heading: "Prepare for reimbursement", paragraphs: ["Preserve bills, receipts, discharge records, prescriptions and reports if you pay the hospital directly.", "These papers may be needed for a reimbursement claim and later follow-up."] }
    ],
    relatedServices: ["cashless-claim-denied", "mediclaim-reimbursement-help"]
  },
  {
    slug: "mediclaim-reimbursement-stuck-common-reasons",
    title: "Mediclaim reimbursement stuck: common reasons",
    metaTitle: "Mediclaim Reimbursement Stuck? Common Reasons",
    metaDescription: "Common reasons for delayed mediclaim reimbursement, repeated insurer queries and reduced settlement amounts.",
    excerpt: "Missing records, unclear bills and policy questions can delay a reimbursement claim.",
    category: "Insurance Claims",
    image: "/images/vbc/tax-notice-help-consultation.png",
    readingTime: "6 min read",
    publishedAt: "2026-06-23",
    updatedAt: "2026-06-23",
    tags: ["Mediclaim", "Reimbursement", "Delayed claim"],
    sections: [
      { heading: "Repeated document queries", paragraphs: ["The insurer may ask for missing bills, medical records or clarification of treatment.", "Keep every query and response together so the sequence remains clear."] },
      { heading: "Settlement deductions", paragraphs: ["The insurer may apply limits, exclusions or deductions under the policy.", "Compare the settlement note with the submitted bill and policy terms before replying."] }
    ],
    relatedServices: ["mediclaim-reimbursement-help", "health-insurance-claim-help"]
  },
  {
    slug: "how-to-prepare-papers-for-insurance-escalation",
    title: "How to prepare papers for insurance escalation",
    metaTitle: "How to Prepare Insurance Claim Escalation Papers",
    metaDescription: "Build a clear policy, claim, communication and chronology file before grievance or legal escalation of an insurance dispute.",
    excerpt: "A short chronology and indexed document file make an insurance grievance easier to understand.",
    category: "Insurance Claims",
    image: "/images/vbc/tax-notice-help-consultation.png",
    readingTime: "7 min read",
    publishedAt: "2026-06-23",
    updatedAt: "2026-06-23",
    tags: ["Insurance escalation", "Grievance", "Claim dispute"],
    sections: [
      { heading: "Create a claim chronology", paragraphs: ["List the policy start, incident, claim filing, insurer queries, replies and final decision by date.", "Add the claim number and contact details on the first page."] },
      { heading: "Index the evidence", paragraphs: ["Group the policy, claim form, evidence, bills, survey papers and insurer communication.", "A complete record supports grievance review and legal coordination where required."] }
    ],
    relatedServices: ["insurance-legal-escalation-support", "insurance-claim-support"]
  }
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
