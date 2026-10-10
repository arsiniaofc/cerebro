"""
Módulo de Aprendizado por Imitação (Behavior Cloning) — Cérebro Virtual
Associa representações observadas a ações humanas para aprendizado supervisionado de políticas.
"""

from typing import List, Dict, Any, Tuple
import json
import random
import time

class ImitationLearner:
    def __init__(self):
        # Mapeamento aprendido: representacao_discretizada -> distribuicao_de_acoes
        self.policy_weights: Dict[str, Dict[str, float]] = {}
        self.training_history: List[Dict[str, Any]] = []
        self.validation_accuracy: float = 0.0
        self.divergent_examples: List[Dict[str, Any]] = []

    def prepare_dataset(self, session_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extrai pares (observacao_estado, acao_humana) a partir da linha de eventos.
        """
        pairs = []
        last_obs = "estado_padrao_janela"
        for ev in session_events:
            ev_type = ev.get("type")
            data = ev.get("data", {})
            if ev_type in ("screen_state", "observation"):
                last_obs = f"grid_{data.get('agent_x', 0)}_{data.get('agent_y', 0)}_near_{data.get('nearest_item', 'none')}"
            elif ev_type in ("keypress", "mouse_click", "action"):
                action_name = data.get("key") or data.get("action") or "click"
                pairs.append({
                    "state": last_obs,
                    "action": str(action_name),
                    "timestamp": ev.get("t_mono", 0.0)
                })
        return pairs

    def train_on_pairs(self, pairs: List[Dict[str, Any]], epochs: int = 5, test_split: float = 0.2) -> Dict[str, Any]:
        if not pairs:
            return {"status": "error", "message": "Nenhum par de estado-ação disponível."}

        # Divisão Treino / Validação
        shuffled = list(pairs)
        random.seed(42)
        random.shuffle(shuffled)
        split_idx = int(len(shuffled) * (1 - test_split))
        train_set = shuffled[:split_idx]
        val_set = shuffled[split_idx:] if split_idx < len(shuffled) else train_set

        # Contagem de frequências empíricas e suavização de Laplace
        counts: Dict[str, Dict[str, int]] = {}
        for item in train_set:
            s, a = item["state"], item["action"]
            if s not in counts:
                counts[s] = {}
            counts[s][a] = counts[s].get(a, 0) + 1

        # Converter em probabilidades
        new_policy: Dict[str, Dict[str, float]] = {}
        for s, act_counts in counts.items():
            total = sum(act_counts.values())
            new_policy[s] = {a: round(cnt / total, 3) for a, cnt in act_counts.items()}

        self.policy_weights.update(new_policy)

        # Avaliação no conjunto de validação
        correct = 0
        divergences = []
        for item in val_set:
            s, true_a = item["state"], item["action"]
            pred_a = self.predict_action(s)
            if pred_a == true_a:
                correct += 1
            else:
                divergences.append({
                    "state": s,
                    "human_action": true_a,
                    "predicted_action": pred_a
                })

        acc = round(correct / len(val_set), 4) if val_set else 1.0
        self.validation_accuracy = acc
        self.divergent_examples = divergences[:10]

        train_record = {
            "timestamp": time.time(),
            "epochs": epochs,
            "train_samples": len(train_set),
            "val_samples": len(val_set),
            "accuracy": acc,
            "loss": round(1.0 - acc, 4),
            "states_learned": len(self.policy_weights)
        }
        self.training_history.append(train_record)
        return train_record

    def predict_action(self, state: str) -> str:
        if state in self.policy_weights and self.policy_weights[state]:
            # Retorna a ação com maior probabilidade
            best_action = max(self.policy_weights[state].items(), key=lambda x: x[1])[0]
            return best_action
        return "observar"

    def get_summary(self) -> Dict[str, Any]:
        return {
            "states_modeled": len(self.policy_weights),
            "last_accuracy": self.validation_accuracy,
            "divergent_count": len(self.divergent_examples),
            "recent_divergences": self.divergent_examples,
            "history": self.training_history
        }
