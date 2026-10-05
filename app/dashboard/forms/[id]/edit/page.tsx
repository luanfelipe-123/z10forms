import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormBuilderClient } from "./FormBuilderClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFormPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select(`
      *,
      steps:form_steps(*),
      fields:form_fields(*)
    `)
    .eq("id", id)
    .single();

  if (!form) {
    notFound();
  }

  // Garantir que steps e fields venham ordenados por position
  const sortedSteps = (form.steps || []).sort((a: any, b: any) => a.position - b.position);
  const sortedFields = (form.fields || []).sort((a: any, b: any) => a.position - b.position);

  const initialData = {
    ...form,
    steps: sortedSteps,
    fields: sortedFields,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <FormBuilderClient initialForm={initialData} />
    </div>
  );
}
