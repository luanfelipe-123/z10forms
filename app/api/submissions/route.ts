import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { form_id, values, utm } = body;

    if (!form_id || !values) {
      return NextResponse.json(
        { error: "form_id e values são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /* 1. Verificar se o formulário existe e está publicado */
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, status, tenant_id")
      .eq("id", form_id)
      .eq("status", "published")
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: "Formulário não encontrado ou não publicado." },
        { status: 404 }
      );
    }

    /* 2. Criar o registro de submissão */
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        form_id: form.id,
        tenant_id: form.tenant_id,
        utm_source: utm?.utm_source ?? null,
        utm_medium: utm?.utm_medium ?? null,
        utm_campaign: utm?.utm_campaign ?? null,
        utm_term: utm?.utm_term ?? null,
        utm_content: utm?.utm_content ?? null,
        metadata: {
          user_agent: request.headers.get("user-agent"),
          ip: request.headers.get("x-forwarded-for") ?? null,
        },
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      console.error("[submissions] Erro ao criar submissão:", submissionError);
      return NextResponse.json(
        { error: "Erro ao salvar submissão." },
        { status: 500 }
      );
    }

    /* 3. Salvar os valores de cada campo */
    const fieldEntries = Object.entries(values as Record<string, any>);

    if (fieldEntries.length > 0) {
      const submissionValues = fieldEntries.map(([field_id, value]) => ({
        submission_id: submission.id,
        field_id,
        value_text: typeof value === "string" ? value : null,
        value_json: typeof value !== "string" ? value : null,
      }));

      const { error: valuesError } = await supabase
        .from("submission_values")
        .insert(submissionValues);

      if (valuesError) {
        console.error("[submissions] Erro ao salvar valores:", valuesError);
        /* Não falha a requisição — submissão já foi criada */
      }
    }

    /* 4. Disparar webhooks (fire-and-forget) */
    triggerWebhooks(form.id, submission.id, values, utm).catch((err) =>
      console.error("[submissions] Erro ao disparar webhooks:", err)
    );

    return NextResponse.json(
      { success: true, submission_id: submission.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[submissions] Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/* Disparo de webhooks (assíncrono, não bloqueia a resposta)           */
/* ------------------------------------------------------------------ */

async function triggerWebhooks(
  formId: string,
  submissionId: string,
  values: Record<string, any>,
  utm: Record<string, string> | null
) {
  const supabase = await createClient();

  const { data: webhooks } = await supabase
    .from("webhooks")
    .select("url, method, headers_json")
    .eq("form_id", formId)
    .eq("active", true);

  if (!webhooks || webhooks.length === 0) return;

  const { data: form } = await supabase
    .from("forms")
    .select("title")
    .eq("id", formId)
    .single();

  const { data: fields } = await supabase
    .from("form_fields")
    .select("id, type, name, label")
    .eq("form_id", formId);

  const formName = form?.title || "Formulário";

  let extractedName = "";
  let extractedEmail = "";
  let extractedPhone = "";
  const answers: Record<string, any> = {};

  if (fields) {
    for (const field of fields) {
      const val = values[field.id];
      if (val !== undefined) {
        const key = field.name || field.label;
        answers[key] = val;

        if (field.type === "email" && !extractedEmail) extractedEmail = val;
        if (field.type === "phone" && !extractedPhone) extractedPhone = val;
        if (field.type === "text" && key.toLowerCase().includes("nome") && !extractedName) {
          extractedName = val;
        }
      }
    }
  }

  const payload = {
    event: "submission.created",
    form: {
      id: formId,
      name: formName,
    },
    submission: {
      id: submissionId,
      name: extractedName,
      email: extractedEmail,
      phone: extractedPhone,
    },
    answers,
    utm: utm ?? {},
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled(
    webhooks.map((wh) =>
      fetch(wh.url, {
        method: wh.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          ...(wh.headers_json ?? {}),
        },
        body: JSON.stringify(payload),
      })
    )
  );
}
