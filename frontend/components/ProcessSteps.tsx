const defaultSteps = [
  "Enter mobile number",
  "Upload documents or send on WhatsApp",
  "Pay online or upload payment screenshot",
  "Track status"
];

export function ProcessSteps({ steps = defaultSteps }: { steps?: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step} className="rounded-3xl border border-charcoal-900/10 bg-white p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-900 text-base font-semibold text-white">{index + 1}</div>
          <h3 className="mt-5 text-lg font-semibold leading-7 text-charcoal-900">{step}</h3>
        </div>
      ))}
    </div>
  );
}
