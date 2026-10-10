"""
Memória Semântica — Cérebro Virtual
Fatos, conceitos, regras e modelos causais com confiança e proveniência identificada.
"""

from typing import List, Dict, Any, Optional
from storage.database import BrainDatabase

class SemanticMemory:
    def __init__(self, db: BrainDatabase):
        self.db = db
        self._seed_default_concepts()

    def _seed_default_concepts(self):
        existing = self.db.get_semantic_concepts()
        if not existing:
            defaults = [
                ("Obstaculo_Colisao", "Obstáculos na grade reduzem recompensa e aumentam cortisol.", 0.95, "regras_ambiente_2d", ["colisao", "dano", "perigo"]),
                ("Esfera_Energia", "Esferas douradas geram reforço positivo imediato e elevam dopamina.", 0.98, "regras_ambiente_2d", ["recompensa", "objetivo", "energia"]),
                ("Movimento_Ortogonal", "O agente pode se mover em 4 direções ortogonais: cima, baixo, esquerda, direita.", 1.0, "sistema_motor", ["acao", "grid", "navegacao"]),
                ("Atraso_Temporal", "Recompensas futuras são descontadas por gamma na equação de Bellman.", 0.90, "fundamentos_rl", ["retorno", "planejamento"])
            ]
            for concept, defn, conf, src, assoc in defaults:
                self.db.upsert_semantic_concept(concept, defn, conf, src, assoc)

    def learn_concept(self, concept: str, definition: str, confidence: float, source: str, associations: Optional[List[str]] = None):
        self.db.upsert_semantic_concept(
            concept=concept,
            definition=definition,
            confidence=confidence,
            source=source,
            associations=associations or []
        )

    def search(self, query: str = "") -> List[Dict]:
        return self.db.get_semantic_concepts(query=query)
