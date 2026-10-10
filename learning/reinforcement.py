"""
Módulo de Aprendizado por Reforço — Cérebro Virtual
Implementação de Q-Learning / Retorno Descontado G_t = sum(gamma^k * r_{t+k})
"""

from typing import Dict, List, Tuple, Any, Optional
import random
import math

class ReinforcementLearner:
    def __init__(self, actions: List[str], gamma: float = 0.95, alpha: float = 0.15, epsilon: float = 0.20):
        self.actions = actions
        self.gamma = gamma          # Fator de desconto
        self.alpha = alpha          # Taxa de aprendizado
        self.epsilon = epsilon      # Exploração epsilon-greedy
        self.q_table: Dict[str, Dict[str, float]] = {}
        self.episode_rewards: List[float] = []
        self.total_steps: int = 0
        self.discounted_returns: List[float] = []

    def get_q_values(self, state_key: str) -> Dict[str, float]:
        if state_key not in self.q_table:
            self.q_table[state_key] = {a: 0.0 for a in self.actions}
        return self.q_table[state_key]

    def select_action(self, state_key: str, explore: bool = True, exploration_mod: float = 1.0) -> Tuple[str, str]:
        """
        Retorna (acao_escolhida, motivo_computacional).
        A taxa efetiva de exploração é modulada por noradrenalina/serotonina.
        """
        q_vals = self.get_q_values(state_key)
        eff_epsilon = min(0.9, self.epsilon * exploration_mod) if explore else 0.0

        if explore and random.random() < eff_epsilon:
            chosen = random.choice(self.actions)
            reason = f"Exploração estocástica (epsilon={eff_epsilon:.2f}, mod={exploration_mod:.2f})"
        else:
            # Ganância sobre Q
            max_val = max(q_vals.values())
            best_actions = [a for a, v in q_vals.items() if v == max_val]
            chosen = random.choice(best_actions)
            reason = f"Explotação do valor Q máximo ({max_val:.3f}) para ação '{chosen}'"

        return chosen, reason

    def update_q(self, state: str, action: str, reward: float, next_state: str, learning_rate_mod: float = 1.0) -> float:
        """
        Atualização de Bellman:
          Q(s, a) <- Q(s, a) + alpha * [r + gamma * max_a' Q(s', a') - Q(s, a)]
        Retorna o erro de predição temporal (TD Error), que influencia a Dopamina.
        """
        q_s = self.get_q_values(state)
        q_next = self.get_q_values(next_state)

        max_next_q = max(q_next.values()) if q_next else 0.0
        td_target = reward + self.gamma * max_next_q
        td_error = td_target - q_s[action]

        eff_alpha = min(1.0, self.alpha * learning_rate_mod)
        q_s[action] += eff_alpha * td_error
        self.total_steps += 1

        return td_error

    def calculate_discounted_return(self, rewards_sequence: List[float]) -> float:
        """
        Calcula G_0 = sum_{k=0}^{T} gamma^k * r_k
        """
        g = 0.0
        for k, r in enumerate(rewards_sequence):
            g += (self.gamma ** k) * r
        return round(g, 4)

    def record_episode_end(self, total_reward: float):
        self.episode_rewards.append(round(total_reward, 2))
        if len(self.episode_rewards) > 100:
            self.episode_rewards.pop(0)

    def get_metrics(self) -> Dict[str, Any]:
        avg_reward = (sum(self.episode_rewards) / len(self.episode_rewards)) if self.episode_rewards else 0.0
        return {
            "total_steps": self.total_steps,
            "q_states_count": len(self.q_table),
            "episodes_count": len(self.episode_rewards),
            "average_reward_recent": round(avg_reward, 2),
            "recent_rewards": self.episode_rewards[-20:],
            "gamma": self.gamma,
            "alpha": self.alpha,
            "epsilon": self.epsilon
        }
