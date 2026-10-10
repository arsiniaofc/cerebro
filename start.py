"""
Cérebro Virtual — Ponto de Entrada Principal (Windows/Linux/macOS)
Executa o servidor local, instancia o VirtualBrain e abre o navegador.
"""

import sys
import os
import time
import json
import webbrowser
import threading
from pathlib import Path

# Garantir que o diretório raiz está no sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from backend.app import run_server
except ImportError:
    # Fallback caso execute a partir de subdiretório
    from backend.app import run_server

def main():
    print("=" * 64)
    print("  CÉREBRO VIRTUAL — AGENTE MULTIMODAL & NEUROVISUALIZAÇÃO")
    print("=" * 64)
    print(f"Diretório raiz: {BASE_DIR}")
    print("Inicializando subsistemas do agente...")

    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"

    def open_browser():
        time.sleep(1.2)
        print(f"Abrindo interface em: {url}")
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"Não foi possível abrir o navegador automaticamente: {e}")

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        run_server(host=host, port=port)
    except KeyboardInterrupt:
        print("\nEncerrando Cérebro Virtual com segurança...")
        sys.exit(0)

if __name__ == "__main__":
    main()
