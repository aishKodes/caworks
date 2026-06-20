"use client";

import { FormEvent, useMemo, useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { whatsappMessages } from "@/data/site.config";
import { uploadDocuments } from "@/lib/api";

const checklists: Record<string, string[]> = {
  salary: ["Form 16", "PAN", "Aadhaar", "AIS / Form 26AS if available", "Bank details", "Investment proofs if any", "Previous year ITR if available", "Other documents"],
  gst: ["GST certificate if available", "Sales data", "Purchase data", "Bank statement", "Previous return if available", "Other documents"],
  loan: ["Business details", "Bank statement", "Existing loan details if any", "Quotation or project estimate", "Identity/address proof", "Other documents"]
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3 text-sm text-charcoal-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

export function DocumentUploadForm({
  requestId,
  checklistType = "salary"
}: {
  requestId?: string;
  checklistType?: "salary" | "gst" | "loan";
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const checklist = useMemo(() => checklists[checklistType], [checklistType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("files");

    if (!files.length || files.every((file) => !(file instanceof File) || file.size === 0)) {
      setStatus("error");
      setMessage("Please choose at least one document.");
      return;
    }

    setStatus("uploading");
    setProgress(35);
    const result = await uploadDocuments(formData);
    setProgress(100);

    if (result.ok) {
      form.reset();
      setStatus("success");
      setMessage("Documents uploaded. We will check and update your request.");
    } else {
      setStatus("error");
      setMessage(result.message || "Upload failed. Please try again or use WhatsApp.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Document upload</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal-900">Upload documents from your phone.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Allowed files: PDF, JPG, JPEG, PNG and WEBP. Maximum suggested size: 8 MB per file.</p>

      <input type="hidden" name="request_id" value={requestId || ""} />

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-charcoal-900">Checklist</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-sm text-charcoal-700">
              <input type="checkbox" name="checklist[]" value={item} className="h-4 w-4 rounded border-charcoal-900/20 text-brand-600" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block text-sm font-semibold text-charcoal-900">
        Document type
        <input name="document_type" className={inputClass} placeholder="Example: Form 16" />
      </label>

      <label className="mt-4 block rounded-2xl border border-dashed border-charcoal-900/20 bg-paper/70 p-4 text-sm font-semibold text-charcoal-900">
        Select files
        <input
          type="file"
          name="files"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="mt-3 block w-full cursor-pointer rounded-xl border border-charcoal-900/10 bg-white text-sm text-muted file:mr-4 file:border-0 file:bg-brand-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
        />
      </label>

      {status === "uploading" ? (
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-brand-50">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <button disabled={status === "uploading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "uploading" ? "Uploading..." : "Upload documents"}
      </button>
      <p aria-live="polite" className={`mt-4 min-h-6 text-sm font-medium ${status === "success" ? "text-green-700" : "text-brand-700"}`}>
        {message}
      </p>
      {status === "success" || status === "error" ? (
        <WhatsAppButton message={whatsappMessages.documentUpload} variant="outline" className="mt-3 w-full">
          Send Documents on WhatsApp
        </WhatsAppButton>
      ) : null}
    </form>
  );
}
