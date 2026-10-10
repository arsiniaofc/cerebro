# Cérebro Virtual — Agente Multimodal com Aprendizado Contínuo e Neurovisualização

## Visão Geral
O **Cérebro Virtual** é um agente computacional experimental inspirado em princípios da neurociência cognitiva, aprendizado por reforço e neuroimagem computacional. O sistema simula estados internos dinâmicos (incluindo neurotransmissores e hormônios simulados), constrói memórias em quatro níveis hierárquicos e disponibiliza um painel central de **Neurovisualização em Tempo Real** (Cérebro 3D, Cortes Tomográficos e EEG Simulado).

---

## Estrutura do Projeto

```
VirtualBrain/
├── start.bat                  # Inicializador rápido para Windows
├── start.py                   # Ponto de entrada Python (servidor e navegador)
├── requirements.txt           # Dependências Python recomendadas
├── README.md                  # Documentação completa
├── config/
│   ├── settings.json          # Parâmetros gerais e baselines
│   ├── models.json            # Estado real dos adaptadores
│   └── safety.json            # Modos de operação e listas de permissão
├── backend/
│   ├── app.py                 # API REST e WebSocket
│   └── websocket_manager.py   # Gerenciamento de conexões de telemetria
├── core/
│   ├── brain.py               # Núcleo orquestrador VirtualBrain (11 etapas)
│   ├── state.py               # Representação de estados
│   ├── goals.py               # Gestão de metas ativas
│   └── decision.py            # Motor de tomada de decisão
├── perception/
│   ├── vision.py              # Análise visual e representações leves
│   ├── audio.py               # Espectrograma e decomposição acústica
│   └── language.py            # Parser semântico cognitivo offline
├── capture/
│   ├── input_events.py        # Gravação de eventos de mouse, teclado e tela
│   └── timeline.py            # Sincronização temporal de playback
├── memory/
│   ├── working.py             # Memória de trabalho (capacidade Miller 7±2)
│   ├── episodic.py            # Experiências vividas (s, a, r, s')
│   ├── semantic.py            # Fatos, conceitos e relações com proveniência
│   └── procedural.py          # Rotinas motoras e habilidades consolidadas
├── learning/
│   ├── imitation.py           # Aprendizado por imitação (Behavior Cloning)
│   ├── reinforcement.py       # Q-Learning e Retorno Descontado G_t
│   └── checkpoints.py         # Versionamento, comparação e rollback
├── neurochemistry/
│   ├── transmitters.py        # 8 substâncias com equações diferenciais discretas
│   └── dynamics.py            # Modulações sobre aprendizado e atenção
├── actions/
│   ├── gateway.py             # 4 modos operacionais e parada de emergência
│   └── keyboard_mouse.py      # Camada de controle de dispositivos
├── environments/
│   └── environment_2d.py      # Gridworld 2D com esferas e obstáculos
├── storage/
│   └── database.py            # Persistência atômica em SQLite
└── tests/
    └── test_virtual_brain.py  # 15 testes automatizados obrigatórios
```

---

## Como Executar no Windows

### Atalho de Emergência
Se o mouse não responder ou você precisar desativar o agente imediatamente, utilize o atalho global de teclado:
**`Ctrl + Alt + E`**

Isso acionará a Parada de Emergência, liberará todas as entradas de teclado/mouse e colocará o agente em Modo de Observação seguro.

### Pré-requisitos
- Windows 10 ou 11 (64-bit)
- Python 3.10 ou superior (marcar "Add Python to PATH" durante a instalação)
- Aproximadamente 8 GB de RAM (GPU dedicada não é necessária)

### Passo a Passo
1. Abra o prompt de comando ou terminal na pasta do projeto.
2. (Opcional, mas recomendado) Instale as dependências:
   ```cmd
   pip install -r requirements.txt
   ```
3. Execute o inicializador:
   - Dê um duplo clique no arquivo `start.bat`, ou
   - Digite no terminal: `python start.py`
4. A interface será aberta automaticamente no seu navegador padrão em `http://127.0.0.1:8000`.

---

## Como Executar a Suíte de Testes
Para verificar a integridade de todos os subsistemas:
```bash
python -m unittest tests/test_virtual_brain.py
```

---

## Os 4 Modos de Operação
1. **Modo 1 — Observação:** O agente apenas observa a tela e telemetria, sem emitir comandos.
2. **Modo 2 — Simulação:** O agente planeja e prevê ações, exibindo o que faria sem enviar entradas.
3. **Modo 3 — Ambiente Controlado:** Ações restritas ao ambiente 2D do simulador interno.
4. **Modo 4 — Computador Autorizado:** Requer confirmação explícita do usuário, respeita lista de permissões e possui botão de parada de emergência com liberação imediata de teclas.
