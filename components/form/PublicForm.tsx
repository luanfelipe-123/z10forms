"use client";

import { useState } from "react";

interface Props {
  form: any;
  fields: any[];
}

export function PublicForm({
  form,
  fields,
}: Props) {

  const [answers, setAnswers] =
    useState<Record<string, any>>({});

  const [step, setStep] = useState(0);

  const steps = form.steps ?? [];

  const currentStep = steps[step];

  const currentFields =
    fields.filter(
      (field) =>
        field.step_id === currentStep?.id
    );

  function updateAnswer(
    fieldId: string,
    value: any
  ) {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value,
    }));
  }

  function next() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  }

  function previous() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function getUtmParams() {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
    };
  }

  async function submit() {
    setLoading(true);
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          values: answers,
          utm: getUtmParams(),
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h1>
        <p className="text-gray-500">
          Suas informações foram recebidas. Em breve entraremos em contato.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      <div className="mx-auto max-w-xl px-6 py-16">

        <div className="mb-10">

          <div className="mb-3 text-sm text-gray-500">
            {step + 1} de {Math.max(1, steps.length)}
          </div>

          <div className="h-1 overflow-hidden rounded bg-gray-100">

            <div
              className="h-full bg-orange-500 transition-all"
              style={{
                width: `${((step + 1) / Math.max(1, steps.length)) * 100}%`,
              }}
            />

          </div>

        </div>


        {currentFields.map((field) => (

          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <FieldRenderer
              field={field}
              value={answers[field.id]}
              onChange={(value: any) =>
                updateAnswer(field.id, value)
              }
            />
          </div>

        ))}


        <div className="mt-10 flex gap-3">

          {step > 0 && (
            <button
              onClick={previous}
              className="rounded-lg border px-6 py-3 font-medium hover:bg-gray-50"
            >
              Voltar
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={next}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 px-6 py-3 text-white font-medium ml-auto"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-lg bg-green-500 hover:bg-green-600 px-6 py-3 text-white font-medium ml-auto disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Finalizar"}
            </button>
          )}

        </div>

      </div>

    </main>
  );
}


function FieldRenderer({
  field,
  value,
  onChange,
}: any) {
  
  const options = field.settings?.options || field.options || [];

  switch (field.type) {
    case "email":
      return (
        <input
          type="email"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={field.placeholder || "seu@email.com"}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={field.placeholder || "(00) 00000-0000"}
        />
      );

    case "long_text":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={field.placeholder}
          rows={4}
        />
      );

    case "radio":
      return (
        <div className="space-y-3">
          {options.map((opt: any) => (
            <label key={opt.value} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name={field.name || field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border p-4 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="" disabled>Selecione uma opção...</option>
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case "checkbox":
      return (
        <div className="space-y-3">
          {options.map((opt: any) => {
            const isChecked = Array.isArray(value) && value.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      onChange([...currentValues, opt.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== opt.value));
                    }
                  }}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    case "booking":
      return (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-bold text-gray-900 mb-1">Integração com Agenda</h3>
          <p className="text-gray-500 text-sm">O componente de Calendário conectará com a disponibilidade real.</p>
        </div>
      );

    default: // "text", "number", etc.
      return (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={field.placeholder}
        />
      );
  }
}
