"use client";

import { useState } from "react";

interface Slot {
  start: string;
  end: string;
}

interface Props {
  formId: string;
  value: { date?: string; slot?: Slot } | null;
  onChange: (value: { date: string; slot: Slot }) => void;
}

export function BookingField({ formId, value, onChange }: Props) {
  const [selectedDate, setSelectedDate] = useState(value?.date ?? "");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    value?.slot ?? null
  );
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Ao escolher uma data, busca os horários disponíveis              */
  /* ---------------------------------------------------------------- */

  async function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);

    if (!date) return;

    setLoadingSlots(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, date }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao buscar horários.");
        return;
      }

      setSlots(data.slots ?? []);

      if (data.slots.length === 0) {
        setError("Nenhum horário disponível para este dia.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingSlots(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Ao escolher um slot, notifica o formulário pai                   */
  /* ---------------------------------------------------------------- */

  function handleSlotSelect(slot: Slot) {
    setSelectedSlot(slot);
    onChange({ date: selectedDate, slot });
  }

  /* ---------------------------------------------------------------- */
  /* Data mínima = hoje                                               */
  /* ---------------------------------------------------------------- */

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">

      {/* Seleção de data */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-600">
          Escolha uma data
        </label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading */}
      {loadingSlots && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Buscando horários disponíveis…
        </div>
      )}

      {/* Erro */}
      {error && !loadingSlots && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Grade de slots */}
      {slots.length > 0 && !loadingSlots && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Horários disponíveis
          </label>

          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.start === slot.start &&
                selectedSlot?.end === slot.end;

              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className={`rounded-lg border p-2.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {slot.start}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmação do horário escolhido */}
      {selectedSlot && selectedDate && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✅ <strong>Horário selecionado:</strong>{" "}
          {formatDate(selectedDate)} às {selectedSlot.start}
          {" "}–{" "}{selectedSlot.end}
        </div>
      )}

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helper                                                               */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
