"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/signup?error=registration_failed");
  }

  // Sem sessão = o Supabase exigiu confirmação de e-mail. Sem esse check,
  // o redirect para /dashboard jogava o usuário de volta para /login.
  if (!signUpData.session) {
    redirect("/signup?message=check_email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
