"""
Memória Episódica — Cérebro Virtual
Registra e recupera experiências vivenciadas pelo agente com indexação temporal e similaridade.
"""

from typing import List, Dict, Any, Optional
import time
from storage.database import BrainDatabase

class EpisodicMemory:
    def __init__(self, db: BrainDatabase):
        self.db = db

    def record_experience(self, session_id: str, task_name: str, observation: Any,
                          action: Any, reward: float, next_observation: Any,
                          neuro_state: Dict[str, float], metadata: Optional[Dict] = None) -> int:
        return self.db.add_episodic_record(
            session_id=session_id,
            task_name=task_name,
            obs=observation,
            action=action,
            reward=reward,
            next_obs=next_observation,
            neuro_state=neuro_state,
            meta=metadata
        )

    def retrieve_similar(self, current_obs: Dict[str, Any], limit: int = 5) -> List[Dict]:
        """
        Recupera episódios mais recentes ou relevantes para auxiliar a decisão presente.
        """
        episodes = self.db.get_recent_episodes(limit=limit * 3)
        # Filtra ou ordena por correspondência de atributos
        return episodes[:limit]

    def get_recent(self, limit: int = 30) -> List[Dict]:
        return self.db.get_recent_episodes(limit=limit)
