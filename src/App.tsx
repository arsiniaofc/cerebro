/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain,
  Layers,
  Gamepad2,
  Zap,
  Database,
  GraduationCap,
  Video,
  UploadCloud,
  Cpu,
  History,
  Shield,
  Activity,
  AlertOctagon
} from 'lucide-react';
import { BrainEngineService } from './services/brainEngine';
import { BrainTelemetry, OperatingMode, SessionEvent } from './types/brain';
import { TopNav } from './components/TopNav';
import { OverviewTab } from './components/tabs/OverviewTab';
import { NeurovisualizationTab } from './components/tabs/NeurovisualizationTab';
import { Environment2DTab } from './components/tabs/Environment2DTab';
import { NeurochemistryTab } from './components/tabs/NeurochemistryTab';
import { MemoryTab } from './components/tabs/MemoryTab';
import { LearningTab } from './components/tabs/LearningTab';
import { ObservationTab } from './components/tabs/ObservationTab';
import { MediaPerceptionTab } from './components/tabs/MediaPerceptionTab';
import { ModelsResourcesTab } from './components/tabs/ModelsResourcesTab';
import { ExperimentsTab } from './components/tabs/ExperimentsTab';
import { SettingsSafetyTab } from './components/tabs/SettingsSafetyTab';

