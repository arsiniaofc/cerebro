"""
Servidor Backend REST & WebSocket — Cérebro Virtual
Suporta execução via FastAPI/Uvicorn ou fallback nativo via biblioteca padrão http.server.
"""

import os
import sys
import json
import time
import asyncio
from pathlib import Path
from typing import Dict, Any

from core.brain import VirtualBrain

# Instância Global do Cérebro
brain = VirtualBrain(db_path="data/brain.db")

def create_fastapi_app():
    try:
        from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
        from fastapi.responses import HTMLResponse, JSONResponse
        from fastapi.staticfiles import StaticFiles
        from fastapi.middleware.cors import CORSMiddleware
    except ImportError:
        return None

    app = FastAPI(title="Cérebro Virtual", version="1.0.0")
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/state")
    async def get_state():
        return brain.generate_neuro_telemetry()

    @app.post("/api/step")
    async def run_step():
        result = brain.run_full_cognitive_cycle()
        return result

    @app.post("/api/mode")
    async def set_mode(payload: Dict[str, Any]):
        mode = payload.get("mode", "observation")
        confirmed = payload.get("confirmed", False)
        res = brain.actions_gateway.set_mode(mode=mode, user_confirmed=confirmed)
        return res

    @app.post("/api/emergency_stop")
    async def emergency_stop():
        return brain.actions_gateway.trigger_emergency_stop()

    @app.post("/api/emergency_reset")
    async def emergency_reset():
        brain.actions_gateway.reset_emergency_stop()
        return {"status": "emergency_stop_reset"}

    @app.get("/api/memory/all")
    async def get_all_memories():
        return {
            "working": brain.working_mem.get_state(),
            "episodic": brain.episodic_mem.get_recent(limit=30),
            "semantic": brain.semantic_mem.search(),
            "procedural": brain.procedural_mem.get_all_skills()
        }

    @app.post("/api/neuro/stimulate")
    async def stimulate_neuro(payload: Dict[str, Any]):
        event_type = payload.get("event", "reward_positive")
        intensity = float(payload.get("intensity", 1.0))
        brain.neuro.trigger_event(event_type, intensity)
        return brain.neuro.get_state()

    @app.post("/api/checkpoints/save")
    async def save_checkpoint(payload: Dict[str, Any]):
        name = payload.get("name", "checkpoint_manual")
        notes = payload.get("notes", "")
        weights = brain.rl.q_table
        metrics = brain.rl.get_metrics()
        chk_id = brain.checkpoints.create_checkpoint(name, "q_learning_table", weights, metrics, notes)
        return {"checkpoint_id": chk_id, "status": "saved"}

    @app.get("/api/checkpoints")
    async def list_checkpoints():
        return brain.checkpoints.list_all()

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        try:
            while True:
                # Se estiver no modo controlado, roda um ciclo do cérebro a cada passo
                if brain.actions_gateway.current_mode in ("controlled_environment", "simulation") and brain.running_simulation:
                    brain.run_full_cognitive_cycle()
                telemetry = brain.generate_neuro_telemetry()
                await websocket.send_json(telemetry)
                await asyncio.sleep(0.1)
        except WebSocketDisconnect:
            pass

    return app

def run_server(host: str = "127.0.0.1", port: int = 8000):
    app = create_fastapi_app()
    if app is not None:
        import uvicorn
        print(f"Iniciando Uvicorn/FastAPI em http://{host}:{port} ...")
        uvicorn.run(app, host=host, port=port, log_level="info")
    else:
        # Fallback leve caso fastapi/uvicorn não estejam instalados
        print("FastAPI não detectado. Iniciando servidor HTTP leve da biblioteca padrão Python...")
        import http.server
        import socketserver

        class FallbackHandler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory="dist", **kwargs)

            def do_GET(self):
                if self.path == "/api/state":
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    data = brain.generate_neuro_telemetry()
                    self.wfile.write(json.dumps(data).encode("utf-8"))
                else:
                    super().do_GET()

        with socketserver.TCPServer((host, port), FallbackHandler) as httpd:
            print(f"Servidor ativo em http://{host}:{port}")
            httpd.serve_forever()

if __name__ == "__main__":
    run_server()
