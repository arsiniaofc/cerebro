# Cérebro Virtual — Agente Multimodal com Aprendizado Contínuo e Neurovisualização

Plano de arquitetura, design de interface e implementação completa do sistema experimental **Cérebro Virtual**. O projeto é estruturado em modo dual para oferecer tanto a experimentação imediata e interativa na interface web do laboratório quanto o pacote desktop executável em Windows (`start.bat`, `start.py`, SQLite e backend modular Python).

## Decisões Críticas e Alinhamento com o Usuário

> [!IMPORTANT]
> As escolhas confirmadas na fase de alinhamento orientam diretamente a implementação sem omitir qualquer requisito da especificação:
> - **Modo de Execução:** Modo Dual — Simulador e laboratório web 100% interativo e funcional no navegador, acompanhado do pacote Python completo para Windows com scripts de inicialização, testes e backend modular.
> - **Ambiente 2D Padrão de Teste:** Grade 2D de coleta de recursos e desvio de obstáculos (*Gridworld Foraging & Obstacle Avoidance*), com simulação em tempo real, visualização de ativação neural e aprendizado por reforço.
> - **Estética Visual:** Laboratório de neurociência computacional dark com superfícies obsidiana (`#07090E`), painéis slate (`#0F172A`), linhas finas e acentos de telemetria em ciano laser (`#06B6D4`), âmbar (`#F59E0B`), magenta e esmeralda.

---

## 1. Visão Geral e Conceito Central

O **Cérebro Virtual** é um agente computacional experimental inspirado na neurociência cognitiva e no aprendizado por reforço. O agente recebe estímulos multimodais (visão, áudio, linguagem e telemetria de entrada), processa representações através de módulos hierárquicos, atualiza variáveis neuroquímicas simuladas, consulta memórias persistentes (de trabalho, episódica, semântica e procedural) e toma decisões com base em metas ativas.

### Capacidades Principais
1. **Núcleo `VirtualBrain`**: Ciclo de percepção $\to$ representação $\to$ memória $\to$ neuroquímica $\to$ metas $\to$ decisão $\to$ ação $\to$ resultado $\to$ aprendizado $\to$ neurovisualização.
2. **Neurovisualização Quádrupla Sincronizada**:
   - **Cérebro 3D Interativo**: Representação 3D por WebGL nativo/Canvas com 8 regiões funcionais, conexões sinápticas dinâmicas e rotação/zoom livres.
   - **Cortes de Ressonância (Axial, Coronal e Sagital)**: Mapas de calor 2D calculados a partir das ativações reais dos módulos com fatiamento dinâmico.
   - **EEG Simulado Multicanal**: Traçados contínuos de ondas cerebrais calculadas a partir da taxa de disparo dos módulos (ritmos Delta, Theta, Alpha, Beta e Gamma).
   - **Matriz Neuroquímica**: Dinâmica de 8 transmissores (Dopamina, Noradrenalina, Serotonina, Acetilcolina, Glutamato, GABA, Cortisol e Melatonina) com equações diferenciais discretizadas.
3. **Aprendizado por Imitação e Observação**: Gravação de sessões com eventos de tela e mouse/teclado, extração de pares $(s_t, a_t)$ e clonagem comportamental com validação cruzada e replay de erros.
4. **Aprendizado por Reforço no Ambiente 2D**: Treinador autônomo com cálculo de retorno descontado $G_t = \sum \gamma^k r_{t+k}$, taxa de exploração $\epsilon$-greedy e tabelas/pesos persistentes.
5. **Memória de Longo Prazo em Quatro Camadas**: Persistência estruturada em SQLite/LocalStorage, busca semântica por correspondência de termos e retenção configurável.
6. **Segurança e 4 Modos Operacionais**: Modo Observação, Simulação, Ambiente Controlado e Computador Autorizado com botão de parada de emergência e liberação imediata de entradas.
7. **Pacote Windows Autônomo**: Estrutura de arquivos pronta com `start.bat`, `start.py`, `requirements.txt`, endpoints REST/WebSocket e suíte de testes automatizados (`tests/test_virtual_brain.py`).

---

