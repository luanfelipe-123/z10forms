"use client";

import {
  Type,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  Calendar,
  Clock,
  CalendarDays,
  AlignLeft,
} from "lucide-react";

const fields = [
  {
    type: "text",
    label: "Texto",
    icon: Type,
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
  },
  {
    type: "phone",
    label: "WhatsApp",
    icon: Phone,
  },
  {
    type: "number",
    label: "Número",
    icon: Hash,
  },
  {
    type: "long_text",
    label: "Texto longo",
    icon: AlignLeft,
  },
  {
    type: "select",
    label: "Lista",
    icon: List,
  },
  {
    type: "radio",
    label: "Múltipla escolha",
    icon: List,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
  },
  {
    type: "date",
    label: "Data",
    icon: Calendar,
  },
  {
    type: "time",
    label: "Hora",
    icon: Clock,
  },
  {
    type: "booking",
    label: "Agendamento",
    icon: CalendarDays,
  },
];

interface Props {
  onAdd: (type: string) => void;
}

export function FieldList({ onAdd }: Props) {
  return (
    <div className="space-y-2">
      {fields.map((field) => {
        const Icon = field.icon;

        return (
          <button
            key={field.type}
            type="button"
            onClick={() => onAdd(field.type)}
            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-gray-50"
          >
            <Icon size={18} />

            <span className="text-sm font-medium">
              {field.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
