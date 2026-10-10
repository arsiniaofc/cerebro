import React from 'react';
import {
  Gamepad2,
  Play,
  Pause,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target,
  AlertTriangle,
  Zap,
  Sliders,
  Sparkles
} from 'lucide-react';
import { BrainTelemetry } from '../../types/brain';

interface Environment2DTabProps {
  telemetry: BrainTelemetry;
  onManualAction: (action: string) => void;
  onResetEnv: () => void;
  onToggleAutonomous: () => void;
  isAutonomous: boolean;
  speedMs: number;
  onSpeedChange: (speed: number) => void;
}

export const Environment2DTab: React.FC<Environment2DTabProps> = ({
  telemetry,
  onManualAction,
  onResetEnv,
  onToggleAutonomous,
  isAutonomous,
  speedMs,
  onSpeedChange
}) => {
  const env = telemetry.env_state;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Ambiente 2D */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>Ambiente 2D de Teste: Gridworld Foraging & Obstacle Avoidance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Espaço de estados observável, ações ortogonais e aprendizagem por reforço com retorno descontado G_t.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutonomous}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1.5 ${
              isAutonomous
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400 hover:bg-emerald-900'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAutonomous ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutonomous ? 'Modo Autônomo Ativo' : 'Ativar Modo Autônomo'}</span>
          </button>
          <button
            onClick={onResetEnv}
            className="px-3 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Reiniciar Episódio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Grade Interativa à esquerda, Métricas RL à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade 10x10 com Visualizador */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 text-xs">
            <span className="text-slate-400 font-mono">
              Grade 10x10 · Passo #{env.step} · Pontuação: <span className="text-emerald-400 font-bold">{env.score}</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Target className="w-3.5 h-3.5" />
                <span>{telemetry.env_state.orbs.length} Esferas Douradas</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{telemetry.env_state.hazards.length} Obstáculos</span>
              </span>
            </div>
          </div>

          {/* Canvas da Grade */}
          <div className="w-full max-w-[440px] aspect-square bg-[#07090E] rounded border border-slate-800 p-2 grid grid-cols-10 grid-rows-10 gap-1 select-none">
            {Array.from({ length: 10 }).map((_, y) =>
              Array.from({ length: 10 }).map((_, x) => {
                const isAgent = env.agent_pos[0] === x && env.agent_pos[1] === y;
                const isOrb = env.orbs.some(o => o[0] === x && o[1] === y);
                const isHazard = env.hazards.some(h => h[0] === x && h[1] === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`rounded-sm flex items-center justify-center transition-all duration-150 border ${
                      isAgent
                        ? 'bg-cyan-500 border-cyan-300 shadow-md shadow-cyan-500/40'
                        : isOrb
                        ? 'bg-amber-500/20 border-amber-500/60'
                        : isHazard
                        ? 'bg-rose-950/60 border-rose-800/80'
                        : 'bg-slate-950/40 border-slate-900/40 hover:bg-slate-900/20'
                    }`}
                  >
                    {isAgent && (
                      <span className="text-xs font-bold text-slate-950 font-mono">Ψ</span>
                    )}
                    {isOrb && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/80" />
                    )}
                    {isHazard && (
                      <span className="text-[10px] font-bold text-rose-400 select-none">✕</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Controles Manuais por Teclas */}
          <div className="mt-5 flex flex-col items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono mb-1">Controle Manual Direto:</span>
            <button
              onClick={() => onManualAction('cima')}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Mover para Cima"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onManualAction('esquerda')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Mover para Esquerda"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onManualAction('baixo')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Mover para Baixo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onManualAction('direita')}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Mover para Direita"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Métricas de Reinforcement Learning */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Métricas de Aprendizagem por Reforço</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400">Função de Retorno Descontado</div>
              <div className="font-mono text-cyan-300 mt-1 font-semibold">
                G_t = ∑ γ^k · r_(t+k)
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Fator de desconto γ = {telemetry.rl_metrics.gamma} (prioriza metas imediatas vs longo prazo)
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400">Taxa de Exploração (ε-Greedy)</div>
              <div className="font-mono text-amber-400 mt-1 font-semibold text-base">
                ε = {(telemetry.rl_metrics.epsilon * (telemetry.neurochemistry.noradrenaline.value * 1.5)).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Modulada pela Noradrenalina ({telemetry.neurochemistry.noradrenaline.value.toFixed(2)}) e Serotonina ({telemetry.neurochemistry.serotonin.value.toFixed(2)})
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400">Tamanho da Memória de Q-Valores</div>
              <div className="font-mono text-slate-200 mt-1 font-semibold text-base">
                {telemetry.rl_metrics.q_states_count} Estados Aprendidos
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Atualização atômica de Bellman com TD-error direcionado
              </div>
            </div>

            {/* Controle de Velocidade */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span>Velocidade de Simulação:</span>
                <span className="font-mono text-cyan-400">{speedMs} ms / passo</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={speedMs}
                onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
