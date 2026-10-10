"""
Módulo de Neurotransmissores e Dinâmica Neuroquímica Simulada
Cérebro Virtual — Subsistema Neurochemistry
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
import time

@dataclass
class Neurotransmitter:
    name: str
    symbol: str
    current_value: float
    baseline: float
    min_value: float = 0.0
    max_value: float = 1.0
    production_rate: float = 0.05
    decay_rate: float = 0.04
    description: str = ""
    history: List[float] = field(default_factory=list)
    max_history_len: int = 120

    def record_history(self):
        self.history.append(round(self.current_value, 4))
        if len(self.history) > self.max_history_len:
            self.history.pop(0)

class NeurochemicalSystem:
    """
    Simulador numérico estável das variáveis neuroquímicas computacionais.
    Equação básica:
      dc_i/dt = P_i - k_i * (c_i - baseline) + sum(influências externas)
    """
    def __init__(self):
        self.transmitters: Dict[str, Neurotransmitter] = {
            "dopamine": Neurotransmitter(
                name="Dopamina",
                symbol="DA",
                current_value=0.35,
                baseline=0.35,
                production_rate=0.06,
                decay_rate=0.05,
                description="Sinal computacional de recompensa esperada, erro de predição e reforço."
            ),
            "noradrenaline": Neurotransmitter(
                name="Noradrenalina",
                symbol="NA",
                current_value=0.30,
                baseline=0.30,
                production_rate=0.05,
                decay_rate=0.04,
                description="Alerta, saliência de estímulos e resposta a mudanças bruscas de ambiente."
            ),
            "serotonin": Neurotransmitter(
                name="Serotonina",
                symbol="5-HT",
                current_value=0.50,
                baseline=0.50,
                production_rate=0.04,
                decay_rate=0.03,
                description="Modulação de estabilidade, persistência e moderação de risco decisório."
            ),
            "acetylcholine": Neurotransmitter(
                name="Acetilcolina",
                symbol="ACh",
                current_value=0.40,
                baseline=0.40,
                production_rate=0.05,
                decay_rate=0.04,
                description="Foco atencional, processamento de novas pistas sensoriais e codificação."
            ),
            "glutamate": Neurotransmitter(
                name="Glutamato",
                symbol="Glu",
                current_value=0.45,
                baseline=0.45,
                production_rate=0.06,
                decay_rate=0.05,
                description="Transmissão excitatória simulada e facilitação de disparo entre nós."
            ),
            "gaba": Neurotransmitter(
                name="GABA",
                symbol="GABA",
                current_value=0.45,
                baseline=0.45,
                production_rate=0.05,
                decay_rate=0.04,
                description="Inibição computacional, filtragem de ruído e contenção de hiperexcitabilidade."
            ),
            "cortisol": Neurotransmitter(
                name="Cortisol",
                symbol="CORT",
                current_value=0.20,
                baseline=0.20,
                production_rate=0.04,
                decay_rate=0.03,
                description="Indicador de carga de tarefa, erro continuado ou estresse operacional."
            ),
            "melatonin": Neurotransmitter(
                name="Melatonina",
                symbol="MEL",
                current_value=0.15,
                baseline=0.15,
                production_rate=0.03,
                decay_rate=0.02,
                description="Modulador de ciclo de repouso, consolidação de memórias e offline replay."
            ),
        }
        self.last_update_time = time.time()
        for t in self.transmitters.values():
            t.record_history()

    def update(self, dt: float = 0.1, external_influences: Dict[str, float] = None):
        if external_influences is None:
            external_influences = {}

        # Efeitos cruzados entre transmissores:
        # Ex: GABA inibe Glutamato; Cortisol reduz Dopamina basal; Noradrenalina excita Acetilcolina
        cross_influences = {
            "glutamate": -0.15 * (self.transmitters["gaba"].current_value - self.transmitters["gaba"].baseline),
            "dopamine": -0.10 * (self.transmitters["cortisol"].current_value - self.transmitters["cortisol"].baseline),
            "acetylcholine": 0.12 * (self.transmitters["noradrenaline"].current_value - self.transmitters["noradrenaline"].baseline),
            "serotonin": -0.08 * (self.transmitters["cortisol"].current_value - self.transmitters["cortisol"].baseline),
        }

        for key, t in self.transmitters.items():
            ext = external_influences.get(key, 0.0)
            cross = cross_influences.get(key, 0.0)
            # Decaimento em direção à linha de base
            delta_base = -t.decay_rate * (t.current_value - t.baseline)
            delta = (delta_base + ext + cross) * dt
            new_val = t.current_value + delta
            # Limites fisiológicos computacionais estritos
            t.current_value = max(t.min_value, min(t.max_value, new_val))
            t.record_history()

    def trigger_event(self, event_type: str, intensity: float = 1.0):
        """
        Dispara alterações causais baseadas em acontecimentos reais do agente:
        - reward_positive: Aumento de dopamina e serotonina, queda de cortisol
        - reward_negative / error: Queda de dopamina, elevação de cortisol e noradrenalina
        - novelty / surprise: Elevação aguda de noradrenalina e acetilcolina
        - high_cognitive_load: Elevação de glutamato e cortisol
        - inhibition_trigger: Elevação de GABA para frear impulsos
        """
        influences = {}
        if event_type == "reward_positive":
            influences["dopamine"] = 0.35 * intensity
            influences["serotonin"] = 0.15 * intensity
            influences["cortisol"] = -0.20 * intensity
        elif event_type in ("reward_negative", "collision", "error"):
            influences["dopamine"] = -0.25 * intensity
            influences["cortisol"] = 0.30 * intensity
            influences["noradrenaline"] = 0.25 * intensity
        elif event_type == "novelty":
            influences["noradrenaline"] = 0.30 * intensity
            influences["acetylcholine"] = 0.28 * intensity
        elif event_type == "stress":
            influences["cortisol"] = 0.40 * intensity
        elif event_type == "consolidation":
            influences["melatonin"] = 0.35 * intensity
            influences["gaba"] = 0.20 * intensity

        self.update(dt=1.0, external_influences=influences)

    def get_state(self) -> Dict[str, Any]:
        return {
            key: {
                "name": t.name,
                "symbol": t.symbol,
                "value": round(t.current_value, 4),
                "baseline": t.baseline,
                "min": t.min_value,
                "max": t.max_value,
                "history": t.history[-60:],
                "description": t.description
            }
            for key, t in self.transmitters.items()
        }
