"""
Memória Procedural — Cérebro Virtual
Rotinas, cadeias de ações automatizadas, habilidades e hábitos consolidados.
"""

from typing import List, Dict, Any, Optional
from storage.database import BrainDatabase

class ProceduralMemory:
    def __init__(self, db: BrainDatabase):
        self.db = db
        self._seed_default_skills()

    def _seed_default_skills(self):
        skills = self.db.get_procedural_skills()
        if not skills:
            defaults = [
                ("Desvio_Emergencial", "obstaculo_frontal_proximo", ["rotacionar_90_graus", "avancar"], 0.88),
                ("Aproximacao_Alvo", "alvo_no_campo_visual", ["calcular_vetor_distancia", "passo_em_direcao"], 0.92),
                ("Parada_Segura", "limite_de_area_ou_perigo_critico", ["frear_movimento", "observar_entorno"], 0.99),
            ]
            for name, trigger, seq, rate in defaults:
                self.db.upsert_procedural_skill(name, trigger, seq, rate)

    def register_skill(self, skill_name: str, condition_trigger: str, action_sequence: List[Any], success_rate: float):
        self.db.upsert_procedural_skill(skill_name, condition_trigger, action_sequence, success_rate)

    def get_all_skills(self) -> List[Dict]:
        return self.db.get_procedural_skills()
