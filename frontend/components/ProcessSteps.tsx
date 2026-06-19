const defaultSteps = [
  "Choose service",
  "Create account",
  "Upload documents",
  "Pay securely",
  "Track status"
];

export function ProcessSteps({ steps = defaultSteps }: { steps?: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step} className="rounded-2xl border border-charcoal-900/10 bg-white p-5 shadow-soft">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-sm font-semibold text-white">{index + 1}</div>
          <h3 className="mt-4 text-base font-semibold leading-6 text-charcoal-900">{step}</h3>
        </div>
      ))}
    </div>
  );
}
