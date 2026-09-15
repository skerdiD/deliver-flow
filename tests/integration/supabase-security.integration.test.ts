import { randomUUID } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!supabaseUrl || !anonKey || !serviceRoleKey || !databaseUrl) {
  throw new Error(
    "Supabase integration tests require the local URL, anon key, service-role key, and database URL.",
  );
}

const localSupabaseUrl = supabaseUrl;
const localAnonKey = anonKey;

const runId = randomUUID();
const password = "SupabaseIntegration123!";
const ids = {
  workspaceA: randomUUID(),
  workspaceB: randomUUID(),
  assignedClient: randomUUID(),
  peerClient: randomUUID(),
  unassignedClient: randomUUID(),
  tenantBClient: randomUUID(),
  projectA: randomUUID(),
  projectB: randomUUID(),
  visibleTask: randomUUID(),
  hiddenTask: randomUUID(),
  ownFeedback: randomUUID(),
  peerFeedback: randomUUID(),
  visibleFile: randomUUID(),
  secondFile: randomUUID(),
  ownerTask: randomUUID(),
  clientFeedback: randomUUID(),
};
const emails = {
  ownerA: `owner-a-${runId}@deliverflow.test`,
  assigned: `assigned-${runId}@deliverflow.test`,
  peer: `peer-${runId}@deliverflow.test`,
  unassigned: `unassigned-${runId}@deliverflow.test`,
  ownerB: `owner-b-${runId}@deliverflow.test`,
  tenantB: `tenant-b-${runId}@deliverflow.test`,
};
const objectPath = `integration/${runId}/private.txt`;
const objectBody = `private integration object ${runId}`;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const db = postgres(databaseUrl, { max: 1, prepare: false });
const createdUserIds: string[] = [];
const generatedWorkspaceIds: string[] = [];
const users = new Map<keyof typeof emails, SupabaseClient>();

