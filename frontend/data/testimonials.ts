import { imageConfig } from "@/data/images";

export const testimonials = [
  {
    name: "Ritika S.",
    role: "Salary ITR user",
    image: imageConfig.personOne,
    quote: "I uploaded Form 16 from my phone and got clear updates. The process was simple."
  },
  {
    name: "Amit P.",
    role: "Small business owner",
    image: imageConfig.personTwo,
    quote: "GST records and payment status were easy to track. I knew what was pending."
  },
  {
    name: "Neha R.",
    role: "Loan paperwork user",
    image: imageConfig.personOne,
    quote: "The project report checklist helped me arrange documents before applying."
  }
] as const;
