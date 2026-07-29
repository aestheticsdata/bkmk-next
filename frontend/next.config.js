const isDev = process.env.NODE_ENV !== "production";
const localApiHost = process.env.NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST;

// The API runs on a different port locally (3101 by default). In production it is
// served under the same domain as the front (bkmk.1991computer.com/api), so 'self' covers it.
const devApiSources = [
  "http://localhost:3101",
  "http://127.0.0.1:3101",
];

if (localApiHost && !devApiSources.includes(localApiHost)) {
  devApiSources.push(localApiHost);
}

const devConnectSources = [
  "ws:",
  "wss:",
  ...devApiSources,
];

const cspDirectives = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  "script-src": [
    "'self'",
    // Next runtime injects inline bootstrap script unless using CSP nonces.
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  // Bookmark screenshots arrive from the API as data URIs.
  "img-src": ["'self'", "data:", "blob:", ...(isDev ? devApiSources : [])],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    ...(isDev ? devConnectSources : []),
  ],
  "frame-src": ["'none'"],
  "worker-src": ["'self'", "blob:"],
};

const contentSecurityPolicy = Object.entries(cspDirectives)
  .map(([directive, values]) => `${directive} ${values.join(" ")}`)
  .join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  trailingSlash: true,
  turbopack: {
    // Tells Next this folder is the workspace root; otherwise it walks up to the
    // repository's own pnpm-lock.yaml and warns on every start.
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
