import React, { useState } from 'react';
import {
  Video,
  Play,
  Pause,
  Square,
  MousePointer,
  Keyboard,
  Clock,
  Layers,
  FileText,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import { SessionEvent } from '../../types/brain';

interface ObservationTabProps {
  onTrainImitation: (events: SessionEvent[]) => void;
}

export const ObservationTab: React.FC<ObservationTabProps> = ({
  onTrainImitation
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionGoal, setSessionGoal] = useState('Navegação e coleta no quadrante leste');
  const [targetApp, setTargetApp] = useState('virtual_brain_sim');
  const [events, setEvents] = useState<SessionEvent[]>([
    { id: 1, t_mono: 0.12, type: 'keypress', data: { key: 'ArrowUp' } },
    { id: 2, t_mono: 0.35, type: 'mouse_click', data: { x: 240, y: 180, button: 'left' } },
    { id: 3, t_mono: 0.85, type: 'observation', data: { agent_x: 2, agent_y: 1, nearest_item: 'orb_gold' } },
    { id: 4, t_mono: 1.10, type: 'keypress', data: { key: 'ArrowRight' } },
    { id: 5, t_mono: 1.65, type: 'mouse_move', data: { x: 310, y: 220 } },
    { id: 6, t_mono: 2.05, type: 'keypress', data: { key: 'ArrowDown' } }
  ]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSimulateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRecording) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newEv: SessionEvent = {
      id: events.length + 1,
      t_mono: Number(((events.length * 0.25) + 0.1).toFixed(2)),
      type: 'mouse_click',
      data: { x, y, button: 'left' }
    };
    setEvents(prev => [...prev, newEv]);
  };

  const handleSimulateKey = (keyName: string) => {
    if (!isRecording) return;
    const newEv: SessionEvent = {
      id: events.length + 1,
      t_mono: Number(((events.length * 0.25) + 0.1).toFixed(2)),
      type: 'keypress',
      data: { key: keyName }
    };
    setEvents(prev => [...prev, newEv]);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Observação e Captura de Sessão do Usuário</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro de eventos de tela, cursor, cliques, teclas e contexto de janelas para aprendizado por imitação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-3.5 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-900/30"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Iniciar Gravação de Sessão</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-3.5 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Concluir Gravação</span>
            </button>
          )}

          <button
            onClick={() => onTrainImitation(events)}
            className="px-3.5 py-1.5 text-xs font-medium rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
          >
            <span>Treinar Imitador (Behavior Cloning)</span>
          </button>
        </div>
      </div>

      {/* Grid: Canvas de Observação & Linha de Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Área de Captura & Inputs Interativos */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Aplicação Alvo:</span>
              <span className="font-mono text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">{targetApp}</span>
            </div>
            <div className="text-slate-400">
              Objetivo: <span className="text-slate-200">{sessionGoal}</span>
            </div>
          </div>

          {/* Área Interativa de Captura de Mouse */}
          <div
            onClick={handleSimulateClick}
            className={`w-full h-64 rounded border flex flex-col items-center justify-center cursor-crosshair relative select-none overflow-hidden transition-colors ${
              isRecording
                ? 'bg-[#07090E] border-cyan-500/80 shadow-inner'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="text-center p-4">
              <MousePointer className={`w-8 h-8 mx-auto mb-2 ${isRecording ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
              <p className="text-xs text-slate-300 font-semibold">
                {isRecording ? 'Captura Ativa: Clique aqui dentro para registrar eventos' : 'Gravação em Espera'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Eventos são indexados com timestamps de alta resolução monotônicos.
              </p>
            </div>

            {/* Teclado Virtual para Alimentar a Sessão */}
            {isRecording && (
              <div className="absolute bottom-3 flex items-center gap-2">
                {['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter'].map(k => (
                  <button
                    key={k}
                    onClick={(e) => { e.stopPropagation(); handleSimulateKey(k); }}
                    className="px-2 py-1 text-[10px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Resolução de captura: 1920x1080 (normalizada [0, 1])</span>
            <span>Total capturado nesta sessão: {events.length} eventos</span>
          </div>
        </div>

        {/* Painel Direito: Linha de Eventos Gravados */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Eventos Registrados</span>
            </h3>
            <button
              onClick={() => setEvents([])}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
            >
              Limpar
            </button>
          </div>

          <div className="flex-1 max-h-[340px] overflow-y-auto space-y-2 pr-1 text-xs">
            {events.length === 0 ? (
              <div className="p-6 text-center text-slate-500">Nenhum evento registrado.</div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">+{ev.t_mono}s</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      ev.type === 'keypress'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : ev.type === 'mouse_click'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {ev.type}
                    </span>
                  </div>

                  <span className="text-slate-300">
                    {ev.type === 'keypress' && `Tecla: ${ev.data.key}`}
                    {ev.type === 'mouse_click' && `Clique (${ev.data.x}, ${ev.data.y})`}
                    {ev.type === 'mouse_move' && `Move (${ev.data.x}, ${ev.data.y})`}
                    {ev.type === 'observation' && `Obs: ${ev.data.nearest_item}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
