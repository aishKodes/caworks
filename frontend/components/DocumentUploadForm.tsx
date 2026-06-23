"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  documentServiceOptions,
  getDocumentRequirements,
  getFallbackDocumentRequirements,
  type DocumentRequirement
} from "@/data/documentRequirements";
import { whatsappMessages } from "@/data/site.config";
import { uploadDocuments } from "@/lib/api";
import { buildAuthRedirectUrl, requireAuthForIntent } from "@/lib/authRedirect";

const inputClass =
  "mt-2 w-full rounded-2xl border border-charcoal-900/10 bg-white px-4 py-3.5 text-base text-charcoal-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";

type FileState = Record<string, File[]>;

function fileSummary(file: File) {
  const size = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
  return `${file.name} · ${size}`;
}

function checklistTypeToService(checklistType?: "salary" | "gst" | "loan") {
  if (checklistType === "gst") return "gst-return-filing";
  if (checklistType === "loan") return "loan-project-report";
  return "salary-itr-filing";
}

export function DocumentUploadForm({
  requestId,
  requestCode,
  uploadToken,
  checklistType = "salary",
  initialServiceSlug
}: {
  requestId?: string;
  requestCode?: string;
  uploadToken?: string;
  checklistType?: "salary" | "gst" | "loan";
  initialServiceSlug?: string;
}) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState(initialServiceSlug || checklistTypeToService(checklistType));
  const [requirements, setRequirements] = useState<DocumentRequirement[]>(() => getFallbackDocumentRequirements(initialServiceSlug || checklistTypeToService(checklistType)));
  const [filesByKey, setFilesByKey] = useState<FileState>({});
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const selectedCount = useMemo(() => Object.values(filesByKey).reduce((total, files) => total + files.length, 0), [filesByKey]);
  const selectedServiceLabel = documentServiceOptions.find((option) => option.value === serviceSlug)?.label || "selected service";

  useEffect(() => {
    let ignore = false;
    getDocumentRequirements(serviceSlug).then((items) => {
      if (ignore) return;
      setRequirements(items);
      setFilesByKey({});
      setMessage("");
      setProgress(0);
      setStatus("idle");
    });
    return () => {
      ignore = true;
    };
  }, [serviceSlug]);

  function updateFiles(requirement: DocumentRequirement, event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files || []);
    if (!chosen.length) return;
    setFilesByKey((current) => ({
      ...current,
      [requirement.documentKey]: requirement.allowMultiple
        ? [...(current[requirement.documentKey] || []), ...chosen]
        : [chosen[0]]
    }));
    event.target.value = "";
  }

  function removeFile(documentKey: string, index: number) {
    setFilesByKey((current) => {
      const nextFiles = [...(current[documentKey] || [])];
      nextFiles.splice(index, 1);
      return { ...current, [documentKey]: nextFiles };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const returnTo = `/upload-documents?service=${encodeURIComponent(serviceSlug)}${requestId ? `&requestId=${encodeURIComponent(requestId)}` : ""}`;
    if (!requestCode || !uploadToken) {
      const isLoggedIn = await requireAuthForIntent(router, "upload_documents", returnTo, serviceSlug, requestId);
      if (!isLoggedIn) return;
    }

    if (serviceSlug === "not-sure" && details.trim().length < 8) {
      setStatus("error");
      setMessage("Please add a short message so we understand what help you need.");
      return;
    }

    if (!selectedCount && serviceSlug !== "not-sure") {
      setStatus("error");
      setMessage("Please choose at least one document, or use WhatsApp if you need help.");
      return;
    }

    const formData = new FormData();
    formData.append("request_id", requestId || "");
    formData.append("request_code", requestCode || "");
    formData.append("upload_token", uploadToken || "");
    formData.append("service_slug", serviceSlug);
    formData.append("service_label", selectedServiceLabel);
    formData.append("message", details.trim());

    for (const requirement of requirements) {
      for (const file of filesByKey[requirement.documentKey] || []) {
        formData.append("files[]", file);
        formData.append("document_types[]", requirement.documentKey);
        formData.append("document_labels[]", requirement.title);
      }
    }

    setStatus("uploading");
    setProgress(35);
    const result = await uploadDocuments(formData);
    setProgress(100);

    if (result.ok) {
      setFilesByKey({});
      setDetails("");
      setStatus("success");
      setMessage(result.message || "Documents uploaded. We will check and update your request.");
    } else {
      if (result.status === 401) {
        if (requestCode && uploadToken) {
          setStatus("error");
          setMessage("This secure upload link is invalid or expired. Please start a new request or contact us on WhatsApp.");
          return;
        }
        router.push(buildAuthRedirectUrl({ intent: "upload_documents", returnTo, serviceSlug, requestId }));
        return;
      }
      setStatus("error");
      setMessage(result.message || "Upload failed. Please try again or use WhatsApp.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-charcoal-900/10 bg-white p-5 shadow-soft md:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Document upload</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal-900">Upload what you have. Our team will contact you if anything else is needed.</h2>
      <p className="mt-2 text-base leading-7 text-charcoal-700">
        Allowed files: PDF, JPG, JPEG, PNG and WEBP. Maximum suggested size: 8 MB per file.
      </p>

      <label className="mt-6 block text-sm font-semibold text-charcoal-900">
        Select service
        <select value={serviceSlug} onChange={(event) => setServiceSlug(event.target.value)} className={inputClass}>
          {documentServiceOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-semibold text-charcoal-900">
        Message / details {serviceSlug === "not-sure" ? <span className="text-brand-700">(required)</span> : <span className="font-medium text-muted">(optional)</span>}
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          className={`${inputClass} min-h-24 resize-y`}
          placeholder="Example: I have Form 16 and need help filing salary ITR."
        />
      </label>

      <div className="mt-6 grid gap-4">
        {requirements.map((requirement) => {
          const selectedFiles = filesByKey[requirement.documentKey] || [];
          const inputId = `upload-${requirement.documentKey}`;
          const guidanceOnly = requirement.documentKey.includes("_note");
          return (
            <section key={requirement.documentKey} className="rounded-2xl border border-charcoal-900/10 bg-paper/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-charcoal-900">{requirement.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${requirement.required ? "bg-brand-50 text-brand-700" : "bg-white text-charcoal-700"}`}>
                      {requirement.required ? "Required" : "Optional"}
                    </span>
                    {requirement.allowMultiple ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-charcoal-700">Multiple files</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-charcoal-700">{requirement.description}</p>
                </div>
                {guidanceOnly ? null : (
                  <>
                    <label htmlFor={inputId} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-charcoal-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                      Choose file
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      multiple={requirement.allowMultiple}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      onChange={(event) => updateFiles(requirement, event)}
                    />
                  </>
                )}
              </div>
              {selectedFiles.length ? (
                <div className="mt-4 grid gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}-${index}`} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-charcoal-700">
                      <span className="min-w-0 truncate">{fileSummary(file)}</span>
                      <button type="button" onClick={() => removeFile(requirement.documentKey, index)} className="shrink-0 rounded-full border border-charcoal-900/10 px-3 py-1 text-xs font-semibold text-brand-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {status === "uploading" ? (
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-brand-50">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <button disabled={status === "loading" || status === "uploading"} className="mt-6 w-full rounded-full bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-red transition hover:bg-brand-700 disabled:opacity-70">
        {status === "loading" ? "Loading checklist..." : status === "uploading" ? "Uploading..." : selectedCount ? `Upload ${selectedCount} document${selectedCount === 1 ? "" : "s"}` : serviceSlug === "not-sure" ? "Send message" : "Upload documents"}
      </button>
      <p aria-live="polite" className={`mt-4 min-h-6 text-sm font-medium ${status === "success" ? "text-green-700" : "text-brand-700"}`}>
        {message}
      </p>
      <div className="mt-4 rounded-2xl border border-charcoal-900/10 bg-white p-4">
        <p className="text-sm leading-6 text-charcoal-700">Need help? You can also send documents on WhatsApp. Do not send passwords in this form.</p>
        <WhatsAppButton message={whatsappMessages.documentUpload} variant="outline" className="mt-3 w-full">
          Send Documents on WhatsApp
        </WhatsAppButton>
      </div>
    </form>
  );
}
