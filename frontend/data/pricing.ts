export const pricingPlans = [
  {
    name: "Salary ITR / ITR-1",
    price: "₹199 onwards",
    description: "For simple salary, pension, Form 16 and basic interest income cases.",
    features: ["Form 16 support", "Eligible deductions checked", "Official portal-based process", "Status updates"]
  },
  {
    name: "Salary ITR with review",
    price: "₹499 onwards",
    description: "For salary cases with deductions, refund check, rent, home loan or extra records.",
    features: ["Documents checked", "Clear fee before work", "Payment options", "Completion update"]
  },
  {
    name: "Capital gains / ITR-2",
    price: "Custom",
    description: "For share, mutual fund, property or other capital gains records.",
    features: ["Broker report check", "Capital gains summary", "More details if needed", "Custom quote"]
  },
  {
    name: "GST / Business help",
    price: "Monthly/custom",
    description: "For GST returns, bookkeeping, business ITR, TDS and small business compliance.",
    features: ["Monthly support", "Invoice data help", "Payment tracking", "WhatsApp updates"]
  },
  {
    name: "Loan project report",
    price: "Custom",
    description: "For business loan paperwork, project reports and scheme document guidance.",
    features: ["Document checklist", "Business details review", "Report preparation", "Clear next steps"]
  }
] as const;
