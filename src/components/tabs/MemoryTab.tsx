import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Trash2,
  Brain,
  History,
  BookOpen,
  Cog,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import {
  WorkingMemoryItem,
  EpisodicMemoryItem,
  SemanticConcept,
  ProceduralSkill
} from '../../types/brain';

interface MemoryTabProps {
  workingMemory: WorkingMemoryItem[];
  episodicMemory: EpisodicMemoryItem[];
  semanticMemory: SemanticConcept[];
  proceduralMemory: ProceduralSkill[];
  onAddSemanticConcept: (concept: string, definition: string) => void;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({
  workingMemory,
  episodicMemory,
  semanticMemory,
  proceduralMemory,
  onAddSemanticConcept
}) => {
  const [activeTier, setActiveTier] = useState<'working' | 'episodic' | 'semantic' | 'procedural'>('episodic');
  const [searchQuery, setSearchQuery] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newDefinition, setNewDefinition] = useState('');

  // Exportar memórias para JSON
  const handleExportJSON = () => {
    const payload = {
      working: workingMemory,
      episodic: episodicMemory,
      semantic: semanticMemory,
      procedural: proceduralMemory,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerebro_virtual_memorias_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSemantic = semanticMemory.filter(c =>
    c.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEpisodic = episodicMemory.filter(e =>
    e.task_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.action_taken.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.observation_summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Memória Hierárquica em 4 Camadas Persistentes (SQLite & Local)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organização cognitiva por eventos, tarefas, regras conceituais e rotinas consolidadas.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-3.5 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Memórias (JSON)</span>
        </button>
      </div>

      {/* Seletor de Camadas de Memória */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'working', label: '1. Trabalho (Miller 7±2)', count: `${workingMemory.length}/7 itens`, icon: Brain, color: 'cyan' },
          { id: 'episodic', label: '2. Episódica (Experiências)', count: `${episodicMemory.length} registros`, icon: History, color: 'emerald' },
          { id: 'semantic', label: '3. Semântica (Conceitos)', count: `${semanticMemory.length} regras`, icon: BookOpen, color: 'amber' },
          { id: 'procedural', label: '4. Procedural (Habilidades)', count: `${proceduralMemory.length} rotinas`, icon: Cog, color: 'purple' }
        ].map(t => {
          const isActive = activeTier === t.id;
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => setActiveTier(t.id as any)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500 shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                  {t.label}
                </span>
              </div>
              <span className="block text-[11px] font-mono text-slate-500 mt-1">{t.count}</span>
            </div>
          );
        })}
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por conceitos, ações, episódios ou contexto..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Conteúdo Dinâmico por Camada */}
      {activeTier === 'working' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Memória de Trabalho Imediata (Miller 7±2 slots)
            </h3>
            <span className="text-xs font-mono text-slate-500">Capacidade Ativa: {workingMemory.length} / 7</span>
          </div>

          <div className="space-y-2 text-xs">
            {workingMemory.map((item, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono text-[10px] uppercase">
                    {item.type}
                  </span>
                  <span className="text-slate-200">{item.content}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  Importância: {(item.importance * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTier === 'episodic' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Registros Episódicos Recentes (Experiências Vivenciadas)
            </h3>
            <span className="text-xs font-mono text-slate-500">{filteredEpisodic.length} itens encontrados</span>
          </div>

          <div className="space-y-2 text-xs max-h-[420px] overflow-y-auto pr-1">
            {filteredEpisodic.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Nenhum episódio registrado ainda.</div>
            ) : (
              filteredEpisodic.map((ep) => (
                <div key={ep.id} className="p-3 rounded bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{ep.id}</span>
                      <span className="font-semibold text-slate-200">{ep.task_name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        Ação: {ep.action_taken}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {ep.observation_summary}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                    <span className={ep.reward >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      Recompensa: {ep.reward > 0 ? `+${ep.reward}` : ep.reward}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      DA: {ep.neuro_state?.dopamine?.toFixed(2) || '0.35'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTier === 'semantic' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Memória Semântica: Conceitos, Fatos e Regras Aprendidas
            </h3>
            <span className="text-xs font-mono text-slate-500">{filteredSemantic.length} regras</span>
          </div>

          {/* Adicionar Novo Conceito */}
          <div className="p-3 rounded bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newConcept}
              onChange={(e) => setNewConcept(e.target.value)}
              placeholder="Nome do Conceito (ex: Parede_Sul)"
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 w-full sm:w-1/3"
            />
            <input
              type="text"
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Definição ou regra aprendida..."
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 w-full sm:flex-1"
            />
            <button
              onClick={() => {
                if (newConcept && newDefinition) {
                  onAddSemanticConcept(newConcept, newDefinition);
                  setNewConcept('');
                  setNewDefinition('');
                }
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 whitespace-nowrap transition-colors"
            >
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {filteredSemantic.map((c) => (
              <div key={c.id} className="p-3.5 rounded bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300 font-mono">{c.concept}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Confiança: {(c.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-slate-300 text-xs">{c.definition}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                  <span>Origem: {c.source}</span>
                  <span>·</span>
                  <span>Tags: {c.associations.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTier === 'procedural' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Memória Procedural: Habilidades e Rotinas Motoras Consolidadas
            </h3>
            <span className="text-xs font-mono text-slate-500">{proceduralMemory.length} rotinas ativas</span>
          </div>

          <div className="space-y-2 text-xs">
            {proceduralMemory.map((p) => (
              <div key={p.id} className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-100">{p.skill_name}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gatilho: <span className="font-mono text-amber-300">{p.condition_trigger}</span> · Sequência: [{p.action_sequence.join(' → ')}]
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold">{(p.success_rate * 100).toFixed(0)}% Sucesso</span>
                  <div className="text-[10px] text-slate-500">{p.total_executions} execuções</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
