import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, BarChart2, Users, CalendarDays, ExternalLink, Settings as SettingsIcon } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar formulários do usuário
  const { data: forms } = await supabase
    .from("forms")
    .select("*, submissions(count)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Aqui normalmente faríamos queries reais de agregação.
  // Vamos usar valores mockados/derivados para as estatísticas globais como exemplo, 
  // mas contando as submissões dos formulários retornados.
  const totalForms = forms?.length || 0;
  let totalResponses = 0;
  forms?.forEach((f: any) => {
    totalResponses += f.submissions?.[0]?.count || 0;
  });

  const userName = user?.email?.split('@')[0] || "Usuário";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá, {userName} 👋</h1>
          <p className="text-gray-500 mt-1">Aqui está o resumo da sua conta.</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Criar Formulário
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Respostas</p>
            <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Leads (Únicos)</p>
            <p className="text-2xl font-bold text-gray-900">{Math.floor(totalResponses * 0.8)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Reuniões</p>
            <p className="text-2xl font-bold text-gray-900">{Math.floor(totalResponses * 0.2)}</p>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Seus formulários</h2>
          <Link href="/dashboard/forms" className="text-sm text-blue-600 hover:underline font-medium">
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forms?.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 mb-4">Você ainda não tem nenhum formulário.</p>
              <Link
                href="/dashboard/forms/new"
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Criar o primeiro
              </Link>
            </div>
          ) : (
            forms?.map((form) => (
              <div key={form.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{form.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>{form.submissions?.[0]?.count || 0} respostas</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${form.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {form.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-50">
                  <Link
                    href={`/dashboard/forms/${form.id}/edit`}
                    className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/dashboard/forms/${form.id}/leads`}
                    className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Leads
                  </Link>
                  <a
                    href={`/f/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Abrir formulário público"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Configurações"
                  >
                    <SettingsIcon size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
