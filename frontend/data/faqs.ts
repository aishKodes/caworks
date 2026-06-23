export type FAQItem = {
  question: string;
  answer: string;
};

export const homeFaqs: FAQItem[] = [
  {
    question: "Can I start without creating an account?",
    answer:
      "Yes. Enter your name and phone number to create a request. You can upload documents with the secure link. An account is optional for dashboard tracking."
  },
  {
    question: "Do I need OTP for signup?",
    answer:
      "No. Optional signup uses name, phone and a password or PIN of at least four characters. Email is optional. You can login with phone, email or Tax Help ID."
  },
  {
    question: "Can I upload documents from my phone?",
    answer:
      "Yes. You can upload PDF, JPG, JPEG, PNG or WEBP files from your phone. You can also use WhatsApp if you need help."
  },
  {
    question: "Can you help if an insurance claim is rejected or delayed?",
    answer:
      "Yes. Upload the policy, claim papers and rejection or status letter. Support can include document review, reply preparation, grievance escalation and legal coordination where required."
  },
  {
    question: "Do you promise refund?",
    answer:
      "No. We do not make false refund promises. Refund or tax payable depends on official records, income details and eligibility."
  },
  {
    question: "Can I pay online?",
    answer:
      "Yes. You can pay securely online through Razorpay. You can also use manual payment and upload the payment screenshot."
  },
  {
    question: "Can I track my request?",
    answer:
      "Yes. Your dashboard shows request status, payment status, missing documents and updates."
  },
  {
    question: "What if I am not sure which service I need?",
    answer:
      "Choose Not sure. We will check your details and guide you to the right service."
  }
];

export const serviceFaqs: FAQItem[] = [
  {
    question: "How does the process start?",
    answer:
      "Choose the service, enter your name and phone number, then upload what you have. An account is optional."
  },
  {
    question: "Will I see the fee before work starts?",
    answer:
      "Yes. Final fee depends on your documents, income type and complexity. We confirm the fee before starting work."
  },
  {
    question: "Can I use WhatsApp?",
    answer:
      "Yes. WhatsApp support is available for updates and help. Your dashboard remains the main place to track status."
  }
];

export const dashboardFaqs: FAQItem[] = [
  {
    question: "What is a Tax Help ID?",
    answer:
      "It is your public account ID, such as TAX-583921. You can use it to login and share it on WhatsApp for faster support."
  },
  {
    question: "What does payment verification pending mean?",
    answer:
      "It means you uploaded a manual payment screenshot. The team will check it and update payment status."
  }
];
