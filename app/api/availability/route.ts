import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBusySlots, calculateFreeSlots } from "@/lib/google/calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, date } = body;

    if (!formId || !date) {
      return NextResponse.json(
        { error: "formId e date são obrigatórios." },
        { status: 400 }
      );
    }

    /* Valida formato da data */
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Formato de data inválido. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    /* 1. Busca o campo booking do formulário */
    const { data: field } = await supabase
      .from("form_fields")
      .select("id, settings, form_id")
      .eq("form_id", formId)
      .eq("type", "booking")
      .single();

    if (!field) {
      return NextResponse.json(
        { error: "Campo de agendamento não encontrado." },
        { status: 404 }
      );
    }

    /* 2. Busca a integração com Google Calendar do tenant */
    const { data: form } = await supabase
      .from("forms")
      .select("tenant_id")
      .eq("id", formId)
      .single();

    const { data: integration } = await supabase
      .from("google_calendar_integrations")
      .select("access_token, refresh_token, calendar_id")
      .eq("tenant_id", form?.tenant_id)
      .single();

    /* 3. Se não há integração, devolve slots padrão (modo demo) */
    if (!integration) {
      const demoSlots = calculateFreeSlots([], {
        workStart: field.settings?.work_start ?? "09:00",
        workEnd: field.settings?.work_end ?? "18:00",
        durationMinutes: field.settings?.duration_minutes ?? 60,
        intervalMinutes: field.settings?.interval_minutes ?? 0,
      });

      return NextResponse.json({ date, slots: demoSlots });
    }

    /* 4. Busca horários ocupados no Google Calendar */
    const busySlots = await getBusySlots(
      {
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
      },
      integration.calendar_id ?? "primary",
      date
    );

    /* 5. Calcula slots livres */
    const freeSlots = calculateFreeSlots(busySlots, {
      workStart: field.settings?.work_start ?? "09:00",
      workEnd: field.settings?.work_end ?? "18:00",
      durationMinutes: field.settings?.duration_minutes ?? 60,
      intervalMinutes: field.settings?.interval_minutes ?? 0,
    });

    return NextResponse.json({ date, slots: freeSlots });
  } catch (err) {
    console.error("[availability] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao buscar disponibilidade." },
      { status: 500 }
    );
  }
}
