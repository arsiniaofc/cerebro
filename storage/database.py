"""
Módulo de Persistência SQLite — Cérebro Virtual
Garante armazenamento atômico, recuperação de estado e histórico estruturado.
"""

import sqlite3
import json
import time
import os
from pathlib import Path
from typing import Dict, Any, List, Optional

class BrainDatabase:
    def __init__(self, db_path: str = "data/brain.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Estado persistente do cérebro
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS brain_state (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at REAL
                )
            """)

            # Memória Episódica
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS episodic_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    timestamp REAL,
                    task_name TEXT,
                    observation_summary TEXT,
                    action_taken TEXT,
                    reward REAL,
                    next_observation_summary TEXT,
                    neuro_state TEXT,
                    metadata TEXT
                )
            """)

            # Memória Semântica
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS semantic_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    concept TEXT UNIQUE,
                    definition TEXT,
                    confidence REAL,
                    source TEXT,
                    associations TEXT,
                    updated_at REAL
                )
            """)

            # Memória Procedural
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS procedural_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_name TEXT UNIQUE,
                    condition_trigger TEXT,
                    action_sequence TEXT,
                    success_rate REAL,
                    total_executions INTEGER,
                    updated_at REAL
                )
            """)

            # Sessões de Observação do Usuário
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS observation_sessions (
                    id TEXT PRIMARY KEY,
                    started_at REAL,
                    ended_at REAL,
                    goal TEXT,
                    target_app TEXT,
                    event_count INTEGER,
                    status TEXT,
                    metrics TEXT
                )
            """)

            # Eventos brutos da sessão
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS session_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT,
                    timestamp_mono REAL,
                    timestamp_wall REAL,
                    event_type TEXT,
                    data TEXT,
                    FOREIGN KEY(session_id) REFERENCES observation_sessions(id)
                )
            """)

            # Checkpoints de Aprendizado
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS checkpoints (
                    id TEXT PRIMARY KEY,
                    version_name TEXT,
                    created_at REAL,
                    model_type TEXT,
                    metrics TEXT,
                    weights_json TEXT,
                    notes TEXT
                )
            """)

            conn.commit()

    def set_state(self, key: str, value: Any):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            val_str = json.dumps(value)
            now = time.time()
            cursor.execute("""
                INSERT INTO brain_state (key, value, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
            """, (key, val_str, now))
            conn.commit()

    def get_state(self, key: str, default: Any = None) -> Any:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM brain_state WHERE key = ?", (key,))
            row = cursor.fetchone()
            if row:
                return json.loads(row["value"])
            return default

    # Métodos para Memória Episódica
    def add_episodic_record(self, session_id: str, task_name: str, obs: Any, action: Any,
                           reward: float, next_obs: Any, neuro_state: Dict[str, float],
                           meta: Optional[Dict] = None) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO episodic_memory (session_id, timestamp, task_name, observation_summary,
                                             action_taken, reward, next_observation_summary,
                                             neuro_state, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, time.time(), task_name,
                json.dumps(obs) if not isinstance(obs, str) else obs,
                json.dumps(action) if not isinstance(action, str) else action,
                reward,
                json.dumps(next_obs) if not isinstance(next_obs, str) else next_obs,
                json.dumps(neuro_state),
                json.dumps(meta or {})
            ))
            conn.commit()
            return cursor.lastrowid

    def get_recent_episodes(self, limit: int = 50) -> List[Dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM episodic_memory ORDER BY id DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    # Métodos para Memória Semântica
    def upsert_semantic_concept(self, concept: str, definition: str, confidence: float, source: str, associations: List[str]):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO semantic_memory (concept, definition, confidence, source, associations, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(concept) DO UPDATE SET
                    definition=excluded.definition,
                    confidence=excluded.confidence,
                    source=excluded.source,
                    associations=excluded.associations,
                    updated_at=excluded.updated_at
            """, (concept, definition, confidence, source, json.dumps(associations), time.time()))
            conn.commit()

    def get_semantic_concepts(self, query: str = "") -> List[Dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if query:
                cursor.execute("""
                    SELECT * FROM semantic_memory WHERE concept LIKE ? OR definition LIKE ?
                """, (f"%{query}%", f"%{query}%"))
            else:
                cursor.execute("SELECT * FROM semantic_memory ORDER BY confidence DESC")
            return [dict(r) for r in cursor.fetchall()]

    # Métodos para Memória Procedural
    def upsert_procedural_skill(self, skill_name: str, trigger: str, actions: List[Any], success_rate: float):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO procedural_memory (skill_name, condition_trigger, action_sequence, success_rate, total_executions, updated_at)
                VALUES (?, ?, ?, ?, 1, ?)
                ON CONFLICT(skill_name) DO UPDATE SET
                    condition_trigger=excluded.condition_trigger,
                    action_sequence=excluded.action_sequence,
                    success_rate=excluded.success_rate,
                    total_executions=procedural_memory.total_executions + 1,
                    updated_at=excluded.updated_at
            """, (skill_name, trigger, json.dumps(actions), success_rate, time.time()))
            conn.commit()

    def get_procedural_skills(self) -> List[Dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM procedural_memory ORDER BY success_rate DESC")
            return [dict(r) for r in cursor.fetchall()]

    # Checkpoints
    def save_checkpoint(self, checkpoint_id: str, version_name: str, model_type: str, metrics: Dict, weights_json: str, notes: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO checkpoints (id, version_name, created_at, model_type, metrics, weights_json, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (checkpoint_id, version_name, time.time(), model_type, json.dumps(metrics), weights_json, notes))
            conn.commit()

    def list_checkpoints(self) -> List[Dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, version_name, created_at, model_type, metrics, notes FROM checkpoints ORDER BY created_at DESC")
            return [dict(r) for r in cursor.fetchall()]
