import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Sliders,
  Sparkles,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { BrainTelemetry } from '../../types/brain';

interface NeurochemistryTabProps {
  telemetry: BrainTelemetry;
  onStimulate: (event: string, intensity?: number) => void;
}

export const NeurochemistryTab: React.FC<NeurochemistryTabProps> = ({
  telemetry,
  onStimulate
}) => {
  const [selectedChem, setSelectedChem] = useState<string>('dopamine');
  const neuro = telemetry.neurochemistry;
  const current = neuro[selectedChem];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Subsistema Neurochemistry: 8 Variáveis Neuroquímicas Computacionais</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulação contínua por equações diferenciais discretas com modulação causal sobre exploração, foco e aprendizagem.
          </p>
        </div>

        {/* Botões de Estimulação Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onStimulate('reward_positive', 1.2)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-colors"
          >
            + Recompensa (DA ↑)
          </button>
          <button
            onClick={() => onStimulate('stress', 1.2)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-rose-950/70 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors"
          >
            + Estresse (CORT ↑)
          </button>
          <button
            onClick={() => onStimulate('novelty', 1.2)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-amber-950/70 border border-amber-800 text-amber-300 hover:bg-amber-900 transition-colors"
          >
            + Novidade (NA ↑, ACh ↑)
          </button>
          <button
            onClick={() => onStimulate('inhibition', 1.2)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-purple-950/70 border border-purple-800 text-purple-300 hover:bg-purple-900 transition-colors"
          >
            + Inibição (GABA ↑)
          </button>
        </div>
      </div>

      {/* Grid de 8 Cartões Neuroquímicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(neuro).map(([key, item]) => {
          const isSelected = selectedChem === key;
          const delta = item.value - item.baseline;

          return (
            <div
              key={key}
              onClick={() => setSelectedChem(key)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500/80 shadow-md shadow-amber-950/30'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="font-mono text-amber-400 font-bold">[{item.symbol}]</span>
                  <span>{item.name}</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-100">
                  {item.value.toFixed(3)}
                </span>
              </div>

              {/* Barra de Progresso com Marcador de Baseline */}
              <div className="relative w-full h-2 bg-slate-950 rounded-full mt-3 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, item.value * 100)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-300"
                  style={{ left: `${item.baseline * 100}%` }}
                  title={`Baseline: ${item.baseline}`}
                />
              </div>

              {/* Rodapé com Delta */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>Base: {item.baseline.toFixed(2)}</span>
                <span className={`flex items-center ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de Inspeção Detalhada da Substância Selecionada */}
      {current && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Inspeção Matemática: {current.name} ({current.symbol})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Limites: [{current.min.toFixed(1)}, {current.max.toFixed(1)}]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Esquerda: Função no Agente */}
            <div className="p-4 rounded bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-medium">Papel Computacional:</span>
              <p className="text-slate-200 leading-relaxed">
                {current.description}
              </p>
              <div className="pt-2 text-[11px] text-slate-400">
                Modulação: atua sobre a taxa de aprendizado, ganho sensorial e limiares de decisão de ação.
              </div>
            </div>

            {/* Direita: Equação e Estabilidade */}
            <div className="p-4 rounded bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-slate-400 font-medium">Equação de Atualização Numérica:</span>
              <div className="p-2 rounded bg-[#07090E] border border-slate-800 font-mono text-amber-300 text-[11px]">
                dc_i/dt = P_i - k_i · (c_i - baseline) + ∑ w_ji · c_j
              </div>
              <p className="text-[11px] text-slate-500">
                Integração por Euler discreto com taxa k_i e contenção estrita nos limites fisiológicos simulados.
              </p>
            </div>
          </div>

          {/* Gráfico Sparkline de Histórico */}
          <div className="p-4 bg-[#07090E] rounded border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-2 font-mono flex items-center justify-between">
              <span>Histórico Temporal Recente (60 amostras)</span>
              <span className="text-amber-400 font-bold">{current.value.toFixed(4)}</span>
            </div>

            <div className="h-20 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 80">
                <line x1="0" y1={80 - current.baseline * 80} x2="600" y2={80 - current.baseline * 80} stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
                <path
                  d={current.history.map((val, idx) => {
                    const x = (idx / Math.max(1, current.history.length - 1)) * 600;
                    const y = 80 - Math.min(1.0, Math.max(0.0, val)) * 75;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 font-mono pt-1">
            Nota de Transparência: Variáveis puramente computacionais e algorítmicas, sem correspondência biológica real.
          </div>
        </div>
      )}
    </div>
  );
};
