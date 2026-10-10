"""
Memória de Trabalho — Cérebro Virtual
Armazena contexto imediato, objetivo ativo, estímulos salientes recentes e hipóteses correntes.
"""

from typing import List, Dict, Any, Optional
import time

class WorkingMemory:
    def __init__(self, capacity: int = 7):
        self.capacity = capacity
        self.active_goal: Optional[Dict[str, Any]] = None
        self.context_items: List[Dict[str, Any]] = []
        self.active_hypotheses: List[str] = []
        self.last_observation: Optional[Dict[str, Any]] = None

    def set_goal(self, goal_name: str, priority: float = 1.0, parameters: Optional[Dict] = None):
        self.active_goal = {
            "name": goal_name,
            "priority": priority,
            "parameters": parameters or {},
            "set_at": time.time()
        }

    def add_context_item(self, item_type: str, content: Any, importance: float = 0.5):
        entry = {
            "type": item_type,
            "content": content,
            "importance": importance,
            "timestamp": time.time()
        }
        self.context_items.append(entry)
        if len(self.context_items) > self.capacity:
            # Remove o item menos importante ou mais antigo
            self.context_items.sort(key=lambda x: (x["importance"], x["timestamp"]))
            self.context_items.pop(0)

    def set_last_observation(self, obs: Dict[str, Any]):
        self.last_observation = obs

    def get_state(self) -> Dict[str, Any]:
        return {
            "active_goal": self.active_goal,
            "capacity": self.capacity,
            "current_load": len(self.context_items),
            "items": self.context_items[-self.capacity:],
            "hypotheses": self.active_hypotheses,
            "last_observation_summary": str(self.last_observation) if self.last_observation else "Nenhuma"
        }
