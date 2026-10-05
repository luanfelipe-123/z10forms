"use client";

import { useState } from "react";
import type { FormField, FormStep } from "@/lib/forms/types";

/* ------------------------------------------------------------------ */
/* Tipos locais                                                          */
/* ------------------------------------------------------------------ */

export interface PublicForm {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: string;
  steps: FormStep[];
  fields: FormField[];
  settings: Record<string, any>;
}

interface Props {
  form: PublicForm;
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */

export function PublicFormRenderer({ form }: Props) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasSteps = form.steps.length > 0;

  /* Campos do step atual (ou todos, se não houver steps) */
  const currentStepId = form.steps[currentStep]?.id ?? null;

  const visibleFields = hasSteps
    ? form.fields.filter((f) => f.step_id === currentStepId)
    : form.fields;

  /* ---------------------------------------------------------------- */
  /* Handlers                                                           */
  /* ---------------------------------------------------------------- */

  function handleChange(fieldId: string, value: any) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleNext() {
    setCurrentStep((s) => Math.min(s + 1, form.steps.length - 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch(`/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          values,
          utm: getUtmParams(),
        }),
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Tela de obrigado                                                   */
  /* ---------------------------------------------------------------- */

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold">Obrigado!</h2>
          <p className="text-gray-500">
            Suas respostas foram enviadas com sucesso.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render principal                                                   */
  /* ---------------------------------------------------------------- */

  const isLastStep = !hasSteps || currentStep === form.steps.length - 1;

  return (
    <div className="flex min-h-screen items-start justify-center p-8 pt-16">
      <div className="w-full max-w-xl">

        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-gray-500">{form.description}</p>
          )}
        </div>

        {/* Indicador de steps */}
        {hasSteps && form.steps.length > 1 && (
          <div className="mb-6 flex gap-2">
            {form.steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Card do formulário */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">

          {/* Título do step */}
          {hasSteps && form.steps[currentStep]?.title && (
            <h2 className="mb-6 text-xl font-semibold">
              {form.steps[currentStep].title}
            </h2>
          )}

          {/* Campos */}
          <div className="space-y-6">
            {visibleFields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(val) => handleChange(field.id, val)}
              />
            ))}
          </div>

          {/* Navegação */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {hasSteps && currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Voltar
              </button>
            ) : (
              <span />
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Próximo
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Renderizador de campo individual                                     */
/* ------------------------------------------------------------------ */

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const base =
    "w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  switch (field.type) {
    case "long_text":
      return (
        <Field field={field}>
          <textarea
            rows={4}
            className={base}
            placeholder={field.placeholder ?? ""}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "select":
      return (
        <Field field={field}>
          <select
            className={base}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Selecione…</option>
            {(field.settings?.options ?? []).map(
              (opt: { label: string; value: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
          </select>
        </Field>
      );

    case "radio":
      return (
        <Field field={field}>
          <div className="space-y-2">
            {(field.settings?.options ?? []).map(
              (opt: { label: string; value: string }) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              )
            )}
          </div>
        </Field>
      );

    case "checkbox":
      return (
        <Field field={field}>
          <div className="space-y-2">
            {(field.settings?.options ?? []).map(
              (opt: { label: string; value: string }) => {
                const checked = Array.isArray(value)
                  ? value.includes(opt.value)
                  : false;
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? (value as string[]).filter((v) => v !== opt.value)
                          : [...(Array.isArray(value) ? value : []), opt.value];
                        onChange(next);
                      }}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              }
            )}
          </div>
        </Field>
      );

    case "date":
      return (
        <Field field={field}>
          <input
            type="date"
            className={base}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "time":
      return (
        <Field field={field}>
          <input
            type="time"
            className={base}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "email":
      return (
        <Field field={field}>
          <input
            type="email"
            className={base}
            placeholder={field.placeholder ?? "seu@email.com"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "phone":
      return (
        <Field field={field}>
          <input
            type="tel"
            className={base}
            placeholder={field.placeholder ?? "(00) 00000-0000"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "number":
      return (
        <Field field={field}>
          <input
            type="number"
            className={base}
            placeholder={field.placeholder ?? "0"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "url":
      return (
        <Field field={field}>
          <input
            type="url"
            className={base}
            placeholder={field.placeholder ?? "https://"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "booking":
      return (
        <Field field={field}>
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            📅 Bloco de agendamento (em breve)
          </div>
        </Field>
      );

    /* text, currency, hidden e fallback */
    default:
      return (
        <Field field={field}>
          <input
            type="text"
            className={base}
            placeholder={field.placeholder ?? ""}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Wrapper de campo (label + asterisco + descrição)                    */
/* ------------------------------------------------------------------ */

function Field({
  field,
  children,
}: {
  field: FormField;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.description && (
        <p className="mb-2 text-xs text-gray-400">{field.description}</p>
      )}

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helper: captura UTMs da URL                                         */
/* ------------------------------------------------------------------ */

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  return Object.fromEntries(
    keys.flatMap((k) => {
      const v = params.get(k);
      return v ? [[k, v]] : [];
    })
  );
}