## 2. Experiência do Usuário e Design Visual

A interface segue a identidade de um **laboratório de neurociência computacional e instrumento de telemetria científica**, respeitando as diretrizes de anti-AI slop (sem pílulas estáticas redundantes, sem números aleatórios falsos, sem títulos de código `//`).

### Sistema Tipográfico e Paleta de Cores
- **Canvas Base (60%)**: Obsidiana espacial (`#07090E` / `#0B0F19`) e superfícies grafite escuras (`#111827`).
- **Painéis e Estrutura (30%)**: Slate estrutural (`#1E293B`), bordas hairline (`rgba(148, 163, 184, 0.12)`) e separadores sutis.
- **Acentos Calibrados (10%)**: Ciano laser (`#06B6D4` para ativação visual e sensorial), Âmbar (`#F59E0B` para atenção e dopamina), Magenta (`#D946EF` para memória e plasticidade) e Esmeralda (`#10B981` para recompensa e metas).
- **Tipografia**: Interface em sans-serif geométrica precisa (`Plus Jakarta Sans` / `Inter`) e dados/métricas em numerais tabulares monoespaçados (`JetBrains Mono` com `font-mono tabular-nums`).

### Estrutura de Navegação (11 Abas Funcionais)
1. **Visão Geral**: Painel de estado mestre, modo ativo, recursos de hardware, loop de execução e gatilho de parada de emergência.
2. **Neurovisualização**: Cérebro 3D, cortes axial/coronal/sagital, EEG multicanal e linha do tempo de sincronização interativa (Play, Pause, Scrubbing).
3. **Observação e Captura**: Gravador de sessões do usuário com registro de coordenadas, cliques, teclas, aplicação em foco e linha de tempo de eventos.
4. **Importação de Mídia**: Upload e análise de imagens, vídeos e áudios com inspeção de representação vetorial, OCR básico e espectrograma acústico.
5. **Memória**: Navegador das 4 memórias (Trabalho, Episódica, Semântica e Procedural) com filtros, busca, exportação JSON e controle de retenção.
6. **Aprendizado**: Painel de clonagem comportamental (Behavior Cloning), métricas de perda, acurácia contra o humano, validação e replay de divergências.
7. **Ambiente de Testes (2D Gridworld)**: Simulador visual interativo com agente, recursos, perigos, configurações de recompensa, velocidade e controle direto.
8. **Neuroquímica**: Monitor detalhado dos 8 neurotransmissores com gráficos de evolução temporal, equações de produção/degradação e ajuste de constantes.
9. **Modelos e Recursos**: Diagnóstico transparente de adaptadores de visão, áudio e linguagem (estados: pronto, indisponível, simulado local).
10. **Experimentos e Histórico**: Gerenciador de checkpoints, métricas de treino, comparação de versões e opção de reversão segura (*rollback*).
11. **Configurações e Segurança**: Gestão de permissões de teclado/mouse, lista de janelas permitidas, parâmetros de taxa de desconto $\gamma$ e exportação do pacote Windows.

---

## 3. Decisões de Engenharia e Princípios de Arquitetura

### Decisão 1: Execução Simultânea Web + Pacote Windows
- **Abordagem**: Implementar um motor computacional completo em TypeScript/JavaScript no frontend que roda diretamente no navegador sem dependências externas, espelhando fielmente a biblioteca equivalente em Python (`VirtualBrain` em `backend/`, `core/`, `perception/`, etc.), e disponibilizar um botão para exportar ou clonar a árvore completa de arquivos Python para Windows com `start.bat`.
- **Justificativa**: Garante que o usuário possa testar todas as funcionalidades imediatamente no sandbox do AI Studio sem instalar nada, enquanto recebe a aplicação nativa completa e funcional para rodar no Windows.

### Decisão 2: Neurovisualização 3D com WebGL Nativo e Canvas 2D
- **Abordagem**: Utilizar WebGL com shaders e cálculos trigonométricos diretos para a esfera nodal do cérebro 3D e Canvas 2D de alta densidade para os cortes tomográficos (axial/coronal/sagital) e EEG.
- **Justificativa**: Dispensa dependências de CDN vulneráveis a bloqueios de rede, garante 60 FPS mesmo em computadores com 8 GB de RAM sem GPU dedicada e responde dinamicamente às ativações reais do modelo.

