/**
 * Startup Environment Validation
 * Ensures all required environment variables are set before the app starts.
 * Import this early in your application (e.g., in root layout or middleware).
 */

interface RequiredEnvVar {
  name: string;
  description: string;
  requiredInProduction?: boolean; // if true, required in all environments; if false, only in production
}

const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
  // Core app
  { name: "MONGODB_URI", description: "MongoDB connection string" },
  { name: "JWT_SECRET", description: "JWT signing secret (min 32 chars)" },
  { name: "JWT_ISSUER", description: "JWT token issuer" },
  { name: "JWT_AUDIENCE", description: "JWT token audience" },

  // Security
  { name: "CSRF_SECRET", description: "CSRF token signing secret" },

  // Optional but recommended for production
  { name: "NEXTAUTH_SECRET", description: "NextAuth secret", requiredInProduction: false },
];

/**
 * Validates all required environment variables.
 * Throws an error if any are missing.
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value) {
      if (envVar.requiredInProduction === false && process.env.NODE_ENV !== "production") {
        warnings.push(`${envVar.name}: ${envVar.description} (not set - optional in development)`);
      } else {
        errors.push(`${envVar.name}: ${envVar.description}`);
      }
    } else if (envVar.name === "JWT_SECRET" && value.length < 32) {
      errors.push(`${envVar.name}: JWT_SECRET must be at least 32 characters long (current: ${value.length})`);
    }
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    const message = [
      "❌ Missing required environment variables:",
      ...errors.map((e) => `  - ${e}`),
      "",
      "Please check your .env.local or production environment configuration.",
    ].join("\n");

    throw new Error(message);
  }
}

/**
 * Call this function early in your application to validate environment at startup.
 * In Next.js App Router, import this in app/layout.tsx or middleware.ts.
 */
export function initializeApp(): void {
  validateEnvironment();
}