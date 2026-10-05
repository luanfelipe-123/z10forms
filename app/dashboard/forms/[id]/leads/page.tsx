import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormLeadsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Busca os dados do form
  const { data: form } = await supabase
    .from("forms")
    .select("id, title, slug")
    .eq("id", id)
    .single();

  if (!form) notFound();

  // 2. Busca os campos do form para saber quais colunas mostrar
  const { data: fields } = await supabase
    .from("form_fields")
    .select("id, label, type")
    .eq("form_id", id)
    .order("position");

  const formFields = fields || [];

  // 3. Busca as submissões recentes (limite de 100 no MVP)
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("form_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  const subList = submissions || [];

  // 4. Busca os valores de cada submissão (se houver alguma)
  let submissionValues: any[] = [];
  if (subList.length > 0) {
    const { data: values } = await supabase
      .from("submission_values")
      .select("submission_id, field_id, value_text, value_json")
      .in(
        "submission_id",
        subList.map((s) => s.id)
      );
    submissionValues = values || [];
  }

  // 5. Agrupa os valores para montar a tabela
  const leads = subList.map((sub) => {
    const vals = submissionValues.filter((v) => v.submission_id === sub.id);
    const answers: Record<string, any> = {};
    
    vals.forEach((v) => {
      answers[v.field_id] = v.value_text ?? v.value_json;
    });

    return {
      ...sub,
      answers,
    };
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Leads: {form.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={16} />
            Ver formulário
          </a>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </header>

      {/* TABLE SECTION */}
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {leads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>Nenhuma resposta recebida ainda.</p>
              <p className="text-sm mt-1">Divulgue o link do seu formulário para capturar leads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Data</th>
                    {formFields.map((field) => (
                      <th key={field.id} className="px-6 py-4 font-semibold">
                        {field.label}
                      </th>
                    ))}
                    <th className="px-6 py-4 font-semibold">Origem (UTM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {formFields.map((field) => {
                        const val = lead.answers[field.id];
                        // Formatação rápida para visualização
                        const displayVal = Array.isArray(val) 
                          ? val.join(", ") 
                          : (typeof val === 'object' && val !== null) 
                            ? JSON.stringify(val) 
                            : val;

                        return (
                          <td key={field.id} className="px-6 py-4 max-w-[200px] truncate" title={displayVal}>
                            {displayVal || "-"}
                          </td>
                        );
                      })}

                      <td className="px-6 py-4">
                        {lead.utm_source ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.utm_source} {lead.utm_medium ? `/ ${lead.utm_medium}` : ""}
                          </span>
                        ) : (
                          <span className="text-gray-400">Direto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