async function createAuthUser(
  key: keyof typeof emails,
  role: "owner" | "client",
) {
  const { data, error } = await admin.auth.admin.createUser({
    email: emails[key],
    password,
    email_confirm: true,
    user_metadata: {
      full_name: key,
      ...(role === "client" ? { invited_via: "deliverflow" } : {}),
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Could not create ${key}.`);
  }

  createdUserIds.push(data.user.id);
  const [profile] = await db<{ workspace_id: string }[]>`
    select workspace_id from public.profiles where id = ${data.user.id}
  `;
  generatedWorkspaceIds.push(profile.workspace_id);

  const client = createClient(localSupabaseUrl, localAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email: emails[key],
    password,
  });
  if (signInError) throw signInError;
  users.set(key, client);

  return data.user.id;
}

beforeAll(async () => {
  const ownerAId = await createAuthUser("ownerA", "owner");
  const assignedId = await createAuthUser("assigned", "client");
  const peerId = await createAuthUser("peer", "client");
  const unassignedId = await createAuthUser("unassigned", "client");
  const ownerBId = await createAuthUser("ownerB", "owner");
  const tenantBId = await createAuthUser("tenantB", "client");

  await db.begin(async (transaction) => {
    await transaction`
      insert into public.workspaces (id, name, slug)
      values
        (${ids.workspaceA}, 'Integration Workspace A', ${`integration-a-${runId}`}),
        (${ids.workspaceB}, 'Integration Workspace B', ${`integration-b-${runId}`})
    `;
    await transaction`
      update public.profiles
      set workspace_id = ${ids.workspaceA}, updated_at = now()
      where id in (${ownerAId}, ${assignedId}, ${peerId}, ${unassignedId})
    `;
    await transaction`
      update public.profiles
      set workspace_id = ${ids.workspaceB}, updated_at = now()
      where id in (${ownerBId}, ${tenantBId})
    `;
    await transaction`
      insert into public.clients (
        id, workspace_id, profile_id, company_name, contact_name, email, status, created_by
      ) values
        (${ids.assignedClient}, ${ids.workspaceA}, ${assignedId}, 'Assigned Client', 'Assigned Client', ${emails.assigned}, 'active', ${ownerAId}),
        (${ids.peerClient}, ${ids.workspaceA}, ${peerId}, 'Peer Client', 'Peer Client', ${emails.peer}, 'active', ${ownerAId}),
        (${ids.unassignedClient}, ${ids.workspaceA}, ${unassignedId}, 'Unassigned Client', 'Unassigned Client', ${emails.unassigned}, 'active', ${ownerAId}),
        (${ids.tenantBClient}, ${ids.workspaceB}, ${tenantBId}, 'Tenant B Client', 'Tenant B Client', ${emails.tenantB}, 'active', ${ownerBId})
    `;
    await transaction`
      insert into public.projects (
        id, workspace_id, name, slug, status, progress, created_by
      ) values
        (${ids.projectA}, ${ids.workspaceA}, 'Workspace A Project', ${`project-a-${runId}`}, 'active', 50, ${ownerAId}),
        (${ids.projectB}, ${ids.workspaceB}, 'Workspace B Project', ${`project-b-${runId}`}, 'active', 50, ${ownerBId})
    `;
    await transaction`
      insert into public.project_assignments (
        workspace_id, project_id, client_id, assigned_by
      ) values
        (${ids.workspaceA}, ${ids.projectA}, ${ids.assignedClient}, ${ownerAId}),
        (${ids.workspaceA}, ${ids.projectA}, ${ids.peerClient}, ${ownerAId}),
        (${ids.workspaceB}, ${ids.projectB}, ${ids.tenantBClient}, ${ownerBId})
    `;
    await transaction`
      insert into public.tasks (
        id, workspace_id, project_id, title, is_visible_to_client, created_by
      ) values
        (${ids.visibleTask}, ${ids.workspaceA}, ${ids.projectA}, 'Visible task', true, ${ownerAId}),
        (${ids.hiddenTask}, ${ids.workspaceA}, ${ids.projectA}, 'Hidden task', false, ${ownerAId})
    `;
    await transaction`
      insert into public.feedback (
        id, workspace_id, project_id, client_id, created_by, message, is_visible_to_client
      ) values
        (${ids.ownFeedback}, ${ids.workspaceA}, ${ids.projectA}, ${ids.assignedClient}, ${assignedId}, 'Own feedback', true),
        (${ids.peerFeedback}, ${ids.workspaceA}, ${ids.projectA}, ${ids.peerClient}, ${peerId}, 'Peer feedback', true)
    `;
    await transaction`
      insert into public.project_files (
        id, workspace_id, project_id, uploaded_by, file_name, original_file_name,
        bucket_name, storage_path, file_type, file_size, file_extension,
        category, is_visible_to_client
      ) values
        (${ids.visibleFile}, ${ids.workspaceA}, ${ids.projectA}, ${ownerAId}, 'Visible file.txt', 'Visible file.txt',
         'project-files', ${objectPath}, 'text/plain', ${objectBody.length}, '.txt', 'deliverable', true),
        (${ids.secondFile}, ${ids.workspaceA}, ${ids.projectA}, ${ownerAId}, 'Second file.txt', 'Second file.txt',
         'project-files', ${`integration/${runId}/second.txt`}, 'text/plain', 7, '.txt', 'deliverable', true)
    `;
  });

  const { error: uploadError } = await admin.storage
    .from("project-files")
    .upload(objectPath, objectBody, {
      contentType: "text/plain",
      upsert: true,
    });
  if (uploadError) throw uploadError;
});

afterAll(async () => {
  await admin.storage.from("project-files").remove([objectPath]);
  for (const userId of createdUserIds) {
    await admin.auth.admin.deleteUser(userId);
  }
  await db`
    delete from public.workspaces
    where id in (${ids.workspaceA}, ${ids.workspaceB})
  `;
  if (generatedWorkspaceIds.length > 0) {
    await db`
      delete from public.workspaces where id in ${db(generatedWorkspaceIds)}
    `;
  }
  await db.end();
});

describe("Supabase Auth and RLS integration", () => {
  it("does not expose application tables to anonymous callers", async () => {
    const anonymous = createClient(localSupabaseUrl, localAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const result = await anonymous.from("projects").select("id");

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it("creates owner and invited-client profiles with the intended roles", async () => {
    const ownerResult = await users
      .get("ownerA")!
      .from("profiles")
      .select("email, role")
      .eq("email", emails.ownerA);
    const clientResult = await users
      .get("assigned")!
      .from("profiles")
      .select("email, role")
      .eq("email", emails.assigned);

    expect(ownerResult.error).toBeNull();
    expect(ownerResult.data).toEqual([{ email: emails.ownerA, role: "owner" }]);
    expect(clientResult.error).toBeNull();
    expect(clientResult.data).toEqual([
      { email: emails.assigned, role: "client" },
    ]);
  });

  it("isolates owner reads and writes by workspace", async () => {
    const ownerA = users.get("ownerA")!;
    const { data, error } = await ownerA.from("projects").select("id");

    expect(error).toBeNull();
    expect(data).toEqual([{ id: ids.projectA }]);

    const crossTenantInsert = await ownerA.from("projects").insert({
      workspace_id: ids.workspaceB,
      name: "Cross-tenant write",
      slug: `cross-tenant-${runId}`,
    });
    expect(crossTenantInsert.error).not.toBeNull();

    const crossLinkedTask = await ownerA.from("tasks").insert({
      workspace_id: ids.workspaceA,
      project_id: ids.projectB,
      title: "Cross-linked task",
    });
    expect(crossLinkedTask.error).not.toBeNull();

    const crossLinkedAssignment = await ownerA
      .from("project_assignments")
      .insert({
        workspace_id: ids.workspaceA,
        project_id: ids.projectA,
        client_id: ids.tenantBClient,
      });
    expect(crossLinkedAssignment.error).not.toBeNull();

    const crossTenantUpdate = await ownerA
      .from("projects")
      .update({ name: "Forged update" })
      .eq("id", ids.projectB)
      .select("id");
    expect(crossTenantUpdate.error).toBeNull();
    expect(crossTenantUpdate.data).toEqual([]);

    const crossTenantDelete = await ownerA
      .from("projects")
      .delete()
      .eq("id", ids.projectB)
      .select("id");
    expect(crossTenantDelete.error).toBeNull();
    expect(crossTenantDelete.data).toEqual([]);
  });

  it("allows owner CRUD only with consistent same-workspace relationships", async () => {
    const ownerA = users.get("ownerA")!;
    const inserted = await ownerA
      .from("tasks")
      .insert({
        id: ids.ownerTask,
        workspace_id: ids.workspaceA,
        project_id: ids.projectA,
        title: "Owner RLS task",
      })
      .select("id, status")
      .single();
    expect(inserted.error).toBeNull();
    expect(inserted.data).toEqual({ id: ids.ownerTask, status: "todo" });

    const updated = await ownerA
      .from("tasks")
      .update({ status: "completed" })
      .eq("id", ids.ownerTask)
      .select("status")
      .single();
    expect(updated.error).toBeNull();
    expect(updated.data?.status).toBe("completed");

    const deleted = await ownerA
      .from("tasks")
      .delete()
      .eq("id", ids.ownerTask)
      .select("id")
      .single();
    expect(deleted.error).toBeNull();
    expect(deleted.data?.id).toBe(ids.ownerTask);
  });

  it("limits client reads to assignments, visible rows, and their own feedback", async () => {
    const assigned = users.get("assigned")!;
    const [projectsResult, tasksResult, feedbackResult, filesResult] =
      await Promise.all([
        assigned.from("projects").select("id"),
        assigned.from("tasks").select("id"),
        assigned.from("feedback").select("id"),
        assigned.from("project_files").select("id"),
      ]);

    expect(projectsResult.error).toBeNull();
    expect(projectsResult.data).toEqual([{ id: ids.projectA }]);
    expect(tasksResult.data).toEqual([{ id: ids.visibleTask }]);
    expect(feedbackResult.data).toEqual([{ id: ids.ownFeedback }]);
    expect(filesResult.data).toEqual(
      expect.arrayContaining([{ id: ids.visibleFile }, { id: ids.secondFile }]),
    );
    expect(filesResult.data).toHaveLength(2);
  });

  it("denies unassigned and cross-tenant project access", async () => {
    const unassignedResult = await users
      .get("unassigned")!
      .from("projects")
      .select("id");
    const tenantBResult = await users
      .get("tenantB")!
      .from("projects")
      .select("id");

    expect(unassignedResult.error).toBeNull();
    expect(unassignedResult.data).toEqual([]);
    expect(tenantBResult.error).toBeNull();
    expect(tenantBResult.data).toEqual([{ id: ids.projectB }]);
  });

  it("allows a client to read only their active client record without internal notes", async () => {
    const assigned = users.get("assigned")!;
    const ownRecord = await assigned.from("clients").select("id");
    const internalNotes = await assigned.from("clients").select("notes");

    expect(ownRecord.error).toBeNull();
    expect(ownRecord.data).toEqual([{ id: ids.assignedClient }]);
    expect(internalNotes.error).not.toBeNull();
    expect(internalNotes.data).toBeNull();
  });

  it("prevents browser clients from mutating protected file metadata", async () => {
    const result = await users
      .get("ownerA")!
      .from("project_files")
      .insert({
        workspace_id: ids.workspaceA,
        project_id: ids.projectA,
        file_name: "Browser bypass.txt",
        original_file_name: "Browser bypass.txt",
        bucket_name: "project-files",
        storage_path: `integration/${runId}/bypass.txt`,
        file_extension: ".txt",
      });

    expect(result.error).not.toBeNull();
  });

  it("prevents clients from forging resolved feedback or owner responses", async () => {
    const assigned = users.get("assigned")!;
    const { data: userData, error: userError } = await assigned.auth.getUser();

    expect(userError).toBeNull();
    expect(userData.user).not.toBeNull();

    const result = await assigned.from("feedback").insert({
      workspace_id: ids.workspaceA,
      project_id: ids.projectA,
      client_id: ids.assignedClient,
      created_by: userData.user!.id,
      message: "Forged resolved feedback",
      status: "resolved",
      admin_response: "Forged owner response",
      resolved_at: new Date().toISOString(),
    });

    expect(result.error).not.toBeNull();
  });

  it("allows valid client feedback but denies forged ownership and owner-only writes", async () => {
    const assigned = users.get("assigned")!;
    const { data: userData } = await assigned.auth.getUser();

    const validFeedback = await assigned.from("feedback").insert({
      id: ids.clientFeedback,
      workspace_id: ids.workspaceA,
      project_id: ids.projectA,
      client_id: ids.assignedClient,
      created_by: userData.user!.id,
      message: "Valid assigned-client feedback",
    });
    expect(validFeedback.error).toBeNull();

    const forgedClient = await assigned.from("feedback").insert({
      workspace_id: ids.workspaceA,
      project_id: ids.projectA,
      client_id: ids.peerClient,
      created_by: userData.user!.id,
      message: "Forged peer feedback",
    });
    expect(forgedClient.error).not.toBeNull();

    const forgedProject = await assigned.from("feedback").insert({
      workspace_id: ids.workspaceA,
      project_id: ids.projectB,
      client_id: ids.assignedClient,
      created_by: userData.user!.id,
      message: "Forged project feedback",
    });
    expect(forgedProject.error).not.toBeNull();

    const ownerOnlyWrite = await assigned.from("admin_notes").insert({
      workspace_id: ids.workspaceA,
      created_by: userData.user!.id,
      content: "Forged owner note",
    });
    expect(ownerOnlyWrite.error).not.toBeNull();

    const clientMutation = await assigned
      .from("clients")
      .update({ status: "archived" })
      .eq("id", ids.assignedClient)
      .select("id");
    expect(clientMutation.error).toBeNull();
    expect(clientMutation.data).toEqual([]);
  });
});

describe("private Supabase Storage integration", () => {
  it("denies direct authenticated and public object access", async () => {
    const directDownload = await users
      .get("assigned")!
      .storage.from("project-files")
      .download(objectPath);
    const directSign = await users
      .get("assigned")!
      .storage.from("project-files")
      .createSignedUrl(objectPath, 60);
    const publicUrl = admin.storage
      .from("project-files")
      .getPublicUrl(objectPath).data.publicUrl;
    const publicResponse = await fetch(publicUrl);

    expect(directDownload.error).not.toBeNull();
    expect(directSign.error).not.toBeNull();
    expect(publicResponse.ok).toBe(false);
  });

  it("allows short-lived service-issued signed URLs and enforces expiry", async () => {
    const { data, error } = await admin.storage
      .from("project-files")
      .createSignedUrl(objectPath, 1);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();

    const immediateResponse = await fetch(data!.signedUrl);
    expect(immediateResponse.ok).toBe(true);
    expect(await immediateResponse.text()).toBe(objectBody);

    await new Promise((resolve) => setTimeout(resolve, 2_100));
    const expiredResponse = await fetch(data!.signedUrl);
    expect(expiredResponse.ok).toBe(false);
  });
});
