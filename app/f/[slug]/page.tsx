import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PublicForm } from "@/components/form/PublicForm";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function FormPage({
  params,
}: Props) {

  const { slug } = await params;

  const supabase = await createClient();

  const { data: form } =
    await supabase
      .from("forms")
      .select(`
        *,
        steps:form_steps(*)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

  if (!form) {
    notFound();
  }

  const { data: fields } =
    await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", form.id)
      .order("position");

  return (
    <PublicForm
      form={form}
      fields={fields ?? []}
    />
  );
}
