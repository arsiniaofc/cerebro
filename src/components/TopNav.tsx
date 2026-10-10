import React from 'react';
import { AlertOctagon, Brain, Activity, ShieldCheck, Play, Pause } from 'lucide-react';
import { OperatingMode } from '../types/brain';

interface TopNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mode: OperatingMode;
  emergencyStop: boolean;
  onTriggerEmergencyStop: () => void;
  onResetEmergencyStop: () => void;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
  cycleCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  mode,
  emergencyStop,
  onTriggerEmergencyStop,
  onResetEmergencyStop,
  simulationRunning,
  onToggleSimulation,
  cycleCount
}) => {
  const modeLabels: Record<OperatingMode, string> = {
    observation: 'Modo Observação',
    simulation: 'Modo Simulação',
    controlled_environment: 'Ambiente 2D Controlado',
    authorized_computer: 'Computador Autorizado'
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07090E]/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Brain className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-slate-100 whitespace-nowrap">
            Cérebro Virtual
          </span>
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
            Laboratório Computacional · Ciclo #{cycleCount}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-line, unboxed text links) */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('overview')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'overview' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => onSelectTab('neurovisualization')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'neurovisualization' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Neurovisualização 3D/Cortes
        </button>
        <button
          onClick={() => onSelectTab('environment2d')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'environment2d' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Ambiente 2D & RL
        </button>
        <button
          onClick={() => onSelectTab('neurochemistry')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'neurochemistry' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Neuroquímica
        </button>
        <button
          onClick={() => onSelectTab('memory')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'memory' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Memórias (4 Níveis)
        </button>
        <button
          onClick={() => onSelectTab('learning')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'learning' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Clonagem & Imitação
        </button>
        <button
          onClick={() => onSelectTab('observation')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'observation' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Captura de Sessão
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap ${currentTab === 'settings' ? 'text-cyan-400 font-semibold border-b border-cyan-400 pb-0.5' : ''}`}
        >
          Segurança & Windows
        </button>
      </nav>

      {/* Zone 3: Actions & Emergency Stop */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSimulation}
          className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            simulationRunning
              ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-emerald-950/60 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60'
          }`}
        >
          {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{simulationRunning ? 'Pausar Loop' : 'Retomar Loop'}</span>
        </button>

        {emergencyStop ? (
          <button
            onClick={onResetEmergencyStop}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-slate-950 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Restaurar Operação</span>
          </button>
        ) : (
          <button
            onClick={onTriggerEmergencyStop}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-rose-900/40"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Parada de Emergência</span>
          </button>
        )}
      </div>
    </header>
  );
};
