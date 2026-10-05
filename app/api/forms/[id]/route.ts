import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, settings, theme_json, fields, status } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Atualizar o Formulário Principal (title, settings, theme, status)
    const formUpdate: any = {};
    if (title !== undefined) formUpdate.title = title;
    if (settings !== undefined) formUpdate.settings = settings;
    if (theme_json !== undefined) formUpdate.theme_json = theme_json;
    if (status !== undefined) formUpdate.status = status;

    if (Object.keys(formUpdate).length > 0) {
      const { error: formError } = await supabase
        .from("forms")
        .update(formUpdate)
        .eq("id", id);

      if (formError) {
        console.error("Erro ao atualizar form:", formError);
        return NextResponse.json({ error: "Falha ao salvar formulário" }, { status: 500 });
      }
    }

    // 2. Sincronizar Campos (Upsert)
    if (fields && Array.isArray(fields)) {
      // Upsert: Cria novos ou atualiza existentes pelo ID
      const { error: fieldsError } = await supabase
        .from("form_fields")
        .upsert(
          fields.map((f: any, index: number) => ({
            id: f.id,
            form_id: id,
            type: f.type,
            name: f.name,
            label: f.label,
            description: f.description,
            placeholder: f.placeholder,
            required: f.required,
            position: index, // Garante que a ordem visual é salva no banco
            settings: f.settings || {},
          }))
        );

      if (fieldsError) {
        console.error("Erro ao salvar campos:", fieldsError);
        return NextResponse.json({ error: "Falha ao salvar campos" }, { status: 500 });
      }

      // Opcional: Aqui poderíamos deletar os campos que não vieram no payload.
      // Para o MVP, o Upsert já garante que as edições e novos campos sejam salvos.
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro na API de salvar form:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
