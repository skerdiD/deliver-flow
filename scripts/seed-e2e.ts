import { config } from "dotenv";

config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "E2E seeding requires DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const email = "unassigned@deliverflow.test";
const password = "E2eUnassigned123!";
const db = postgres(databaseUrl, { max: 1, prepare: false });
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserId() {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    );
    if (user) {
      const { data: updated, error: updateError } =
        await supabase.auth.admin.updateUserById(user.id, {
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: "Unassigned E2E Client",
            invited_via: "deliverflow",
          },
        });
      if (updateError || !updated.user) {
        throw updateError ?? new Error("Could not update the E2E client.");
      }
      return updated.user.id;
    }
    if (data.users.length < 1000) break;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Unassigned E2E Client",
      invited_via: "deliverflow",
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Could not create the unassigned E2E client.");
  }

  return data.user.id;
}

async function main() {
  const userId = await findUserId();
  const [generatedProfile] = await db<[{ workspace_id: string }]>`
    select workspace_id from public.profiles where id = ${userId}
  `;
  const [demoWorkspace] = await db<[{ id: string }]>`
    select id from public.workspaces where slug = 'deliverflow-demo'
  `;

  if (!generatedProfile || !demoWorkspace) {
    throw new Error("Seed the demo workspace before seeding E2E identities.");
  }

  await db.begin(async (transaction) => {
    await transaction`
      update public.profiles
      set workspace_id = ${demoWorkspace.id}, role = 'client', updated_at = now()
      where id = ${userId}
    `;
    await transaction`
      insert into public.clients (
        workspace_id, profile_id, company_name, contact_name, email, status
      ) values (
        ${demoWorkspace.id}, ${userId}, 'Unassigned E2E Client',
        'Unassigned E2E Client', ${email}, 'active'
      )
      on conflict (profile_id) do update set
        workspace_id = excluded.workspace_id,
        company_name = excluded.company_name,
        contact_name = excluded.contact_name,
        email = excluded.email,
        status = 'active',
        archived_at = null,
        deleted_at = null,
        updated_at = now()
    `;

    if (generatedProfile.workspace_id !== demoWorkspace.id) {
      await transaction`
        delete from public.workspaces
        where id = ${generatedProfile.workspace_id}
          and not exists (
            select 1 from public.profiles
            where workspace_id = ${generatedProfile.workspace_id}
          )
      `;
    }
  });

  console.log(`E2E unassigned client ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
