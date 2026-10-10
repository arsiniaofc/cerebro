import React, { useState } from 'react';
import {
  History,
  Save,
  RotateCcw,
  GitCompare,
  TrendingUp,
  CheckCircle2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { CheckpointRecord, BrainTelemetry } from '../../types/brain';

interface ExperimentsTabProps {
  checkpoints: CheckpointRecord[];
  onSaveCheckpoint: (name: string, notes: string) => void;
  onRollback: (checkpointId: string) => void;
  telemetry: BrainTelemetry;
}

export const ExperimentsTab: React.FC<ExperimentsTabProps> = ({
  checkpoints,
  onSaveCheckpoint,
  onRollback,
  telemetry
}) => {
  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCreate = () => {
    if (!versionName.trim()) return;
    onSaveCheckpoint(versionName.trim(), versionNotes.trim());
    setVersionName('');
    setVersionNotes('');
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const chkA = checkpoints.find(c => c.id === selectedForCompare[0]);
  const chkB = checkpoints.find(c => c.id === selectedForCompare[1]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Experimentos, Checkpoints e Avaliação de Regressões</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de versão de modelos treináveis, testes de regressão e reversão segura (rollback) de parâmetros.
          </p>
        </div>
      </div>

      {/* Formulário para Criar Novo Checkpoint */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Save className="w-4 h-4 text-emerald-400" />
          <span>Salvar Checkpoint do Estado Atual</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="Nome da Versão (ex: v1.2-Treino-RL-Grade)"
            className="px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 w-full sm:w-1/3 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={versionNotes}
            onChange={(e) => setVersionNotes(e.target.value)}
            placeholder="Notas do experimento (hiperparâmetros, observações)..."
            className="px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 w-full sm:flex-1 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors shrink-0 shadow-sm shadow-cyan-900/30"
          >
            Gravar Checkpoint
          </button>
        </div>
      </div>

      {/* Tabela de Comparação Lado a Lado se 2 estiverem selecionados */}
      {chkA && chkB && (
        <div className="p-5 rounded-lg bg-slate-900/80 border border-cyan-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span>Comparação Direta: {chkA.version_name} vs {chkB.version_name}</span>
            </h4>
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Fechar Comparação
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">{chkA.version_name}</span>
              <div>Recompensa Média: {chkA.metrics.average_reward_recent}</div>
              <div>Acurácia: {chkA.metrics.accuracy ? `${(chkA.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}</div>
            </div>

            <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">{chkB.version_name}</span>
              <div>Recompensa Média: {chkB.metrics.average_reward_recent}</div>
              <div>Acurácia: {chkB.metrics.accuracy ? `${(chkB.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Checkpoints */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Histórico de Checkpoints Salvos
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {checkpoints.length} versões registradas
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {checkpoints.map((chk) => {
            const isComparing = selectedForCompare.includes(chk.id);
            return (
              <div
                key={chk.id}
                className="p-3.5 rounded bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{chk.version_name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                      {chk.model_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {chk.notes || 'Sem observações adicionais.'}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="font-mono text-right text-[11px] text-slate-400">
                    <div>Recompensa: <span className="text-emerald-400 font-bold">{chk.metrics.average_reward_recent}</span></div>
                    <div>Q-Estados: {chk.metrics.q_states_count || 12}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleCompare(chk.id)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                        isComparing
                          ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isComparing ? 'Comparando' : 'Comparar'}
                    </button>
                    <button
                      onClick={() => onRollback(chk.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 transition-colors flex items-center gap-1"
                      title="Reverter estado do agente para esta versão"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reverter</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