### Decisão 3: Simulação Neuroquímica e Equações Numéricas Estáveis
- **Abordagem**: Discretização pelo método de Euler com clipping rígido:
  $$\frac{dc_i}{dt} = P_i - k_i \cdot c_i + \sum w_{ji} \cdot c_j$$
  Garantindo que concentrações nunca fiquem negativas ou ultrapassem os limites fisiológicos computacionais $[0.0, 1.0]$.
- **Justificativa**: Evita instabilidade numérica, NaN e oscilações caóticas, gerando comportamento causal previsível onde dopamina sobe em recompensas e cortisol sobe em colisões.

---

## 4. Arquitetura do Sistema e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CÉREBRO VIRTUAL (CORE)                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [Sensores & Mídia]      [Ambiente 2D]      [Captura do Usuário]      │
│     (Imagem, Áudio)         (Gridworld)         (Mouse, Teclado)       │
│            │                     │                     │               │
│            ▼                     ▼                     ▼               │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               Módulos de Percepção & Atenção                 │     │
│   │    Visão · Audição · Linguagem · Salência de Estímulo        │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│                                  ▼                                     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                 Sistema Neuroquímico Dinâmico                │     │
│   │   Dopamina · Noradrenalina · Serotonina · Acetilcolina       │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│         ┌────────────────────────┴────────────────────────┐            │
│         ▼                                                 ▼            │
│  ┌──────────────┐                                 ┌──────────────┐     │
│  │  Memória     │                                 │ Decisão e    │     │
│  │  (Trabalho,  │                                 │ Planejamento │     │
│  │   Episódica, │                                 │ (Metas & Q)  │     │
│  │   Semântica, │                                 │              │     │
│  │   Procedural)│                                 └───────┬──────┘     │
│  └──────┬───────┘                                         │            │
│         │                                                 ▼            │
│         └────────────────────────┬────────────────────────┘            │
│                                  │                                     │
│                                  ▼                                     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │            Gateway de Ações & Segurança (4 Modos)            │     │
│   │    Observação · Simulação · Ambiente Controlado · Windows    │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│                                  ▼                                     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │             Barramento de Neurovisualização 60Hz             │     │
│   │   Cérebro 3D · Cortes Ax/Cor/Sag · EEG Simulado · Matriz     │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Plano de Entrega e Verificação

1. **Estrutura Base e Estado Reativo**:
   - Criação da máquina de estados do cérebro virtual com suporte aos 4 modos de operação e parada de emergência.
   - Motor neuroquímico com 8 substâncias e atualização a cada ciclo de relógio.
2. **Módulos de Memória e Aprendizado**:
   - Memória em 4 níveis (trabalho, episódica, semântica, procedural) persistente no navegador via LocalStorage e sincronizada com schema SQLite para Windows.
   - Motor de Aprendizado por Reforço (Q-learning com retorno descontado $G_t$).
   - Motor de Clonagem Comportamental com treino em lotes e métricas de divergência.
3. **Ambiente 2D Gridworld e Captura**:
   - Canvas interativo de grade com coleta de esferas de energia, desvio de obstáculos e velocidade ajustável.
   - Gravador de sessões simuladas/reais com registro de inputs e timestamps de alta resolução.
4. **Neurovisualização Científica**:
   - Renderizador WebGL nativo para o cérebro 3D com rotação orbital, iluminação e nós funcionais.
   - Três visualizadores de fatiamento tomográfico (Axial, Coronal e Sagital) com mapas de calor reais.
   - Osciloscópio de EEG multicanal com 5 frequências cerebrais e linha de tempo com playback.
5. **Pacote Desktop Windows Python**:
   - Criação de todos os arquivos do backend Python (`start.py`, `start.bat`, `requirements.txt`, `backend/app.py`, `core/brain.py`, etc.).
   - Suíte de testes automatizados com validação do ciclo completo (percepção $\to$ ação $\to$ recompensa $\to$ memória $\to$ neuroquímica).
