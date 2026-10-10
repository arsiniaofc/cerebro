"""
Módulos de Captura e Registro de Sessões — Cérebro Virtual
Grava eventos de tela, mouse, teclado e sincroniza com a linha de tempo do agente.
"""

import time
from typing import Dict, Any, List, Optional
from storage.database import BrainDatabase

class UserSessionRecorder:
    def __init__(self, db: BrainDatabase):
        self.db = db
        self.current_session_id: Optional[str] = None
        self.is_recording = False
        self.session_events: List[Dict[str, Any]] = []
        self.target_app = "Sistema Operacional / Desktop"
        self.start_mono = 0.0
        self.start_wall = 0.0

    def start_session(self, session_id: str, goal: str, target_app: str = "Desktop"):
        self.current_session_id = session_id
        self.is_recording = True
        self.session_events = []
        self.target_app = target_app
        self.start_mono = time.monotonic()
        self.start_wall = time.time()

        # Inserir no banco
        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO observation_sessions (id, started_at, ended_at, goal, target_app, event_count, status, metrics)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (session_id, self.start_wall, 0, goal, target_app, 0, "recording", "{}"))
            conn.commit()

    def record_event(self, event_type: str, data: Dict[str, Any]):
        if not self.is_recording:
            return

        now_mono = time.monotonic()
        now_wall = time.time()
        event_entry = {
            "session_id": self.current_session_id,
            "t_mono": round(now_mono - self.start_mono, 4),
            "t_wall": now_wall,
            "type": event_type,
            "data": data
        }
        self.session_events.append(event_entry)

    def pause_session(self):
        self.is_recording = False

    def resume_session(self):
        self.is_recording = True

    def stop_session(self) -> Dict[str, Any]:
        self.is_recording = False
        ended_at = time.time()

        with self.db._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE observation_sessions
                SET ended_at = ?, event_count = ?, status = 'completed'
                WHERE id = ?
            """, (ended_at, len(self.session_events), self.current_session_id))
            conn.commit()

        summary = {
            "session_id": self.current_session_id,
            "total_events": len(self.session_events),
            "duration_sec": round(ended_at - self.start_wall, 2),
            "target_app": self.target_app
        }
        return summary

    def get_events(self) -> List[Dict[str, Any]]:
        return self.session_events
