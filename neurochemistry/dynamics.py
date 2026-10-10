"""
Dinâmica e Modulação Neuroquímica — Cérebro Virtual
Define as equações de modulação sobre a taxa de aprendizado, foco atencional e exploração.
"""

from typing import Dict, Any
from .transmitters import NeurochemicalSystem

class NeuroDynamicsManager:
    def __init__(self, neuro_system: NeurochemicalSystem):
        self.neuro = neuro_system

    def get_modulation_factors(self) -> Dict[str, float]:
        """
        Retorna fatores multiplicativos que modulam os algoritmos do cérebro:
        - learning_rate_mod: amplificado por dopamina e acetilcolina, atenuado por cortisol excessivo.
        - exploration_mod: noradrenalina eleva exploração; serotonina estabiliza exploração.
        - sensory_gain: acetilcolina eleva ganho sensorial e atenção seletiva.
        - motor_inhibition: GABA eleva limiar de disparo motor prevenindo ações precipitadas.
        """
        da = self.neuro.transmitters["dopamine"].current_value
        ach = self.neuro.transmitters["acetylcholine"].current_value
        cort = self.neuro.transmitters["cortisol"].current_value
        na = self.neuro.transmitters["noradrenaline"].current_value
        ht5 = self.neuro.transmitters["serotonin"].current_value
        gaba = self.neuro.transmitters["gaba"].current_value

        lr_mod = max(0.2, (da * 1.5 + ach * 1.0) / (1.0 + cort * 0.8))
        explor_mod = max(0.1, (na * 1.8) / (0.5 + ht5 * 1.2))
        sensory_gain = max(0.5, ach * 2.0)
        inhibition = max(0.1, gaba * 1.5)

        return {
            "learning_rate_mod": round(lr_mod, 4),
            "exploration_mod": round(explor_mod, 4),
            "sensory_gain": round(sensory_gain, 4),
            "motor_inhibition": round(inhibition, 4)
        }
