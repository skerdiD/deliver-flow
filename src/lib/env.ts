type RequiredEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "ARCJET_KEY";

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to your .env.local file.`,
    );
  }

  return value;
}

export function getPublicEnv() {
  return {
    supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getServerEnv() {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    arcjetKey: getRequiredEnv("ARCJET_KEY"),
  };
}