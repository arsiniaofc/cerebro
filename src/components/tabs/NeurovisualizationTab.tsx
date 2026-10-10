import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Layers,
  Activity,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Sliders,
  ChevronRight,
  Eye,
  Zap,
  Clock
} from 'lucide-react';
import { BrainTelemetry, BrainRegion } from '../../types/brain';

interface NeurovisualizationTabProps {
  telemetry: BrainTelemetry;
  timeline: BrainTelemetry[];
  onStimulate: (event: string) => void;
}

export const NeurovisualizationTab: React.FC<NeurovisualizationTabProps> = ({
  telemetry,
  timeline,
  onStimulate
}) => {
  // Estado da linha do tempo e reprodução histórica
  const [isPlayingHistorical, setIsPlayingHistorical] = useState(false);
  const [scrubberIndex, setScrubberIndex] = useState<number | null>(null);

  // Exibir frame histórico ou frame ao vivo
  const currentFrame = scrubberIndex !== null && timeline[scrubberIndex]
    ? timeline[scrubberIndex]
    : telemetry;

  // Visualização 3D: Rotação, Zoom e Seleção
  const [rotX, setRotX] = useState(15);
  const [rotY, setRotY] = useState(-25);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('cortex_prefrontal');
  const [showTracts, setShowTracts] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Cortes tomográficos
  const [slicePlane, setSlicePlane] = useState<'axial' | 'coronal' | 'sagittal'>('axial');
  const [sliceDepth, setSliceDepth] = useState(4); // 0 a 7

  // EEG Simulado: histórico local de traçados
  const [activeEEGChannels, setActiveEEGChannels] = useState<Record<string, boolean>>({
    F3_Prefrontal_L: true,
    F4_Prefrontal_R: true,
    O1_Visual_Occipital: true,
    C3_Motor_Central: true,
    T3_Temporal_Hippocampal: true
  });
  const [eegHistory, setEegHistory] = useState<Record<string, number[]>>({
    F3_Prefrontal_L: [],
    F4_Prefrontal_R: [],
    O1_Visual_Occipital: [],
    C3_Motor_Central: [],
    T3_Temporal_Hippocampal: []
  });

  // Atualizar histórico de EEG a cada frame
  useEffect(() => {
    setEegHistory(prev => {
      const next: Record<string, number[]> = {};
      for (const [ch, val] of Object.entries(currentFrame.eeg_channels)) {
        const arr = prev[ch] ? [...prev[ch], val] : [val];
        if (arr.length > 80) arr.shift();
        next[ch] = arr;
      }
      return next;
    });
  }, [currentFrame.cycle, currentFrame.eeg_channels]);

  // Controles de mouse para o Cérebro 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY(r => r + dx * 0.5);
    setRotX(r => Math.max(-80, Math.min(80, r - dy * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Projeção 3D matemática esquemática para tela 2D
  const project3D = (x: number, y: number, z: number, w: number, h: number) => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Rotação Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotação X
    const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // Projeção perspectiva
    const distance = 3.0;
    const fov = 350 * zoom;
    const projX = w / 2 + (x1 * fov) / (z2 + distance);
    const projY = h / 2 - (y2 * fov) / (z2 + distance);

    return { px: projX, py: projY, depth: z2 };
  };

  const selectedRegion = currentFrame.regions[selectedRegionKey];

  return (
    <div className="space-y-6">
      {/* Sincronização e Linha do Tempo Global */}
      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Linha do Tempo Sincronizada ({scrubberIndex !== null ? `Momento Histórico: Ciclo #${currentFrame.cycle}` : `Ao Vivo: Ciclo #${telemetry.cycle}`})
            </span>
            {scrubberIndex !== null && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                REPLAY HISTÓRICO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {scrubberIndex !== null ? (
              <button
                onClick={() => setScrubberIndex(null)}
                className="px-3 py-1 text-xs font-medium rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition-colors"
              >
                Retornar ao Ao Vivo
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-mono">
                Sincronizando 60Hz · 4 Visualizadores Ativos
              </span>
            )}
          </div>
        </div>

        {/* Barra de Scrubbing */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(1, timeline.length - 1)}
            value={scrubberIndex !== null ? scrubberIndex : timeline.length - 1}
            onChange={(e) => setScrubberIndex(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 shrink-0">
            {timeline.length} amostras
          </span>
        </div>
      </div>

      {/* Grid Principal: Visualização A (Cérebro 3D) e Visualização B (Cortes Tomográficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VISUALIZAÇÃO A — CÉREBRO 3D ESQUEMÁTICO */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Visualização A — Cérebro 3D Interativo</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Arraste para girar · Roda do mouse ou botões para zoom · Nós e feixes sinápticos reais
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Aproximar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Afastar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setRotX(15); setRotY(-25); setZoom(1.0); }}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Resetar Orientação"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas SVG Interativo para o Cérebro 3D */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full h-[360px] bg-[#07090E] rounded border border-slate-800/80 cursor-grab active:cursor-grabbing overflow-hidden select-none"
          >
            <svg className="w-full h-full">
              {/* Grade de Coordenadas Orbital */}
              <circle cx="50%" cy="50%" r={130 * zoom} fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeDasharray="3 3" />
              <ellipse cx="50%" cy="50%" rx={150 * zoom} ry={70 * zoom} fill="none" stroke="rgba(30, 41, 59, 0.25)" />

              {/* Feixes e Conexões Neurais */}
              {showTracts && currentFrame.connections.map((conn, idx) => {
                const fromReg = currentFrame.regions[conn.from];
                const toReg = currentFrame.regions[conn.to];
                if (!fromReg || !toReg) return null;

                const p1 = project3D(fromReg.pos[0], fromReg.pos[1], fromReg.pos[2], 500, 360);
                const p2 = project3D(toReg.pos[0], toReg.pos[1], toReg.pos[2], 500, 360);

                const strokeWidth = Math.max(1, conn.weight * 4.5);
                const opacity = Math.max(0.2, conn.weight);

                return (
                  <line
                    key={idx}
                    x1={p1.px}
                    y1={p1.py}
                    x2={p2.px}
                    y2={p2.py}
                    stroke={`rgba(6, 182, 212, ${opacity})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Nós Funcionais das Regiões do Cérebro */}
              {Object.entries(currentFrame.regions).map(([key, reg]) => {
                const proj = project3D(reg.pos[0], reg.pos[1], reg.pos[2], 500, 360);
                const isSelected = selectedRegionKey === key;
                const nodeRadius = 8 + reg.activation * 12;

                return (
                  <g
                    key={key}
                    onClick={() => setSelectedRegionKey(key)}
                    className="cursor-pointer transition-transform"
                  >
                    {/* Brilho de Ativação */}
                    <circle
                      cx={proj.px}
                      cy={proj.py}
                      r={nodeRadius * 1.6}
                      fill={isSelected ? 'rgba(217, 70, 239, 0.35)' : 'rgba(6, 182, 212, 0.2)'}
                      className="transition-all duration-300"
                    />

                    {/* Núcleo do Nó */}
                    <circle
                      cx={proj.px}
                      cy={proj.py}
                      r={nodeRadius}
                      fill={isSelected ? '#D946EF' : '#06B6D4'}
                      stroke={isSelected ? '#FFFFFF' : '#0891B2'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all duration-300"
                    />

                    {/* Rótulo de Texto da Região */}
                    {showLabels && (
                      <text
                        x={proj.px}
                        y={proj.py - nodeRadius - 5}
                        textAnchor="middle"
                        fill={isSelected ? '#F0ABFC' : '#94A3B8'}
                        fontSize="10px"
                        fontFamily="monospace"
                        className="pointer-events-none select-none font-medium"
                      >
                        {reg.name} ({Math.round(reg.activation * 100)}%)
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Controles de Camada Flutuantes */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-[11px] text-slate-300">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTracts}
                  onChange={(e) => setShowTracts(e.target.checked)}
                  className="rounded text-cyan-500 accent-cyan-400"
                />
                <span>Feixes Sinápticos</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded text-cyan-500 accent-cyan-400"
                />
                <span>Rótulos</span>
              </label>
            </div>
          </div>

          {/* Painel de Detalhes da Região Selecionada */}
          {selectedRegion && (
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">{selectedRegion.name}</span>
                <span className="text-slate-400 ml-2">· Módulo: {selectedRegion.module}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-400">Ativação Computacional:</span>
                <span className="font-bold text-cyan-400 text-sm">{(selectedRegion.activation * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* VISUALIZAÇÃO B — CORTES INSPIRADOS EM RESSONÂNCIA */}
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-magenta-400" />
                <span>Visualização B — Cortes Esquematizados</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Mapas de calor em planos 2D calculados a partir das ativações modulares reais
              </p>
            </div>

            {/* Seletor de Plano de Corte */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded text-xs font-mono">
              {(['axial', 'coronal', 'sagittal'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSlicePlane(p)}
                  className={`px-2.5 py-1 rounded transition-colors uppercase ${
                    slicePlane === p ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Visualizador 2D do Plano de Corte */}
          <div className="relative w-full h-[360px] bg-[#07090E] rounded border border-slate-800/80 p-4 flex flex-col items-center justify-center">
            {/* Grid 8x8 de Intensidade */}
            <div className="grid grid-cols-8 gap-1 p-2 bg-slate-950/80 rounded border border-slate-800">
              {currentFrame.slices[slicePlane].map((row, rIdx) =>
                row.map((val, cIdx) => {
                  // Mapeamento de calor: Azul escuro -> Ciano -> Ambar -> Branco
                  const intensity = Math.min(1.0, val);
                  let bgColor = `rgba(15, 23, 42, 0.6)`;
                  if (intensity > 0.65) bgColor = `rgba(245, 158, 11, ${intensity})`;
                  else if (intensity > 0.35) bgColor = `rgba(6, 182, 212, ${intensity})`;
                  else if (intensity > 0.10) bgColor = `rgba(30, 58, 138, ${intensity * 1.5})`;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="w-7 h-7 rounded-sm flex items-center justify-center transition-colors duration-200 border border-slate-900/60"
                      style={{ backgroundColor: bgColor }}
                      title={`Coord: [${cIdx}, ${rIdx}] · Intensidade: ${(intensity * 100).toFixed(0)}%`}
                    >
                      {intensity > 0.5 && (
                        <span className="text-[9px] font-mono text-slate-950 font-bold select-none">
                          {Math.round(intensity * 9)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Aviso Científico Mandatório */}
            <div className="mt-3 text-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Visualização computacional inspirada em neuroimagem (não é uma ressonância magnética real).
              </span>
            </div>
          </div>

          {/* Controle de Profundidade */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Profundidade do Plano ({slicePlane}):</span>
            <input
              type="range"
              min={0}
              max={7}
              value={sliceDepth}
              onChange={(e) => setSliceDepth(parseInt(e.target.value))}
              className="w-48 accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <span className="font-mono text-cyan-400">Camada Z#{sliceDepth}</span>
          </div>
        </div>
      </div>

      {/* VISUALIZAÇÃO C — EEG SIMULADO MULTICANAL */}
      <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Visualização C — EEG Simulado Multicanal (EEG-like)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Traçados contínuos sintetizados a partir da taxa de disparo excitatório (Glutamato) e inibitório (GABA)
            </p>
          </div>

          {/* Toggles de Canais */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {Object.keys(activeEEGChannels).map(ch => (
              <button
                key={ch}
                onClick={() => setActiveEEGChannels(prev => ({ ...prev, [ch]: !prev[ch] }))}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeEEGChannels[ch]
                    ? 'bg-slate-800 border-cyan-500/60 text-cyan-300 font-semibold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                }`}
              >
                {ch.split('_')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Osciloscópio Multicanal */}
        <div className="p-4 bg-[#07090E] rounded border border-slate-800/80 space-y-3">
          {Object.entries(eegHistory).map(([channelName, points]) => {
            if (!activeEEGChannels[channelName]) return null;

            // Converter pontos para path SVG
            const width = 800;
            const height = 40;
            const stepX = width / Math.max(1, points.length - 1);

            let pathD = '';
            points.forEach((val, i) => {
              const x = i * stepX;
              const y = height / 2 - val * 28;
              pathD += `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            });

            return (
              <div key={channelName} className="flex items-center gap-3">
                <span className="w-28 text-[11px] font-mono text-slate-400 shrink-0 truncate" title={channelName}>
                  {channelName}
                </span>

                <div className="flex-1 h-10 bg-slate-950/60 rounded border border-slate-800/40 overflow-hidden relative">
                  {/* Linha Central de Zero */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/40" />

                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <span className="w-16 text-right font-mono text-xs text-emerald-400 shrink-0">
                  {(points[points.length - 1] || 0).toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Escala Temporal: ~200ms / varredura · Amostragem discreta</span>
          <span className="font-mono">Sinal sintetizado computacionalmente · Sem alegações biológicas</span>
        </div>
      </div>
    </div>
  );
};
