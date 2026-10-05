import { createForm } from "./actions";

export default function NewFormPage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Formulário</h1>
      
      <form action={createForm} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="title">
            Nome do Formulário
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            autoFocus
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ex: Captação de Leads - Consórcio"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Criar e Editar
          </button>
        </div>
      </form>
    </div>
  );
}
