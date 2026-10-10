import React from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const ModelsResourcesTab: React.FC = () => {
  const adapters = [
    {
      id: 'vision_core',
      name: 'SpatialGridEncoder_v1',
      role: 'Percepção Visual & Detecção de Elementos',
      status: 'Pronto (Local CPU)',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      device: 'CPU',
      memoryMb: 15,
      isHeavy: false,
      description: 'Extrator espacial determinístico leve, projetado para operar sem GPU em máquinas com 8GB RAM.'
    },
    {
      id: 'ocr_engine',
      name: 'TesseractOCR / Heurística Nativa',
      role: 'Reconhecimento Ótico de Caracteres',
      status: 'Disponível Local',
      statusColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
      device: 'CPU',
      memoryMb: 45,
      isHeavy: false,
      description: 'Módulo modular de leitura de caixas de texto e elementos de tela sem API externa.'
    },
    {
      id: 'audio_spectral',
      name: 'AcousticSpectrogramAnalyzer',
      role: 'Decomposição Espectral de Frequências (FFT)',
      status: 'Pronto (Local CPU)',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      device: 'CPU',
      memoryMb: 12,
      isHeavy: false,
      description: 'Decomposição matemática de frequências em bandas Low, Mid e High com amostragem em tempo real.'
    },
    {
      id: 'language_intent',
      name: 'CognitiveIntentMatcher',
      role: 'Parser Semântico Determinístico',
      status: 'Pronto (Local CPU)',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      device: 'CPU',
      memoryMb: 8,
      isHeavy: false,
      description: 'Mapeamento semântico local de objetivos e comandos do usuário sem custos de nuvem ou chaves.'
    },
    {
      id: 'whisper_speech',
      name: 'OpenAI Whisper (Opcional)',
      role: 'Transcrição Fonética de Fala',
      status: 'Desconectado por Padrão',
      statusColor: 'text-slate-500 bg-slate-900 border-slate-700',
      device: 'CPU / CUDA',
      memoryMb: 0,
      isHeavy: true,
      description: 'Não instalado por padrão para economizar espaço em disco e memória. Pode ser configurado em config/models.json.'
    },
    {
      id: 'gemini_external',
      name: 'API Gemini / LLM Externo',
      role: 'Compreensão de Linguagem Ampla',
      status: 'Desativado (Zero Dependência)',
      statusColor: 'text-slate-500 bg-slate-900 border-slate-700',
      device: 'Nuvem',
      memoryMb: 0,
      isHeavy: false,
      description: 'O Cérebro Virtual opera 100% autônomo e offline sem depender de nenhuma chave de API remota.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Modelos e Adaptadores: Diagnóstico e Uso de Recursos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Transparência técnica total: o estado real de cada adaptador é documentado sem simulações falsas.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono text-cyan-400 flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          <span>RAM Total Estimada: ~80 MB</span>
        </div>
      </div>

      {/* Tabela de Adaptadores */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Inventário de Adaptadores do Sistema</span>
        </h3>

        <div className="space-y-3 text-xs">
          {adapters.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-100 text-sm">{m.name}</span>
                  <span className={`px-2 py-0.5 text-[11px] font-mono rounded border ${m.statusColor}`}>
                    {m.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Função: {m.role} · Dispositivo: {m.device} · Memória: {m.memoryMb > 0 ? `${m.memoryMb} MB` : '0 MB'}
                </div>
                <p className="text-slate-300 text-xs pt-1">{m.description}</p>
              </div>

              <div className="shrink-0 text-right font-mono text-[11px]">
                {m.memoryMb > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disponível</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1 justify-end">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Não Carregado</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota de Arquitetura para Máquinas Modestas */}
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Compatibilidade com computadores de 8 GB de RAM:</span>
          <p className="mt-1 leading-relaxed">
            O Cérebro Virtual foi projetado deliberadamente sem pesos de redes neurais de dezenas de gigabytes, permitindo execução ágil e estável em computadores comuns sem GPU dedicada. Modelos maiores podem ser descarregados ou acoplados sob demanda pelo usuário sem travar a interface.
          </p>
        </div>
      </div>
    </div>
  );
};
