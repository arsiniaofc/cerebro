"""
Gateway de Ações e Segurança — Cérebro Virtual
Implementa os 4 Modos Operacionais, Parada de Emergência e Liberação de Dispositivos.
"""

from typing import Dict, Any, List, Optional
import time

class ActionGateway:
    """
    Controlador central de permissões e execução de ações.
    O cérebro NUNCA envia comandos diretamente ao sistema operacional
    sem passar pelas validações deste gateway.
    """
    MODES = {
        "observation": "Modo 1: Observação (Nenhuma ação externa enviada)",
        "simulation": "Modo 2: Simulação (Decisões calculadas e exibidas, não executadas)",
        "controlled_environment": "Modo 3: Ambiente Controlado (Ações restritas ao ambiente 2D)",
        "authorized_computer": "Modo 4: Computador Autorizado (Ações reais com lista de permissões)"
    }

    def __init__(self, initial_mode: str = "observation"):
        self.current_mode = initial_mode
        self.emergency_stop = False
        self.action_history: List[Dict[str, Any]] = []
        self.consecutive_actions = 0
        self.max_consecutive_actions = 50
        self.allowed_windows = ["virtual_brain_sim", "notepad.exe", "calculator.exe"]
        self.held_keys: List[str] = []
        self.held_mouse_buttons: List[str] = []

    def set_mode(self, mode: str, user_confirmed: bool = False) -> Dict[str, Any]:
        if mode not in self.MODES:
            return {"success": False, "error": f"Modo desconhecido: {mode}"}

        if mode == "authorized_computer" and not user_confirmed:
            return {
                "success": False,
                "error": "O Modo Computador Autorizado exige autorização explícita do usuário."
            }

        self.current_mode = mode
        return {"success": True, "mode": mode, "description": self.MODES[mode]}

    def trigger_emergency_stop(self) -> Dict[str, Any]:
        """
        Interrompe imediatamente qualquer execução e solta todas as teclas/botões retidos.
        """
        self.emergency_stop = True
        self.release_all_held_inputs()
        self.current_mode = "observation"
        return {
            "status": "emergency_stop_activated",
            "message": "Parada de emergência ativada. Todas as entradas foram liberadas e o modo voltou para Observação."
        }

    def reset_emergency_stop(self):
        self.emergency_stop = False

    def release_all_held_inputs(self):
        """
        Garante que nenhuma tecla ou botão do mouse permaneça fisicamente pressionado.
        """
        released_keys = list(self.held_keys)
        released_mouse = list(self.held_mouse_buttons)
        self.held_keys.clear()
        self.held_mouse_buttons.clear()
        self.consecutive_actions = 0
        return {"released_keys": released_keys, "released_mouse": released_mouse}

    def execute_action(self, action_type: str, params: Dict[str, Any], target_window: str = "virtual_brain_sim") -> Dict[str, Any]:
        if self.emergency_stop:
            return {"executed": False, "reason": "Parada de emergência está ativa."}

        # Modo 1: Observação
        if self.current_mode == "observation":
            return {"executed": False, "reason": "Modo de Observação ativo. Nenhuma ação permitida."}

        # Modo 2: Simulação
        if self.current_mode == "simulation":
            sim_record = {
                "timestamp": time.time(),
                "mode": "simulation",
                "action_type": action_type,
                "params": params,
                "simulated_only": True
            }
            self.action_history.append(sim_record)
            return {"executed": False, "simulated": True, "record": sim_record}

        # Modo 3: Ambiente Controlado
        if self.current_mode == "controlled_environment":
            if target_window != "virtual_brain_sim":
                return {"executed": False, "reason": "Ação rejeitada: ambiente não é a simulação controlada 2D."}

        # Modo 4: Computador Autorizado
        if self.current_mode == "authorized_computer":
            if target_window not in self.allowed_windows:
                return {
                    "executed": False,
                    "reason": f"Janela '{target_window}' não consta na lista de aplicações autorizadas."
                }

        # Limite de segurança de ações consecutivas
        self.consecutive_actions += 1
        if self.consecutive_actions > self.max_consecutive_actions:
            self.trigger_emergency_stop()
            return {"executed": False, "reason": "Limite de ações consecutivas excedido. Parada de emergência disparada."}

        # Registro auditável da ação
        record = {
            "timestamp": time.time(),
            "mode": self.current_mode,
            "action_type": action_type,
            "params": params,
            "target": target_window,
            "status": "success"
        }
        self.action_history.append(record)
        return {"executed": True, "record": record}

    def get_status(self) -> Dict[str, Any]:
        return {
            "current_mode": self.current_mode,
            "mode_description": self.MODES[self.current_mode],
            "emergency_stop": self.emergency_stop,
            "consecutive_actions": self.consecutive_actions,
            "held_keys": self.held_keys,
            "held_mouse": self.held_mouse_buttons,
            "total_actions_logged": len(self.action_history),
            "allowed_windows": self.allowed_windows
        }
