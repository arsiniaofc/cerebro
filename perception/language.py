"""
Módulo de Processamento de Linguagem — Cérebro Virtual
Interpretação de comandos do usuário, extração de intenções e síntese de respostas.
"""

from typing import Dict, Any, List
import re

class LanguageProcessor:
    def __init__(self):
        self.known_intents = {
            "explorar": ["explore", "navegar", "andar", "procurar", "buscar"],
            "evitar_perigo": ["desvie", "cuidado", "perigo", "pare", "obstaculo"],
            "coletar": ["pegue", "recolha", "colete", "energia", "esfera"],
            "aprender": ["aprenda", "treine", "observe", "grave", "imite"],
            "pausar": ["pause", "espere", "parar", "congelar", "stop"]
        }

    def process_instruction(self, text: str) -> Dict[str, Any]:
        """
        Parser cognitivo semântico local sem requisição de API externa.
        """
        text_lower = text.lower().strip()
        detected_intent = "geral"
        confidence = 0.5
        matched_tokens = []

        for intent, keywords in self.known_intents.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_intent = intent
                    confidence = 0.92
                    matched_tokens.append(kw)
                    break

        return {
            "input_text": text,
            "detected_intent": detected_intent,
            "confidence": confidence,
            "tokens": matched_tokens,
            "interpretation": f"Instrução mapeada para objetivo computacional '{detected_intent}'.",
            "model_type": "LocalDeterministicSemanticParser",
            "llm_loaded": False
        }

    def get_status(self) -> Dict[str, Any]:
        return {
            "adapter": "CognitiveIntentMatcher_Deterministic",
            "llm_status": "desconectado_por_padrao",
            "device": "CPU",
            "notes": "Funciona 100% offline sem custos ou chaves de API."
        }
