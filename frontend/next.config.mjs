const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const remotePatterns = [];

if (apiBaseUrl) {
  try {
    const apiUrl = new URL(apiBaseUrl);
    remotePatterns.push({
      protocol: apiUrl.protocol.replace(":", ""),
      hostname: apiUrl.hostname
    });
  } catch {
    // Keep local image defaults when the API URL is not valid during local work.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns
  }
};

export default nextConfig;
