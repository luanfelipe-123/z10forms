"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Rocket, Monitor, Smartphone, Palette, Settings } from "lucide-react";
import { FieldList } from "@/components/builder/FieldList";
import type { FormSettings, FormTheme, FormField } from "@/lib/forms/types";

// Tipos padrão para caso o form venha vazio
const defaultSettings: FormSettings = {
  welcomeScreen: false,
  showProgress: true,
  progressType: "percentage",
  buttonText: "Continuar",
  submitText: "Finalizar",
  successType: "message",
  successMessage: "Obrigado! Suas respostas foram salvas.",
  redirectUrl: null,
};

const defaultTheme: FormTheme = {
  primaryColor: "#ff7300",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  buttonRadius: 8,
  font: "Inter",
};

export function FormBuilderClient({ initialForm }: { initialForm: any }) {
  const [form, setForm] = useState(initialForm);
  const [fields, setFields] = useState<FormField[]>(initialForm.fields || []);
  const [settings, setSettings] = useState<FormSettings>(initialForm.settings || defaultSettings);
  const [theme, setTheme] = useState<FormTheme>(initialForm.theme_json || defaultTheme);
  
  const [activeTab, setActiveTab] = useState<"fields" | "design" | "settings">("fields");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  async function handleSave(status?: "published") {
    const isPub = status === "published";
    if (isPub) setIsPublishing(true);
    else setIsSaving(true);
    
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          settings,
          theme_json: theme,
          fields,
          status: status || form.status,
        }),
      });
      
      if (!res.ok) throw new Error("Erro ao salvar");
      
      if (status) {
        setForm({ ...form, status });
        alert("Formulário publicado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  }

  function handleAddField(type: string) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      form_id: form.id,
      type: type as any,
      name: `campo_${fields.length + 1}`,
      label: `Nova pergunta`,
      required: false,
      position: fields.length,
      settings: {},
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  }

  function handleUpdateField(id: string, updates: Partial<FormField>) {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  }

  return (
    <>
      {/* HEADER */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="font-semibold text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400"
            placeholder="Nome do formulário"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave()}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Rocket size={16} />
            {isPublishing ? "Publicando..." : form.status === "published" ? "Atualizar Publicado" : "Publicar"}
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL - ELEMENTOS */}
        <aside className="w-[280px] border-r bg-white flex flex-col">
          <div className="flex p-2 border-b gap-1 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab("fields")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'fields' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Campos
            </button>
            <button 
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'design' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Design
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Opções
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "fields" && (
              <>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Adicionar Campo</h3>
                <FieldList onAdd={handleAddField} />
              </>
            )}

            {activeTab === "design" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor Principal</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                      className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                      className="flex-1 border rounded-md px-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                  <input 
                    type="color" 
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                  <select 
                    value={theme.font}
                    onChange={(e) => setTheme({...theme, font: e.target.value})}
                    className="w-full border rounded-md px-2 py-1.5 text-sm"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arredondamento dos botões (px)</label>
                  <input 
                    type="range" 
                    min="0" max="24"
                    value={theme.buttonRadius}
                    onChange={(e) => setTheme({...theme, buttonRadius: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.welcomeScreen}
                    onChange={(e) => setSettings({...settings, welcomeScreen: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tela de boas-vindas</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.showProgress}
                    onChange={(e) => setSettings({...settings, showProgress: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Barra de progresso</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do botão (Continuar)</label>
                  <input 
                    type="text" 
                    value={settings.buttonText}
                    onChange={(e) => setSettings({...settings, buttonText: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do botão (Finalizar)</label>
                  <input 
                    type="text" 
                    value={settings.submitText}
                    onChange={(e) => setSettings({...settings, submitText: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Sucesso</label>
                  <textarea 
                    value={settings.successMessage || ""}
                    onChange={(e) => setSettings({...settings, successMessage: e.target.value})}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANEL - PREVIEW */}
        <main className="flex-1 bg-gray-100 overflow-y-auto relative flex flex-col">
          <div className="flex-1 p-8 flex items-start justify-center">
            {/* O próprio Canvas do form */}
            <div 
              className="w-full max-w-2xl rounded-xl shadow-lg border relative transition-all"
              style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.font }}
            >
              {/* Top bar decorativa */}
              <div className="h-2 w-full rounded-t-xl" style={{ backgroundColor: theme.primaryColor }}></div>
              
              <div className="p-8">
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Nenhum campo adicionado ainda.</p>
                    <p className="text-sm">Clique em um elemento na barra lateral.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field) => (
                      <div 
                        key={field.id} 
                        onClick={() => {
                          setSelectedFieldId(field.id);
                          setActiveTab("fields"); // Volta pra tab fields pra mostrar propriedades
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedFieldId === field.id ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:border-gray-200'}`}
                      >
                        <label className="block font-medium mb-2" style={{ color: theme.textColor }}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="w-full border rounded-md p-3 text-gray-400 bg-white">
                          [Input de {field.type}]
                        </div>
                      </div>
                    ))}

                    {fields.length > 0 && (
                      <div className="pt-6 mt-6 border-t flex justify-end">
                        <button 
                          className="px-6 py-2.5 text-white font-medium"
                          style={{ 
                            backgroundColor: theme.primaryColor,
                            borderRadius: `${theme.buttonRadius}px`
                          }}
                        >
                          {settings.submitText}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL - PROPRIEDADES (Só aparece se tiver um campo selecionado e na tab fields) */}
        {activeTab === "fields" && (
          <aside className="w-[300px] border-l bg-white flex flex-col shrink-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Propriedades</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedField ? (
                <div className="space-y-5">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Campo: {selectedField.type}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título da Pergunta</label>
                    <input 
                      type="text" 
                      value={selectedField.label}
                      onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                    <input 
                      type="text" 
                      value={selectedField.placeholder || ""}
                      onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Ajuda</label>
                    <textarea 
                      value={selectedField.description || ""}
                      onChange={(e) => handleUpdateField(selectedField.id, { description: e.target.value })}
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      checked={selectedField.required}
                      onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Resposta obrigatória</span>
                  </label>

                  <div className="pt-6 border-t mt-6">
                    <button 
                      onClick={() => {
                        setFields(fields.filter(f => f.id !== selectedField.id));
                        setSelectedFieldId(null);
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Excluir Campo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 mt-10">
                  Selecione um elemento no preview para editar suas propriedades.
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
