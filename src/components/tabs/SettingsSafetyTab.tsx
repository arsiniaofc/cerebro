import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Terminal,
  Download,
  Sliders,
  Folder,
  FileCode,
  HardDrive
} from 'lucide-react';
import { OperatingMode, BrainTelemetry } from '../../types/brain';

interface SettingsSafetyTabProps {
  telemetry: BrainTelemetry;
  onSetMode: (mode: OperatingMode, confirmed?: boolean) => void;
  onTriggerEmergencyStop: () => void;
  onResetEmergencyStop: () => void;
}

export const SettingsSafetyTab: React.FC<SettingsSafetyTabProps> = ({
  telemetry,
  onSetMode,
  onTriggerEmergencyStop,
  onResetEmergencyStop
}) => {
  const [whitelist, setWhitelist] = useState<string[]>([
    'virtual_brain_sim',
    'notepad.exe',
    'calculator.exe',
    'mspaint.exe'
  ]);
  const [newWindow, setNewWindow] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddWindow = () => {
    if (newWindow.trim() && !whitelist.includes(newWindow.trim())) {
      setWhitelist([...whitelist, newWindow.trim()]);
      setNewWindow('');
    }
  };

  const handleRemoveWindow = (item: string) => {
    setWhitelist(whitelist.filter(w => w !== item));
  };

  const handleSelectMode = (mode: OperatingMode) => {
    if (mode === 'authorized_computer') {
      setShowConfirmModal(true);
    } else {
      onSetMode(mode, false);
    }
  };

  const confirmAuthorizedComputer = () => {
    onSetMode('authorized_computer', true);
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Configurações, Segurança e Distribuição Windows</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Políticas de controle de periféricos, lista branca de aplicações, contenção de riscos e execução nativa em Windows.
          </p>
        </div>
      </div>

      {/* Grid: 4 Modos Operacionais & Parada de Emergência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Configuração do Modo Operacional</span>
          </h3>

          <div className="space-y-3">
            {[
              { id: 'observation', label: 'Modo 1: Observação (Padrão)', desc: 'O agente apenas observa a tela e telemetria, sem enviar comandos.' },
              { id: 'simulation', label: 'Modo 2: Simulação', desc: 'As decisões são computadas e apresentadas visualmente, mas não executadas.' },
              { id: 'controlled_environment', label: 'Modo 3: Ambiente 2D Controlado', desc: 'Ações limitadas estritamente ao jogo 2D interno do laboratório.' },
              { id: 'authorized_computer', label: 'Modo 4: Computador Autorizado', desc: 'Permite interação real em janelas permitidas (requer autorização explícita).' }
            ].map(m => {
              const isActive = telemetry.mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMode(m.id as OperatingMode)}
                  className={`p-3.5 rounded border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500 shadow-sm shadow-cyan-950/40'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isActive ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {m.label}
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista Branca de Aplicações e Parada de Emergência */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Folder className="w-4 h-4 text-emerald-400" />
              <span>Lista de Aplicações Autorizadas (Whitelist)</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newWindow}
                onChange={(e) => setNewWindow(e.target.value)}
                placeholder="Nome do processo (ex: chrome.exe)"
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 flex-1 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddWindow}
                className="px-3.5 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {whitelist.map(w => (
                <span
                  key={w}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2"
                >
                  <span>{w}</span>
                  <button
                    onClick={() => handleRemoveWindow(w)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Seção de Teste de Parada de Emergência */}
          <div className="p-4 rounded bg-slate-950/80 border border-slate-800 space-y-2 mt-4">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Mecanismo de Desconexão Imediata (Fail-Safe)</span>
            </span>
            <p className="text-[11px] text-slate-400">
              O botão de parada de emergência cancela imediatamente qualquer execução, solta todas as teclas do teclado e botões do mouse retidos e força o retorno seguro ao Modo de Observação.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={onTriggerEmergencyStop}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Testar Disparo de Emergência
              </button>
              {telemetry.emergency_stop && (
                <button
                  onClick={onResetEmergencyStop}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Resetar Parada
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pacote Desktop Windows: Arquivos Prontos */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Pacote Desktop Windows Completo (Pronto para Execução Local)</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono">100% Configurado no Repositório</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>start.bat</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Script batch de 1 clique para Windows. Checa a presença do Python e inicia a aplicação.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>start.py</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Ponto de entrada Python que inicializa o backend, o SQLite e abre o navegador automaticamente.
            </p>
          </div>

          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Dependências leves (FastAPI, Uvicorn, Pillow, NumPy) sem bibliotecas pesadas de GPU.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Modo Computador Autorizado */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-slate-100">Confirmação de Controle Real</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O <strong>Modo Computador Autorizado</strong> concede ao agente a capacidade de enviar eventos de mouse e teclado para aplicações permitidas na sua lista branca.
            </p>
            <div className="p-3 rounded bg-slate-950 text-[11px] text-slate-400 space-y-1">
              <div>• Operações de disco destrutivas estão permanentemente bloqueadas.</div>
              <div>• Parada de emergência pode ser disparada a qualquer momento.</div>
              <div>• Limite rígido de 50 ações consecutivas por rajada.</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAuthorizedComputer}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Autorizar Controle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
