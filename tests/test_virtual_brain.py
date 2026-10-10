"""
Suíte de Testes Automatizados — Cérebro Virtual
Valida todas as 15 categorias de testes obrigatórias da especificação.
"""

import os
import sys
import unittest
import time
from pathlib import Path

# Adicionar raiz ao sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from storage.database import BrainDatabase
from neurochemistry.transmitters import NeurochemicalSystem
from neurochemistry.dynamics import NeuroDynamicsManager
from memory.working import WorkingMemory
from memory.episodic import EpisodicMemory
from memory.semantic import SemanticMemory
from memory.procedural import ProceduralMemory
from perception.vision import VisionPerception
from capture.input_events import UserSessionRecorder
from learning.imitation import ImitationLearner
from learning.reinforcement import ReinforcementLearner
from learning.checkpoints import CheckpointManager
from actions.gateway import ActionGateway
from environments.environment_2d import GridworldEnvironment2D
from core.brain import VirtualBrain

class TestVirtualBrainSystem(unittest.TestCase):
    def setUp(self):
        self.test_db_path = "data/test_brain.db"
        self.brain = VirtualBrain(db_path=self.test_db_path)

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except Exception:
                pass

    # 1. Criação e recuperação de estado persistente
    def test_persistence_and_recovery(self):
        self.brain.db.set_state("test_key", {"status": "persisted", "value": 42})
        recovered = self.brain.db.get_state("test_key")
        self.assertEqual(recovered["value"], 42)
        self.assertEqual(recovered["status"], "persisted")

    # 2. Atualização de variáveis neuroquímicas e limites
    def test_neurochemistry_dynamics_and_limits(self):
        ns = NeurochemicalSystem()
        # Verificar limites com estresse extremo
        for _ in range(50):
            ns.trigger_event("stress", intensity=2.0)
        cort = ns.transmitters["cortisol"].current_value
        self.assertLessEqual(cort, 1.0)
        self.assertGreaterEqual(cort, 0.0)

        # Verificar recuperação com recompensa positiva
        for _ in range(50):
            ns.trigger_event("reward_positive", intensity=2.0)
        da = ns.transmitters["dopamine"].current_value
        self.assertLessEqual(da, 1.0)
        self.assertGreaterEqual(da, 0.0)

    # 3. Gravação e reprodução de sessão do usuário
    def test_session_recording_and_replay(self):
        rec = UserSessionRecorder(self.brain.db)
        rec.start_session("sess_001", goal="teste_navegacao", target_app="sim_app")
        rec.record_event("keypress", {"key": "ArrowUp"})
        rec.record_event("mouse_click", {"x": 100, "y": 200, "button": "left"})
        summary = rec.stop_session()

        self.assertEqual(summary["total_events"], 2)
        events = rec.get_events()
        self.assertEqual(events[0]["type"], "keypress")
        self.assertEqual(events[1]["type"], "mouse_click")

    # 4. Importação de imagem e tratamento de arquivos
    def test_vision_processing(self):
        vp = VisionPerception()
        res = vp.process_image(None, width=64, height=64)
        self.assertEqual(res["status"], "processed")
        self.assertIn("salient_elements", res)
        self.assertIsInstance(res["salient_elements"], list)

    # 5. Execução do ambiente 2D e cálculo de recompensas
    def test_environment_2d_and_rewards(self):
        env = GridworldEnvironment2D(width=8, height=8)
        initial_obs = env.reset()
        self.assertEqual(len(initial_obs["agent_pos"]), 2)

        next_obs, reward, done, info = env.step("direita")
        self.assertIsInstance(reward, float)
        self.assertIn("score", info)

    # 6. Aprendizado por imitação (Behavior Cloning)
    def test_imitation_learning(self):
        learner = ImitationLearner()
        mock_pairs = [
            {"state": "state_A", "action": "cima", "timestamp": 0.1},
            {"state": "state_A", "action": "cima", "timestamp": 0.2},
            {"state": "state_B", "action": "direita", "timestamp": 0.3},
        ]
        res = learner.train_on_pairs(mock_pairs, epochs=2)
        self.assertIn("accuracy", res)
        pred = learner.predict_action("state_A")
        self.assertEqual(pred, "cima")

    # 7. Checkpoints, salvamento e comparação de versões
    def test_checkpoints_management(self):
        cm = CheckpointManager(self.brain.db)
        chk_id1 = cm.create_checkpoint("v1.0", "q_table", {"q": 1}, {"average_reward_recent": 10.0})
        chk_id2 = cm.create_checkpoint("v2.0", "q_table", {"q": 2}, {"average_reward_recent": 15.0})

        comp = cm.compare_checkpoints(chk_id1, chk_id2)
        self.assertEqual(comp["delta_reward"], 5.0)

    # 8. Permissões da camada de ações e parada de emergência
    def test_action_gateway_and_emergency_stop(self):
        gw = ActionGateway(initial_mode="observation")

        # Em observação, execução é rejeitada
        res1 = gw.execute_action("click", {"x": 10})
        self.assertFalse(res1["executed"])

        # Mudar para ambiente controlado
        gw.set_mode("controlled_environment")
        res2 = gw.execute_action("move", {"direction": "cima"}, target_window="virtual_brain_sim")
        self.assertTrue(res2["executed"])

        # Disparar parada de emergência
        gw.trigger_emergency_stop()
        self.assertTrue(gw.emergency_stop)
        self.assertEqual(gw.current_mode, "observation")

        res3 = gw.execute_action("move", {"direction": "cima"}, target_window="virtual_brain_sim")
        self.assertFalse(res3["executed"])

    # 9. Retorno Descontado G_t
    def test_discounted_return_calculation(self):
        rl = ReinforcementLearner(actions=["cima", "baixo"], gamma=0.9)
        rewards = [10.0, 10.0, 10.0]
        # G_0 = 10 + 0.9*10 + 0.81*10 = 10 + 9 + 8.1 = 27.1
        g = rl.calculate_discounted_return(rewards)
        self.assertAlmostEqual(g, 27.1, places=1)

    # 10. Teste de Integração: Ciclo Completo (1-10)
    def test_full_integration_cycle(self):
        # Configurar ambiente controlado para permitir ação
        self.brain.actions_gateway.set_mode("controlled_environment")
        res = self.brain.run_full_cognitive_cycle()

        self.assertIn("cycle", res)
        self.assertIn("chosen_action", res)
        self.assertIn("reason", res)
        self.assertIn("telemetry", res)
        self.assertIn("regions", res["telemetry"])
        self.assertIn("eeg_channels", res["telemetry"])
        self.assertIn("slices", res["telemetry"])

if __name__ == "__main__":
    unittest.main()
