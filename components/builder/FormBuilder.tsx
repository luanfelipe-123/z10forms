"use client";

import { useState } from "react";

import { FieldList } from "./FieldList";

interface BuilderField {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  position: number;
  settings: Record<string, any>;
}

export function FormBuilder() {
  const [fields, setFields] = useState<BuilderField[]>([]);

  function addField(type: string) {
    const field: BuilderField = {
      id: crypto.randomUUID(),

      type,

      label: getDefaultLabel(type),

      name: `campo_${fields.length + 1}`,

      required: false,

      position: fields.length,

      settings: {},
    };

    setFields((current) => [
      ...current,
      field,
    ]);
  }

  function updateField(
    id: string,
    changes: Partial<BuilderField>
  ) {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? {
              ...field,
              ...changes,
            }
          : field
      )
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr_300px] gap-4">

      {/* ELEMENTOS */}
      <aside className="border-r p-4">
        <h2 className="mb-4 font-semibold">
          Elementos
        </h2>

        <FieldList onAdd={addField} />
      </aside>


      {/* PREVIEW */}
      <main className="min-h-[700px] bg-gray-50 p-8">

        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">

          {fields.map((field) => (
            <div
              key={field.id}
              className="mb-6"
            >
              <label className="mb-2 block font-medium">
                {field.label}

                {field.required && (
                  <span className="text-red-500">
                    {" "}*
                  </span>
                )}
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder={field.label}
              />
            </div>
          ))}

        </div>

      </main>


      {/* CONFIGURAÇÃO */}
      <aside className="border-l p-4">

        <h2 className="mb-4 font-semibold">
          Configurações
        </h2>

        <p className="text-sm text-gray-500">
          Selecione um elemento para editar
          suas propriedades.
        </p>

      </aside>

    </div>
  );
}


function getDefaultLabel(type: string) {

  const labels: Record<string, string> = {
    text: "Qual seu nome?",
    email: "Qual seu email?",
    phone: "Qual seu WhatsApp?",
    number: "Digite um número",
    long_text: "Conte mais sobre você",
    select: "Selecione uma opção",
    radio: "Escolha uma opção",
    checkbox: "Selecione as opções",
    date: "Selecione uma data",
    time: "Selecione um horário",
    booking: "Escolha um horário",
  };

  return labels[type] ?? "Nova pergunta";
}
