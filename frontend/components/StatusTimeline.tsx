const statuses = [
  "Request received",
  "Documents pending",
  "Documents received",
  "Payment pending",
  "Payment verification pending",
  "Payment received",
  "Under review",
  "More details required",
  "Filing in progress",
  "Completed",
  "Closed"
];

export function StatusTimeline({ currentStatus = "Request received" }: { currentStatus?: string }) {
  const activeIndex = Math.max(0, statuses.indexOf(currentStatus));

  return (
    <ol className="space-y-3">
      {statuses.map((status, index) => {
        const active = index <= activeIndex;
        return (
          <li key={status} className="flex gap-3">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-brand-600 text-white" : "bg-charcoal-900/10 text-muted"}`}>
              {index + 1}
            </span>
            <span className={`text-sm leading-6 ${active ? "font-semibold text-charcoal-900" : "text-muted"}`}>{status}</span>
          </li>
        );
      })}
    </ol>
  );
}
