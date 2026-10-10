"""
Núcleo Central do Agente — VirtualBrain
Coordena a percepção, memória, neuroquímica, tomada de decisão, execução de ações e neurovisualização.
"""

import time
import math
import random
from typing import Dict, Any, List, Optional

from storage.database import BrainDatabase
from neurochemistry.transmitters import NeurochemicalSystem
from neurochemistry.dynamics import NeuroDynamicsManager
from memory.working import WorkingMemory
from memory.episodic import EpisodicMemory
from memory.semantic import SemanticMemory
from memory.procedural import ProceduralMemory
from perception.vision import VisionPerception
from perception.audio import AudioPerception
from perception.language import LanguageProcessor
from actions.gateway import ActionGateway
from environments.environment_2d import GridworldEnvironment2D
from learning.reinforcement import ReinforcementLearner
from learning.imitation import ImitationLearner
from learning.checkpoints import CheckpointManager
from capture.input_events import UserSessionRecorder

class VirtualBrain:
    def __init__(self, db_path: str = "data/brain.db"):
        self.db = BrainDatabase(db_path=db_path)

        # Módulos Centrais
        self.neuro = NeurochemicalSystem()
        self.neuro_dynamics = NeuroDynamicsManager(self.neuro)
        self.working_mem = WorkingMemory(capacity=7)
        self.episodic_mem = EpisodicMemory(self.db)
        self.semantic_mem = SemanticMemory(self.db)
        self.procedural_mem = ProceduralMemory(self.db)

        # Percepção
        self.vision = VisionPerception()
        self.audio = AudioPerception()
        self.language = LanguageProcessor()

        # Ações e Segurança
        self.actions_gateway = ActionGateway(initial_mode="observation")

        # Ambiente 2D e Aprendizado
        self.env_2d = GridworldEnvironment2D(width=10, height=10)
        self.rl = ReinforcementLearner(actions=GridworldEnvironment2D.ACTIONS, gamma=0.95, alpha=0.15, epsilon=0.20)
        self.imitation = ImitationLearner()
        self.checkpoints = CheckpointManager(self.db)
        self.recorder = UserSessionRecorder(self.db)

        # Estado Operacional
        self.cycle_count = 0
        self.last_decision_reason = "Inicialização do núcleo cognitivo."
        self.last_chosen_action = "observar"
        self.active_task = "monitoramento_geral"
        self.running_simulation = False

        # Regiões do Cérebro para Neurovisualização 3D e Cortes
        self.brain_regions = {
            "cortex_visual": {"name": "Córtex Visual", "pos": [0.0, -0.6, -0.2], "activation": 0.25, "module": "Visão"},
            "cortex_auditivo": {"name": "Córtex Auditivo", "pos": [-0.6, 0.0, -0.1], "activation": 0.20, "module": "Audição"},
            "area_linguagem": {"name": "Área de Linguagem", "pos": [-0.5, 0.3, 0.1], "activation": 0.30, "module": "Linguagem"},
            "cortex_prefrontal": {"name": "Córtex Pré-Frontal", "pos": [0.0, 0.8, 0.3], "activation": 0.45, "module": "Decisão & Metas"},
            "hipocampo": {"name": "Hipocampo", "pos": [0.1, -0.1, -0.3], "activation": 0.35, "module": "Memória Episódica"},
            "gânglios_base": {"name": "Gânglios da Base", "pos": [0.0, 0.1, -0.2], "activation": 0.40, "module": "Procedural & Ações"},
            "amígdala": {"name": "Amígdala", "pos": [-0.3, -0.1, -0.4], "activation": 0.20, "module": "Sinais de Alerta & Risco"},
            "locus_coeruleus": {"name": "Locus Coeruleus", "pos": [0.0, -0.4, -0.5], "activation": 0.30, "module": "Noradrenalina & Foco"}
        }

        # Carregar último estado persistente se houver
        self._load_persisted_state()

    def _load_persisted_state(self):
        saved = self.db.get_state("brain_summary")
        if saved:
            self.cycle_count = saved.get("cycle_count", 0)
            self.active_task = saved.get("active_task", "monitoramento_geral")

    def _persist_current_state(self):
        self.db.set_state("brain_summary", {
            "cycle_count": self.cycle_count,
            "active_task": self.active_task,
            "mode": self.actions_gateway.current_mode,
            "neuro": {k: t.current_value for k, t in self.neuro.transmitters.items()}
        })

    def run_full_cognitive_cycle(self) -> Dict[str, Any]:
        """
        Executa o ciclo completo de 11 etapas especificado no projeto:
        1. Receber observações e estímulos.
        2. Transformar em representações computacionais.
        3. Consultar memória e contexto.
        4. Atualizar estado interno e variáveis neuroquímicas.
        5. Avaliar objetivos ativos.
        6. Selecionar ação ou decidir observar mais.
        7. Executar ação somente se modo permitir.
        8. Observar resultado.
        9. Comparar resultado com expectativa (TD error).
        10. Registrar experiência e atualizar aprendizado.
        11. Atualizar neurovisualização.
        """
        self.cycle_count += 1

        # 1 & 2. Observação e representação
        obs_2d = self.env_2d.get_observation()
        state_key = obs_2d["state_key"]
        self.working_mem.set_last_observation(obs_2d)

        # 3. Consultar memória
        similar_episodes = self.episodic_mem.retrieve_similar(obs_2d, limit=3)
        relevant_rules = self.semantic_mem.search(query="obstaculo")

        # 4. Modulação neuroquímica
        mod_factors = self.neuro_dynamics.get_modulation_factors()

        # 5 & 6. Decisão e Seleção de Ação
        chosen_action, reason = self.rl.select_action(
            state_key=state_key,
            explore=True,
            exploration_mod=mod_factors["exploration_mod"]
        )
        self.last_chosen_action = chosen_action
        self.last_decision_reason = reason

        # 7. Execução através do Gateway de Ações
        exec_res = self.actions_gateway.execute_action(
            action_type="move_grid",
            params={"direction": chosen_action},
            target_window="virtual_brain_sim"
        )

        reward = 0.0
        next_obs = obs_2d
        done = False
        info = {}

        if exec_res.get("executed") or self.actions_gateway.current_mode == "controlled_environment":
            # 8. Observar resultado no ambiente 2D
            next_obs, reward, done, info = self.env_2d.step(chosen_action)

            # 9. Comparação do resultado com expectativa (Bellman TD Error)
            td_error = self.rl.update_q(
                state=state_key,
                action=chosen_action,
                reward=reward,
                next_state=next_obs["state_key"],
                learning_rate_mod=mod_factors["learning_rate_mod"]
            )

            # Repercussão neuroquímica do resultado real
            if info.get("collected_orb"):
                self.neuro.trigger_event("reward_positive", intensity=1.2)
                self.brain_regions["cortex_prefrontal"]["activation"] = 0.85
                self.brain_regions["hipocampo"]["activation"] = 0.75
            elif info.get("hit_hazard"):
                self.neuro.trigger_event("collision", intensity=1.0)
                self.brain_regions["amígdala"]["activation"] = 0.80
                self.brain_regions["locus_coeruleus"]["activation"] = 0.70
            else:
                self.neuro.update(dt=0.1)

            # 10. Registrar na Memória Episódica
            self.episodic_mem.record_experience(
                session_id=f"cycle_{self.cycle_count // 100}",
                task_name="gridworld_foraging",
                observation=obs_2d,
                action=chosen_action,
                reward=reward,
                next_observation=next_obs,
                neuro_state={k: t.current_value for k, t in self.neuro.transmitters.items()}
            )

            if done:
                self.rl.record_episode_end(self.env_2d.score)
                self.env_2d.reset()
        else:
            # Em modo de observação ou simulação
            self.neuro.update(dt=0.1)

        # 11. Atualizar Neurovisualização e Telemetria
        telemetry = self.generate_neuro_telemetry()
        self._persist_current_state()

        return {
            "cycle": self.cycle_count,
            "mode": self.actions_gateway.current_mode,
            "chosen_action": chosen_action,
            "reason": reason,
            "reward": reward,
            "env_info": info,
            "telemetry": telemetry
        }

    def generate_neuro_telemetry(self) -> Dict[str, Any]:
        """
        Gera o pacote de telemetria científica consumido pelas 4 visualizações.
        Tudo derivado do estado real e atual do agente.
        """
        now = time.time()
        da = self.neuro.transmitters["dopamine"].current_value
        na = self.neuro.transmitters["noradrenaline"].current_value
        glu = self.neuro.transmitters["glutamate"].current_value
        gaba = self.neuro.transmitters["gaba"].current_value
        cort = self.neuro.transmitters["cortisol"].current_value

        # Atualizar ativação das regiões com base no estado real
        self.brain_regions["cortex_visual"]["activation"] = round(0.2 + 0.5 * (1.0 / (1.0 + self.env_2d.get_observation()["nearest_orb_dist"])), 3)
        self.brain_regions["cortex_prefrontal"]["activation"] = round(0.3 + 0.4 * da + 0.2 * na, 3)
        self.brain_regions["gânglios_base"]["activation"] = round(0.35 + 0.45 * glu - 0.2 * gaba, 3)
        self.brain_regions["amígdala"]["activation"] = round(0.15 + 0.6 * cort, 3)
        self.brain_regions["hipocampo"]["activation"] = round(0.25 + 0.4 * self.neuro.transmitters["acetylcholine"].current_value, 3)

        # Conexões funcionais ativas entre regiões
        connections = [
            {"from": "cortex_visual", "to": "cortex_prefrontal", "weight": round(self.brain_regions["cortex_visual"]["activation"] * 0.8, 3)},
            {"from": "cortex_prefrontal", "to": "gânglios_base", "weight": round(self.brain_regions["cortex_prefrontal"]["activation"] * 0.9, 3)},
            {"from": "hipocampo", "to": "cortex_prefrontal", "weight": round(self.brain_regions["hipocampo"]["activation"] * 0.7, 3)},
            {"from": "amígdala", "to": "locus_coeruleus", "weight": round(self.brain_regions["amígdala"]["activation"] * 0.85, 3)},
            {"from": "locus_coeruleus", "to": "cortex_visual", "weight": round(na * 0.75, 3)}
        ]

        # Canais de EEG simulados derivados da taxa de ativação excitatória/inibitória
        # Ritmos Delta (0.5-4Hz), Theta (4-8Hz), Alpha (8-12Hz), Beta (12-30Hz), Gamma (30-80Hz)
        eeg_channels = {
            "F3_Prefrontal_L": round(math.sin(now * 10) * 0.4 * glu + math.sin(now * 25) * 0.3 * da, 4),
            "F4_Prefrontal_R": round(math.cos(now * 10) * 0.4 * glu + math.cos(now * 24) * 0.3 * na, 4),
            "O1_Visual_Occipital": round(math.sin(now * 12) * 0.6 * self.brain_regions["cortex_visual"]["activation"], 4),
            "C3_Motor_Central": round(math.cos(now * 18) * 0.5 * self.brain_regions["gânglios_base"]["activation"], 4),
            "T3_Temporal_Hippocampal": round(math.sin(now * 6) * 0.5 * self.brain_regions["hipocampo"]["activation"], 4)
        }

        # Mapas de calor para cortes axial, coronal e sagital (grades 8x8)
        axial_slice = self._compute_slice_matrix(plane="axial")
        coronal_slice = self._compute_slice_matrix(plane="coronal")
        sagittal_slice = self._compute_slice_matrix(plane="sagittal")

        return {
            "timestamp": now,
            "cycle": self.cycle_count,
            "regions": self.brain_regions,
            "connections": connections,
            "eeg_channels": eeg_channels,
            "slices": {
                "axial": axial_slice,
                "coronal": coronal_slice,
                "sagittal": sagittal_slice
            },
            "neurochemistry": self.neuro.get_state(),
            "env_state": self.env_2d.get_observation(),
            "rl_metrics": self.rl.get_metrics(),
            "last_action": self.last_chosen_action,
            "reason": self.last_decision_reason,
            "mode": self.actions_gateway.current_mode,
            "emergency_stop": self.actions_gateway.emergency_stop
        }

    def _compute_slice_matrix(self, plane: str) -> List[List[float]]:
        """
        Calcula matriz 8x8 de intensidade computacional representativa para cortes.
        """
        matrix = [[0.0 for _ in range(8)] for _ in range(8)]
        for r_name, r_data in self.brain_regions.items():
            px, py, pz = r_data["pos"]
            act = r_data["activation"]

            if plane == "axial":
                u, v = int((px + 1.0) * 3.5), int((py + 1.0) * 3.5)
            elif plane == "coronal":
                u, v = int((px + 1.0) * 3.5), int((pz + 1.0) * 3.5)
            else:  # sagittal
                u, v = int((py + 1.0) * 3.5), int((pz + 1.0) * 3.5)

            u = max(0, min(7, u))
            v = max(0, min(7, v))
            matrix[v][u] = min(1.0, matrix[v][u] + act * 0.7)
            # Difusão suave aos vizinhos
            for du, dv in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nu, nv = u + du, v + dv
                if 0 <= nu < 8 and 0 <= nv < 8:
                    matrix[nv][nu] = min(1.0, matrix[nv][nu] + act * 0.2)

        # Arredondar
        return [[round(cell, 3) for cell in row] for row in matrix]
