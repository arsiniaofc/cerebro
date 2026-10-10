import React, { useState } from 'react';
import {
  FileImage,
  FileAudio,
  Film,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export const MediaPerceptionTab: React.FC = () => {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'audio' | 'video'>('image');
  const [analyzedImage, setAnalyzedImage] = useState<{
    fileName: string;
    resolution: string;
    luminance: number;
    detectedElements: { id: number; label: string; bbox: string; confidence: number }[];
    ocrText: string;
    engine: string;
  }>({
    fileName: 'exemplo_tela_interface.png',
    resolution: '1280x720',
    luminance: 0.42,
    detectedElements: [
      { id: 1, label: 'Botão "Iniciar"', bbox: '[120, 80, 220, 120]', confidence: 0.94 },
      { id: 2, label: 'Caixa de Diálogo', bbox: '[300, 150, 700, 450]', confidence: 0.91 },
      { id: 3, label: 'Indicador de Status', bbox: '[800, 20, 950, 50]', confidence: 0.88 }
    ],
    ocrText: 'CÉREBRO VIRTUAL · LABORATÓRIO COMPUTACIONAL ATIVO',
    engine: 'SpatialGridEncoder_v1 (Leve, CPU)'
  });

  const [analyzedAudio, setAnalyzedAudio] = useState<{
    fileName: string;
    duration: string;
    rmsEnergy: number;
    bands: { low: number; mid: number; high: number };
    transcription: string;
    speechEngine: string;
  }>({
    fileName: 'sinal_acustico_ambiente.wav',
    duration: '2.4s',
    rmsEnergy: 0.48,
    bands: { low: 0.62, mid: 0.45, high: 0.31 },
    transcription: '[Áudio acústico não-verbal processado via FFT]',
    speechEngine: 'AcousticSpectrogramAnalyzer (Offline CPU)'
  });

  const handleSimulateUpload = (type: 'image' | 'audio' | 'video') => {
    if (type === 'image') {
      setAnalyzedImage(prev => ({
        ...prev,
        fileName: `amostra_capturada_${Date.now().toString().slice(-4)}.png`,
        luminance: Number((0.35 + Math.random() * 0.3).toFixed(2))
      }));
    } else if (type === 'audio') {
      setAnalyzedAudio(prev => ({
        ...prev,
        fileName: `audio_stream_${Date.now().toString().slice(-4)}.wav`,
        rmsEnergy: Number((0.3 + Math.random() * 0.4).toFixed(2)),
        bands: {
          low: Number((0.4 + Math.random() * 0.4).toFixed(2)),
          mid: Number((0.3 + Math.random() * 0.4).toFixed(2)),
          high: Number((0.2 + Math.random() * 0.3).toFixed(2))
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="p-5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <span>Importação de Mídia e Módulos de Percepção Multimodal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análise local de imagens, áudios e vídeos com extração de representações computacionais e transparência técnica.
          </p>
        </div>

        {/* Toggles de Tipo de Mídia */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded text-xs">
          <button
            onClick={() => setActiveMediaTab('image')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeMediaTab === 'image' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Imagem / Tela</span>
          </button>
          <button
            onClick={() => setActiveMediaTab('audio')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeMediaTab === 'audio' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>Áudio / FFT</span>
          </button>
          <button
            onClick={() => setActiveMediaTab('video')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeMediaTab === 'video' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Vídeo / Quadros</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Imagem */}
      {activeMediaTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>Arquivo em Análise: {analyzedImage.fileName}</span>
              </h3>
              <button
                onClick={() => handleSimulateUpload('image')}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Carregar Nova Imagem
              </button>
            </div>

            {/* Simulação Visual do Quadro */}
            <div className="w-full h-56 bg-[#07090E] rounded border border-slate-800 relative flex items-center justify-center overflow-hidden">
              <div className="w-48 h-32 rounded border border-cyan-500/60 bg-cyan-950/20 flex flex-col items-center justify-center p-3 text-center">
                <span className="text-xs font-mono text-cyan-300 font-bold">[ELEMENTO DETECTADO]</span>
                <span className="text-[11px] text-slate-400 mt-1">Botão de Interface</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Confiança: 94%</span>
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-400 border border-slate-800">
                Resolução: {analyzedImage.resolution} · Luminância: {analyzedImage.luminance}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-xs space-y-1 font-mono">
              <span className="text-slate-400 block text-[11px]">Texto Reconhecido por OCR:</span>
              <span className="text-cyan-300 font-semibold">{analyzedImage.ocrText}</span>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Elementos e Bounding Boxes Identificados</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {analyzedImage.detectedElements.map(el => (
                <div key={el.id} className="p-3 rounded bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{el.label}</span>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">BBox: {el.bbox}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(el.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400">
              Motor ativo: <span className="text-slate-200 font-mono">{analyzedImage.engine}</span>. Não executa redes neurais pesadas sem autorização prévia.
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Áudio */}
      {activeMediaTab === 'audio' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Decomposição Espectral de Áudio (FFT em 3 Bandas)</span>
            </h3>
            <button
              onClick={() => handleSimulateUpload('audio')}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Analisar Amostra de Áudio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 block">SUB-BASS & LOW (60Hz - 250Hz)</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 mt-2 block">
                {(analyzedAudio.bands.low * 100).toFixed(0)}%
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${analyzedAudio.bands.low * 100}%` }} />
              </div>
            </div>

            <div className="p-4 rounded bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 block">MIDRANGE (250Hz - 2kHz)</span>
              <span className="text-2xl font-bold font-mono text-amber-400 mt-2 block">
                {(analyzedAudio.bands.mid * 100).toFixed(0)}%
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${analyzedAudio.bands.mid * 100}%` }} />
              </div>
            </div>

            <div className="p-4 rounded bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 block">HIGH PRESENCE (2kHz - 8kHz)</span>
              <span className="text-2xl font-bold font-mono text-purple-400 mt-2 block">
                {(analyzedAudio.bands.high * 100).toFixed(0)}%
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${analyzedAudio.bands.high * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
            <span className="text-slate-400 block text-[11px]">Status de Transcrição de Fala:</span>
            <p className="text-slate-300">{analyzedAudio.transcription}</p>
            <p className="text-[10px] text-slate-500 pt-1">
              Nota: Modelo Whisper de reconhecimento de voz pode ser integrado opcionalmente via adaptador em config/models.json.
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo Vídeo */}
      {activeMediaTab === 'video' && (
        <div className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>Extração Temporal de Quadros de Vídeo</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {['t=0.0s (Início)', 't=1.5s (Movimento)', 't=3.0s (Interação)', 't=4.5s (Conclusão)'].map((frame, i) => (
              <div key={i} className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-2 text-center">
                <div className="w-full h-24 bg-[#07090E] rounded border border-slate-800/80 flex items-center justify-center font-mono text-slate-600 text-xs">
                  QUADRO #{i + 1}
                </div>
                <span className="font-mono text-slate-300 block">{frame}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
