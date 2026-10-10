"""
Ambiente 2D Gridworld — Cérebro Virtual
Ambiente de testes controlado com estado observável, recompensas mensuráveis e física de grade.
"""

from typing import Dict, Any, List, Tuple
import random

class GridworldEnvironment2D:
    ACTIONS = ["cima", "baixo", "esquerda", "direita"]
    ACTION_MAP = {
        "cima": (0, -1),
        "baixo": (0, 1),
        "esquerda": (-1, 0),
        "direita": (1, 0)
    }

    def __init__(self, width: int = 10, height: int = 10, num_orbs: int = 4, num_hazards: int = 5):
        self.width = width
        self.height = height
        self.num_orbs = num_orbs
        self.num_hazards = num_hazards

        self.agent_pos = [1, 1]
        self.orbs: List[List[int]] = []
        self.hazards: List[List[int]] = []

        self.steps = 0
        self.max_steps = 150
        self.score = 0.0
        self.orbs_collected = 0
        self.hazard_hits = 0

        self.reset()

    def reset(self) -> Dict[str, Any]:
        self.agent_pos = [1, 1]
        self.steps = 0
        self.score = 0.0
        self.orbs_collected = 0
        self.hazard_hits = 0

        # Gerar orbs de energia e obstaculos
        occupied = {tuple(self.agent_pos)}
        self.hazards = []
        while len(self.hazards) < self.num_hazards:
            pos = (random.randint(1, self.width - 2), random.randint(1, self.height - 2))
            if pos not in occupied:
                occupied.add(pos)
                self.hazards.append(list(pos))

        self.orbs = []
        while len(self.orbs) < self.num_orbs:
            pos = (random.randint(0, self.width - 1), random.randint(0, self.height - 1))
            if pos not in occupied:
                occupied.add(pos)
                self.orbs.append(list(pos))

        return self.get_observation()

    def step(self, action: str) -> Tuple[Dict[str, Any], float, bool, Dict[str, Any]]:
        self.steps += 1
        dx, dy = self.ACTION_MAP.get(action, (0, 0))

        nx = max(0, min(self.width - 1, self.agent_pos[0] + dx))
        ny = max(0, min(self.height - 1, self.agent_pos[1] + dy))

        reward = -0.1  # Custo do tempo/passo
        hit_hazard = False
        collected_orb = False

        # Checar se bateu em obstaculo
        if [nx, ny] in self.hazards:
            reward -= 5.0
            self.hazard_hits += 1
            hit_hazard = True
            # Fica no mesmo lugar ou recua
        else:
            self.agent_pos = [nx, ny]

        # Checar se coletou orb de energia
        if self.agent_pos in self.orbs:
            reward += 10.0
            self.orbs_collected += 1
            collected_orb = True
            self.orbs.remove(self.agent_pos)
            # Respawn de nova esfera
            while True:
                new_p = [random.randint(0, self.width - 1), random.randint(0, self.height - 1)]
                if new_p not in self.hazards and new_p != self.agent_pos:
                    self.orbs.append(new_p)
                    break

        self.score += reward
        done = self.steps >= self.max_steps or (self.hazard_hits >= 5)

        info = {
            "hit_hazard": hit_hazard,
            "collected_orb": collected_orb,
            "orbs_collected": self.orbs_collected,
            "hazard_hits": self.hazard_hits,
            "score": round(self.score, 2),
            "step": self.steps
        }
        return self.get_observation(), reward, done, info

    def get_observation(self) -> Dict[str, Any]:
        # Encontra a esfera mais próxima
        nearest_orb_dist = 999.0
        nearest_orb = None
        for orb in self.orbs:
            dist = abs(self.agent_pos[0] - orb[0]) + abs(self.agent_pos[1] - orb[1])
            if dist < nearest_orb_dist:
                nearest_orb_dist = dist
                nearest_orb = orb

        nearest_hazard_dist = 999.0
        for haz in self.hazards:
            dist = abs(self.agent_pos[0] - haz[0]) + abs(self.agent_pos[1] - haz[1])
            if dist < nearest_hazard_dist:
                nearest_hazard_dist = dist

        state_key = f"x{self.agent_pos[0]}_y{self.agent_pos[1]}_orbNear{int(nearest_orb_dist)}_hazNear{int(nearest_hazard_dist)}"

        return {
            "agent_pos": list(self.agent_pos),
            "orbs": [list(o) for o in self.orbs],
            "hazards": [list(h) for h in self.hazards],
            "grid_size": [self.width, self.height],
            "nearest_orb_dist": nearest_orb_dist,
            "nearest_hazard_dist": nearest_hazard_dist,
            "state_key": state_key,
            "step": self.steps,
            "score": round(self.score, 2)
        }
