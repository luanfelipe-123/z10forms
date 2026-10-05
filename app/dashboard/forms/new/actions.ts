"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function createForm(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pegar o tenant_id do usuário. Se não existir, a gente precisa criar (simplificado aqui).
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  let tenantId = userData?.tenant_id;

  // Como é só um MVP para testar, se o user não tem tenant (por não ter trigger no signup), criamos um fake pro teste.
  // IMPORTANTE: Isso deve ser resolvido via DB Trigger na tabela auth.users.
  if (!tenantId) {
    const { data: newTenant } = await supabase.from("tenants").insert({ name: "Meu Workspace" }).select("id").single();
    if (newTenant) {
      tenantId = newTenant.id;
      await supabase.from("users").insert({ id: user.id, email: user.email, tenant_id: tenantId, role: "admin" });
    } else {
      throw new Error("Erro ao criar tenant");
    }
  }

  const title = formData.get("title") as string;
  const slug = crypto.randomBytes(4).toString("hex") + "-" + title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

  const { data: form, error } = await supabase
    .from("forms")
    .insert({
      tenant_id: tenantId,
      title: title || "Novo Formulário",
      slug: slug,
      status: "draft",
      settings: {},
      theme_json: {},
    })
    .select("id")
    .single();

  if (error || !form) {
    console.error("Erro ao criar form:", error);
    redirect("/dashboard?error=create_failed");
  }

  redirect(`/dashboard/forms/${form.id}/edit`);
}
