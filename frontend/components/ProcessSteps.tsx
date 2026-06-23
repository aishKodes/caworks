const defaultSteps = [
  { title: "Tell us your issue", description: "Choose tax, GST, insurance claim, loan/project report or not sure." },
  { title: "Upload documents", description: "Upload what you have. Our team will tell you if anything is missing." },
  { title: "We review and contact you", description: "You get a call or WhatsApp from our team." },
  { title: "Work moves forward", description: "We help with filing, reply, documentation, tracking or escalation." }
];

type ProcessStep = string | { title: string; description?: string };

export function ProcessSteps({ steps = defaultSteps }: { steps?: ProcessStep[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div key={typeof step === "string" ? step : step.title} className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-900 text-base font-semibold text-white">{index + 1}</div>
          <h3 className="mt-5 text-lg font-semibold leading-7 text-charcoal-900">{typeof step === "string" ? step : step.title}</h3>
          {typeof step === "string" || !step.description ? null : <p className="mt-2 text-base leading-7 text-charcoal-700">{step.description}</p>}
        </div>
      ))}
    </div>
  );
}
