import { createClient } from "@/lib/supabase/server";
import type { PublicForm } from "@/components/public/PublicFormRenderer";

export async function getFormBySlug(
  slug: string
): Promise<PublicForm | null> {
  const supabase = await createClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select(
      `
      id,
      slug,
      title,
      description,
      status,
      settings,
      form_steps (
        id,
        form_id,
        title,
        description,
        position,
        settings
      ),
      form_fields (
        id,
        form_id,
        step_id,
        type,
        name,
        label,
        description,
        placeholder,
        required,
        position,
        settings
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !form) return null;

  /* Ordenar por position */
  const steps = (form.form_steps ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );
  const fields = (form.form_fields ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );

  return {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    status: form.status,
    settings: form.settings ?? {},
    steps,
    fields,
  };
}
