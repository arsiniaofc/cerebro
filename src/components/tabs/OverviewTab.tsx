import React from 'react';
import {
  Brain,
  Activity,
  Cpu,
  Shield,
  Zap,
  Target,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Terminal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { BrainTelemetry, OperatingMode } from '../../types/brain';

interface OverviewTabProps {
  telemetry: BrainTelemetry;
  onSelectTab: (tab: string) => void;
  onSetMode: (mode: OperatingMode) => void;
  onStimulate: (event: string) => void;
  onStepManual: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  telemetry,
  onSelectTab,
  onSetMode,
  onStimulate,
  onStepManual
}) => {
  const getAgentStatusLabel = () => {
    if (telemetry.emergency_stop) return { text: 'Parada de Emergência Ativa', color: 'text-rose-400 bg-rose-950/40 border-rose-800' };
    if (telemetry.mode === 'observation') return { text: 'Observando Telemetria (Sem Ação)', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800' };
    if (telemetry.mode === 'simulation') return { text: 'Simulando Decisões (Offline)', color: 'text-amber-400 bg-amber-950/40 border-amber-800' };
    if (telemetry.mode === 'controlled_environment') return { text: 'Executando no Ambiente 2D', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
    return { text: 'Computador Autorizado', color: 'text-purple-400 bg-purple-950/40 border-purple-800' };
  };

  const status = getAgentStatusLabel();

  return (
    <div className="space-y-6">
      {/* Top Banner: Status do Agente e Telemetria Imediata */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-100">Cérebro Virtual — Núcleo Cognitivo</h2>
              <span className={`px-2.5 py-0.5 text-xs font-mono rounded border ${status.color}`}>
                {status.text}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ciclo perceptivo-decisório em tempo real com modulação neuroquímica, memória em 4 níveis e aprendizado por reforço.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStepManual}
            className="px-3.5 py-2 text-xs font-medium rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Executar 1 Ciclo</span>
          </button>
          <button
            onClick={() => onSelectTab('neurovisualization')}
            className="px-3.5 py-2 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>Ver Cérebro 3D & Cortes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid de 4 Indicadores Mestres de Telemetria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ÚLTIMA AÇÃO SELECIONADA</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400 uppercase">
            {telemetry.last_action}
          </div>
          <div className="mt-1 text-xs text-slate-400 truncate" title={telemetry.reason}>
            {telemetry.reason}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ESTADO NEUROQUÍMICO (DA / CORT)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <span className="text-amber-400">{telemetry.neurochemistry.dopamine.value.toFixed(2)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">{telemetry.neurochemistry.cortisol.value.toFixed(2)}</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Dopamina (Recompensa) vs Cortisol (Estresse)
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>RETORNO MÉDIO RECENTE (RL)</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {telemetry.rl_metrics.average_reward_recent > 0 ? `+${telemetry.rl_metrics.average_reward_recent}` : telemetry.rl_metrics.average_reward_recent}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {telemetry.rl_metrics.q_states_count} estados mapeados na tabela Q
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ESTIMATIVA DE RECURSOS (PC 8GB)</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-400">
            ~45 MB <span className="text-xs text-slate-500 font-sans font-normal">/ 8 GB RAM</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Execução leve em CPU sem necessidade de GPU
          </div>
        </div>
      </div>

      {/* Seção 2 Colunas: Ciclo Decisório & Modos Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo (2 colunas): Rastreamento Cognitivo Transparente */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Rastro Computacional do Ciclo Cognitivo #{telemetry.cycle}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">11 Etapas Ativas</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3">
              <span className="text-slate-400 shrink-0 font-mono text-[11px]">1. Percepção</span>
              <span className="text-slate-200 text-right">
                Agente na posição ({telemetry.env_state.agent_pos[0]}, {telemetry.env_state.agent_pos[1]}) · Esfera mais próxima a {telemetry.env_state.nearest_orb_dist.toFixed(1)} casas
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3">
              <span className="text-slate-400 shrink-0 font-mono text-[11px]">2. Memória</span>
              <span className="text-slate-200 text-right">
                Consulta episódica concluiu proximidade com regra 'Esfera_Energia' (confiança 98%)
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3">
              <span className="text-slate-400 shrink-0 font-mono text-[11px]">3. Neuroquímica</span>
              <span className="text-slate-200 text-right font-mono">
                DA: {telemetry.neurochemistry.dopamine.value.toFixed(2)} · NA: {telemetry.neurochemistry.noradrenaline.value.toFixed(2)} · CORT: {telemetry.neurochemistry.cortisol.value.toFixed(2)} · GABA: {telemetry.neurochemistry.gaba.value.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3">
              <span className="text-slate-400 shrink-0 font-mono text-[11px]">4. Decisão</span>
              <span className="text-cyan-300 font-mono text-right">
                {telemetry.reason}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3">
              <span className="text-slate-400 shrink-0 font-mono text-[11px]">5. Execução</span>
              <span className="text-slate-200 text-right">
                {telemetry.mode === 'controlled_environment'
                  ? 'Ação executada no simulador 2D com sucesso'
                  : telemetry.mode === 'observation'
                  ? 'Comando não enviado ao hardware (Modo de Observação)'
                  : 'Ação prevista computada em modo de simulação'}
              </span>
            </div>
          </div>

          {/* Testes de Estimulação Rápida */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 mb-2 font-medium">Injeção de Estímulo Causal no Simulador:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStimulate('reward_positive')}
                className="px-2.5 py-1 text-xs rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
              >
                + Recompensa (Dopamina ↑)
              </button>
              <button
                onClick={() => onStimulate('stress')}
                className="px-2.5 py-1 text-xs rounded bg-rose-950/60 border border-rose-800/80 text-rose-400 hover:bg-rose-900/60 transition-colors"
              >
                + Colisão/Erro (Cortisol ↑)
              </button>
              <button
                onClick={() => onStimulate('novelty')}
                className="px-2.5 py-1 text-xs rounded bg-amber-950/60 border border-amber-800/80 text-amber-400 hover:bg-amber-900/60 transition-colors"
              >
                + Novidade (Noradrenalina ↑)
              </button>
              <button
                onClick={() => onStimulate('inhibition')}
                className="px-2.5 py-1 text-xs rounded bg-purple-950/60 border border-purple-800/80 text-purple-400 hover:bg-purple-900/60 transition-colors"
              >
                + Inibição (GABA ↑)
              </button>
            </div>
          </div>
        </div>

        {/* Painel Direito: Os 4 Modos Operacionais */}
        <div className="p-5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Modos Operacionais</span>
            </h3>
            <span className="text-xs text-slate-500">Gateway de Ação</span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'observation', label: 'Modo 1 — Observação', desc: 'Registra e observa sem controlar dispositivos.', color: 'cyan' },
              { id: 'simulation', label: 'Modo 2 — Simulação', desc: 'Planeja e prevê sem enviar entradas físicas.', color: 'amber' },
              { id: 'controlled_environment', label: 'Modo 3 — Ambiente 2D', desc: 'Executa ações apenas no jogo de teste interno.', color: 'emerald' },
              { id: 'authorized_computer', label: 'Modo 4 — Computador Real', desc: 'Controla janelas autorizadas (exige confirmação).', color: 'purple' }
            ].map(m => {
              const isActive = telemetry.mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSetMode(m.id as OperatingMode)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-sm shadow-cyan-950/50'
                      : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {m.label}
                    </span>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onSelectTab('settings')}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors underline"
            >
              Configurar permissões de janelas e segurança
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
