import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { BrainTelemetry } from '../../types/brain';

interface LearningTabProps {
  telemetry: BrainTelemetry;
  onTrainImitationModel: () => void;
  divergentExamples: { state: string; human_action: string; predicted_action: string }[];
  imitationAccuracy: number;
}

export const LearningTab: React.FC<LearningTabProps> = ({
  telemetry,
  onTrainImitationModel,
  divergentExamples,
  imitationAccuracy
}) => {
  const [epochs, setEpochs] = useState(5);
  const [valSplit, setValSplit] = useState(0.2);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <span>Aprendizado por Imitação (Behavior Cloning) & Aprendizado Contínuo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Treinamento de políticas supervisionadas associando representações observadas às ações do operador humano.
          </p>
        </div>

        <button
          onClick={onTrainImitationModel}
          className="px-4 py-2 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-purple-950/50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Executar Treinamento em Lote</span>
        </button>
      </div>

      {/* Grid: Painel de Treinador à esquerda, Métricas e Divergências à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Configurações do Treino */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Hiperparâmetros do Treinamento</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Épocas de Otimização:</span>
                <span className="font-mono text-purple-300 font-bold">{epochs}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>Divisão de Validação:</span>
                <span className="font-mono text-purple-300 font-bold">{(valSplit * 100).toFixed(0)}% teste</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.5}
                step={0.05}
                value={valSplit}
                onChange={(e) => setValSplit(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Política de Atualização Controlada:</span>
              <p>
                Os pesos são atualizados em lotes para evitar esquecimento catastrófico. Antes de aprovar uma nova versão, o modelo é avaliado no conjunto de validação fixo.
              </p>
            </div>
          </div>
        </div>

        {/* Painel Central e Direito: Métricas e Casos Divergentes */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-5">
          {/* Métricas de Acurácia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">ACURÁCIA DA POLÍTICA</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {(imitationAccuracy * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">concordância com humano</span>
            </div>

            <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">PERDA DE VALIDAÇÃO (LOSS)</span>
              <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
                {(1.0 - imitationAccuracy).toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">entropia cruzada empírica</span>
            </div>

            <div className="p-3.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">DISCORDÂNCIAS AUDITADAS</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                {divergentExamples.length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">amostras para replay</span>
            </div>
          </div>

          {/* Lista de Casos Onde a Política Divergiu do Humano */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Replay de Divergências: Onde o Modelo Errou a Ação do Operador</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Inspeção Detalhada</span>
            </div>

            <div className="space-y-2 text-xs">
              {divergentExamples.length === 0 ? (
                <div className="p-4 rounded bg-slate-950/40 border border-slate-800/80 text-center text-slate-400">
                  Nenhuma divergência registrada no lote atual. A política reproduziu perfeitamente as ações observadas.
                </div>
              ) : (
                divergentExamples.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="text-slate-300">
                      <span className="text-slate-500">Estado: </span>
                      <span>{ex.state}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">
                        Humano: {ex.human_action}
                      </span>
                      <span className="text-slate-600">≠</span>
                      <span className="text-rose-400 font-bold">
                        Previsto: {ex.predicted_action}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
