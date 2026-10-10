"""
Módulo de Gerenciamento de Checkpoints e Avaliação de Regressões — Cérebro Virtual
Permite salvar versões, comparar métricas e reverter para estados estáveis anteriores.
"""

from typing import Dict, Any, List, Optional
import json
import time
from storage.database import BrainDatabase

class CheckpointManager:
    def __init__(self, db: BrainDatabase):
        self.db = db

    def create_checkpoint(self, version_name: str, model_type: str, weights_data: Any, metrics: Dict[str, Any], notes: str = "") -> str:
        checkpoint_id = f"chk_{int(time.time())}_{version_name.replace(' ', '_').lower()}"
        weights_json = json.dumps(weights_data) if not isinstance(weights_data, str) else weights_data
        self.db.save_checkpoint(
            checkpoint_id=checkpoint_id,
            version_name=version_name,
            model_type=model_type,
            metrics=metrics,
            weights_json=weights_json,
            notes=notes
        )
        return checkpoint_id

    def list_all(self) -> List[Dict[str, Any]]:
        return self.db.list_checkpoints()

    def compare_checkpoints(self, id_a: str, id_b: str) -> Dict[str, Any]:
        checkpoints = self.db.list_checkpoints()
        chk_a = next((c for c in checkpoints if c["id"] == id_a), None)
        chk_b = next((c for c in checkpoints if c["id"] == id_b), None)
        if not chk_a or not chk_b:
            return {"error": "Um ou ambos os checkpoints não foram encontrados."}

        meta_a = json.loads(chk_a.get("metrics", "{}"))
        meta_b = json.loads(chk_b.get("metrics", "{}"))

        return {
            "version_a": chk_a["version_name"],
            "version_b": chk_b["version_name"],
            "metrics_a": meta_a,
            "metrics_b": meta_b,
            "delta_reward": round(meta_b.get("average_reward_recent", 0.0) - meta_a.get("average_reward_recent", 0.0), 3),
            "delta_accuracy": round(meta_b.get("accuracy", 0.0) - meta_a.get("accuracy", 0.0), 3)
        }