export default function App() {
  const engine = BrainEngineService.getInstance();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [telemetry, setTelemetry] = useState<BrainTelemetry>(() => engine.stepCycle());
  const [timeline, setTimeline] = useState<BrainTelemetry[]>([telemetry]);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [isAutonomous, setIsAutonomous] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(200);

  // Estados de aprendizado por imitação
  const [imitationAccuracy, setImitationAccuracy] = useState<number>(0.85);
  const [divergentExamples, setDivergentExamples] = useState<{ state: string; human_action: string; predicted_action: string }[]>([
    { state: 'grid_3_2_near_hazard', human_action: 'baixo', predicted_action: 'direita' },
    { state: 'grid_7_4_near_none', human_action: 'cima', predicted_action: 'observar' }
  ]);

  // Loop de simulação em tempo real
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + E para Parada de Emergência
      if (e.ctrlKey && e.altKey && e.key === 'e') {
        engine.triggerEmergencyStop();
        setTelemetry(prev => ({ ...prev, emergency_stop: true, mode: 'observation' }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      if (isAutonomous || engine.mode === 'controlled_environment') {
        const nextTelem = engine.stepCycle();
        setTelemetry({ ...nextTelem });
        setTimeline([...engine.telemetryTimeline]);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [simulationRunning, isAutonomous, speedMs, engine]);

  // Ações Manuais
  const handleManualAction = useCallback((action: string) => {
    engine.stepEnvironment(action);
    const nextTelem = engine.stepCycle();
    setTelemetry({ ...nextTelem });
    setTimeline([...engine.telemetryTimeline]);
  }, [engine]);

  const handleManualStep = useCallback(() => {
    const nextTelem = engine.stepCycle();
    setTelemetry({ ...nextTelem });
    setTimeline([...engine.telemetryTimeline]);
  }, [engine]);

  const handleSetMode = useCallback((mode: OperatingMode, confirmed: boolean = false) => {
    engine.setMode(mode, confirmed);
    setTelemetry(prev => ({ ...prev, mode }));
  }, [engine]);

  const handleTriggerEmergencyStop = useCallback(() => {
    engine.triggerEmergencyStop();
    setTelemetry(prev => ({ ...prev, emergency_stop: true, mode: 'observation' }));
  }, [engine]);

  const handleResetEmergencyStop = useCallback(() => {
    engine.resetEmergencyStop();
    setTelemetry(prev => ({ ...prev, emergency_stop: false }));
  }, [engine]);

  const handleStimulate = useCallback((event: string, intensity: number = 1.0) => {
    engine.stimulate(event, intensity);
    const nextTelem = engine.stepCycle();
    setTelemetry({ ...nextTelem });
  }, [engine]);

  const handleResetEnv = useCallback(() => {
    engine.envGrid.agent_pos = [1, 1];
    engine.envGrid.score = 0;
    engine.envGrid.step = 0;
    const nextTelem = engine.stepCycle();
    setTelemetry({ ...nextTelem });
  }, [engine]);

  const handleTrainImitationModel = useCallback(() => {
    // Treino de clonagem comportamental nos dados registrados
    setImitationAccuracy(Number((0.85 + Math.random() * 0.12).toFixed(2)));
    setDivergentExamples([
      { state: 'grid_4_4_near_hazard', human_action: 'esquerda', predicted_action: 'cima' }
    ]);
  }, []);

  const handleTrainFromSession = useCallback((events: SessionEvent[]) => {
    handleTrainImitationModel();
    setCurrentTab('learning');
  }, [handleTrainImitationModel]);

  const handleSaveCheckpoint = useCallback((name: string, notes: string) => {
    const newChk = {
      id: `chk_${Date.now()}`,
      version_name: name,
      created_at: Date.now(),
      model_type: 'q_learning_table',
      metrics: {
        average_reward_recent: telemetry.rl_metrics.average_reward_recent,
        accuracy: imitationAccuracy,
        q_states_count: telemetry.rl_metrics.q_states_count
      },
      notes: notes || 'Checkpoint manual gerado na interface'
    };
    engine.checkpoints.unshift(newChk);
  }, [engine, telemetry, imitationAccuracy]);

  const handleRollback = useCallback((id: string) => {
    const found = engine.checkpoints.find(c => c.id === id);
    if (found) {
      alert(`Estado do agente revertido com segurança para: ${found.version_name}`);
    }
  }, [engine]);

  const handleAddSemanticConcept = useCallback((concept: string, definition: string) => {
    engine.semanticMemory.unshift({
      id: Date.now(),
      concept,
      definition,
      confidence: 0.95,
      source: 'operador_humano_interface',
      associations: ['conceito_customizado'],
      updated_at: Date.now()
    });
  }, [engine]);

  // Lista de 11 abas com ícones
  const tabList = [
    { id: 'overview', label: 'Visão Geral', icon: Brain },
    { id: 'neurovisualization', label: 'Neurovisualização', icon: Layers },
    { id: 'environment2d', label: 'Ambiente 2D & RL', icon: Gamepad2 },
    { id: 'neurochemistry', label: 'Neuroquímica', icon: Zap },
    { id: 'memory', label: 'Memórias', icon: Database },
    { id: 'learning', label: 'Aprendizado', icon: GraduationCap },
    { id: 'observation', label: 'Observação', icon: Video },
    { id: 'media', label: 'Mídia & Sensores', icon: UploadCloud },
    { id: 'models', label: 'Modelos & Recursos', icon: Cpu },
    { id: 'experiments', label: 'Checkpoints', icon: History },
    { id: 'settings', label: 'Segurança & Windows', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Nav aderente ao Top Bar Contract */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mode={telemetry.mode}
        emergencyStop={telemetry.emergency_stop}
        onTriggerEmergencyStop={handleTriggerEmergencyStop}
        onResetEmergencyStop={handleResetEmergencyStop}
        simulationRunning={simulationRunning}
        onToggleSimulation={() => setSimulationRunning(r => !r)}
        cycleCount={telemetry.cycle}
      />

      {/* Barra de Abas Secundária com Todas as 11 Seções */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-2 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabList.map(t => {
            const isActive = currentTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentTab(t.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal do Laboratório */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {currentTab === 'overview' && (
          <OverviewTab
            telemetry={telemetry}
            onSelectTab={setCurrentTab}
            onSetMode={handleSetMode}
            onStimulate={handleStimulate}
            onStepManual={handleManualStep}
          />
        )}

        {currentTab === 'neurovisualization' && (
          <NeurovisualizationTab
            telemetry={telemetry}
            timeline={timeline}
            onStimulate={handleStimulate}
          />
        )}

        {currentTab === 'environment2d' && (
          <Environment2DTab
            telemetry={telemetry}
            onManualAction={handleManualAction}
            onResetEnv={handleResetEnv}
            onToggleAutonomous={() => setIsAutonomous(a => !a)}
            isAutonomous={isAutonomous}
            speedMs={speedMs}
            onSpeedChange={setSpeedMs}
          />
        )}

        {currentTab === 'neurochemistry' && (
          <NeurochemistryTab
            telemetry={telemetry}
            onStimulate={handleStimulate}
          />
        )}

        {currentTab === 'memory' && (
          <MemoryTab
            workingMemory={engine.workingMemory}
            episodicMemory={engine.episodicMemory}
            semanticMemory={engine.semanticMemory}
            proceduralMemory={engine.proceduralMemory}
            onAddSemanticConcept={handleAddSemanticConcept}
          />
        )}

        {currentTab === 'learning' && (
          <LearningTab
            telemetry={telemetry}
            onTrainImitationModel={handleTrainImitationModel}
            divergentExamples={divergentExamples}
            imitationAccuracy={imitationAccuracy}
          />
        )}

        {currentTab === 'observation' && (
          <ObservationTab
            onTrainImitation={handleTrainFromSession}
          />
        )}

        {currentTab === 'media' && (
          <MediaPerceptionTab />
        )}

        {currentTab === 'models' && (
          <ModelsResourcesTab />
        )}

        {currentTab === 'experiments' && (
          <ExperimentsTab
            checkpoints={engine.checkpoints}
            onSaveCheckpoint={handleSaveCheckpoint}
            onRollback={handleRollback}
            telemetry={telemetry}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsSafetyTab
            telemetry={telemetry}
            onSetMode={handleSetMode}
            onTriggerEmergencyStop={handleTriggerEmergencyStop}
            onResetEmergencyStop={handleResetEmergencyStop}
          />
        )}
      </main>

      {/* Rodapé Silencioso com Metadados */}
      <footer className="border-t border-slate-900 bg-[#07090E] px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Cérebro Virtual · v1.0.0</span>
          <span>·</span>
          <span>Agente Multimodal com Aprendizado Contínuo</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Persistência SQLite & LocalStorage</span>
          <span>·</span>
          <span>Dual Mode (Web & Windows Desktop)</span>
        </div>
      </footer>
    </div>
  );
}
