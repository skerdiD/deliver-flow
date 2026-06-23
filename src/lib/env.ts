type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

type ServerEnvKey = "SUPABASE_SERVICE_ROLE_KEY" | "ARCJET_KEY";

export function getRequiredEnv(key: PublicEnvKey | ServerEnvKey): string {
  const value = process.env[key];

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to your .env.local file.`,
    );
  }

  return value;
}

function getRequiredPublicEnv(key: PublicEnvKey): string {
  const value =
    key === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to your .env.local file.`,
    );
  }

  return value;
}

export function getPublicEnv() {
  return {
    supabaseUrl: getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getServerEnv() {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    arcjetKey: getRequiredEnv("ARCJET_KEY"),
  };
}

export function getSupabaseAdminEnv() {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
