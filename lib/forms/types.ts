export type FieldType =
  | "text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "currency"
  | "date"
  | "time"
  | "select"
  | "radio"
  | "checkbox"
  | "url"
  | "hidden"
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "booking";

export interface FormSettings {
  welcomeScreen: boolean;
  showProgress: boolean;
  progressType: "percentage" | "steps" | "hidden";
  buttonText: string;
  submitText: string;
  successType: "message" | "redirect";
  successMessage?: string | null;
  redirectUrl?: string | null;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonRadius: number;
  font: string;
}

export interface Form {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: "draft" | "published" | "archived";
  settings: FormSettings;
  theme_json: FormTheme;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  step_id?: string | null;

  type: FieldType;

  name: string;
  label: string;

  description?: string | null;
  placeholder?: string | null;

  required: boolean;

  position: number;

  settings: Record<string, any>;
}

export interface FieldOption {
  id: string;
  field_id: string;

  label: string;
  value: string;

  position: number;
}

export interface FormStep {
  id: string;
  form_id: string;

  title?: string | null;
  description?: string | null;

  position: number;

  settings: Record<string, any>;
}
