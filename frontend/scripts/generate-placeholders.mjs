import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const imageDir = join(process.cwd(), "public", "images");
mkdirSync(imageDir, { recursive: true });

const stockImages = [
  [
    "hero-premium-consulting.jpg",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=85",
    "Premium Consulting",
    "Tax, GST and paperwork support"
  ],
  [
    "individual-itr-filing.jpg",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=85",
    "Salary ITR Filing",
    "Upload Form 16 from your phone"
  ],
  [
    "small-business-support.jpg",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=85",
    "Small Business Support",
    "GST, invoices and business paperwork"
  ],
  [
    "compliance-consulting.jpg",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85",
    "Compliance Consulting",
    "Clear records and status tracking"
  ],
  [
    "upload-payment-tracking.jpg",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85",
    "Upload Documents",
    "Secure upload, payment and tracking"
  ],
  [
    "contact-consulting-office.jpg",
    "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1600&q=85",
    "Contact Office",
    "A calm support environment"
  ],
  [
    "blog-tax-guide.jpg",
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=85",
    "Tax Guide",
    "Simple guides for Indian users"
  ],
  [
    "blog-business-guide.jpg",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85",
    "Business Guide",
    "Records, GST and loan paperwork"
  ]
];

const generatedRasters = [
  ["hero-dashboard.png", "Request Dashboard", "Documents, payment and status tracking", "#be1e2d", "#fffaf7", "png"],
  ["tax-help-placeholder.jpg", "Tax Help", "Online filing and paperwork support", "#111111", "#f5f1ed", "jpeg"],
  ["document-upload.jpg", "Document Upload", "Upload files from phone", "#be1e2d", "#ffffff", "jpeg"],
  ["office-placeholder.jpg", "Support Desk", "Contact and operations placeholder", "#111111", "#f5f1ed", "jpeg"],
  ["person-placeholder-1.jpg", "User", "Placeholder person", "#be1e2d", "#fff2f1", "jpeg"],
  ["person-placeholder-2.jpg", "User", "Placeholder person", "#111111", "#f5f1ed", "jpeg"],
  ["payment-placeholder.jpg", "Payment", "Razorpay or manual screenshot", "#be1e2d", "#ffffff", "jpeg"]
];

function escapeText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function makeSvg(title, subtitle, accent, bg) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="30" flood-color="#111111" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="1000" cy="140" r="220" fill="${accent}" opacity="0.08"/>
  <circle cx="120" cy="720" r="240" fill="${accent}" opacity="0.06"/>
  <g filter="url(#shadow)">
    <rect x="150" y="120" width="900" height="560" rx="46" fill="#ffffff"/>
    <rect x="205" y="180" width="260" height="34" rx="17" fill="${accent}" opacity="0.16"/>
    <rect x="205" y="250" width="520" height="58" rx="18" fill="#111111"/>
    <rect x="205" y="340" width="790" height="1" fill="#e7e1dd"/>
    <rect x="205" y="390" width="220" height="112" rx="28" fill="${accent}" opacity="0.12"/>
    <rect x="455" y="390" width="220" height="112" rx="28" fill="#111111" opacity="0.08"/>
    <rect x="705" y="390" width="220" height="112" rx="28" fill="${accent}" opacity="0.10"/>
    <rect x="205" y="545" width="340" height="34" rx="17" fill="#5c5f66" opacity="0.18"/>
    <rect x="205" y="600" width="520" height="26" rx="13" fill="#5c5f66" opacity="0.14"/>
    <circle cx="910" cy="250" r="68" fill="${accent}" opacity="0.15"/>
    <path d="M875 254l24 24 52-62" fill="none" stroke="${accent}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="205" y="290" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${escapeText(title)}</text>
  <text x="205" y="650" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="#171717">${escapeText(subtitle)}</text>
</svg>`;
}

async function downloadImage(file, url, title, subtitle) {
  const outPath = join(imageDir, file);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VB Consultants placeholder asset generator"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    writeFileSync(outPath, bytes);
    return;
  } catch {
    writeRaster(file, title, subtitle, "#be1e2d", "#fffaf7", "jpeg");
  }
}

function writeRaster(file, title, subtitle, accent, bg, format) {
  const svgPath = join(imageDir, `${file}.svg`);
  const outPath = join(imageDir, file);
  writeFileSync(svgPath, makeSvg(title, subtitle, accent, bg), "utf8");
  execFileSync("sips", ["-s", "format", format, svgPath, "--out", outPath], { stdio: "ignore" });
  rmSync(svgPath, { force: true });
}

for (const [file, url, title, subtitle] of stockImages) {
  await downloadImage(file, url, title, subtitle);
}

for (const [file, title, subtitle, accent, bg, format] of generatedRasters) {
  writeRaster(file, title, subtitle, accent, bg, format);
}

const selectedMark = join(imageDir, "vbc", "logomain.png");
const selectedHorizontal = join(imageDir, "vbc", "vb-consultants-logo-wide.png");
if (existsSync(selectedMark)) copyFileSync(selectedMark, join(imageDir, "vbc", "logo-mark.png"));
if (existsSync(selectedHorizontal)) copyFileSync(selectedHorizontal, join(imageDir, "vbc", "logo-horizontal.png"));

const badges = [
  ["trust-secure.svg", "Secure", "S", "#111111"],
  ["trust-razorpay.svg", "Razorpay", "₹", "#be1e2d"],
  ["trust-whatsapp.svg", "WhatsApp", "W", "#128c7e"],
  ["trust-privacy.svg", "Privacy", "P", "#111111"]
];

for (const [file, title, mark, color] of badges) {
  writeFileSync(
    join(imageDir, file),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="${escapeText(title)}">
  <rect width="160" height="160" rx="36" fill="#fff2f1"/>
  <circle cx="80" cy="80" r="48" fill="${color}"/>
  <text x="80" y="95" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${escapeText(mark)}</text>
</svg>`,
    "utf8"
  );
}
