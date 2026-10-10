import {
  BrainTelemetry,
  BrainRegion,
  OperatingMode,
  EpisodicMemoryItem,
  SemanticConcept,
  ProceduralSkill,
  CheckpointRecord,
  SessionEvent,
  GridworldObservation,
  WorkingMemoryItem
} from '../types/brain';

export class BrainEngineService {
  private static instance: BrainEngineService;

  public mode: OperatingMode = 'observation';
  public emergencyStop: boolean = false;
  public cycleCount: number = 0;
  public simulationRunning: boolean = true;
  public simulationSpeedMs: number = 200;

  // Neuroquímica (8 substâncias)
  public neurochemistry: Record<string, {
    name: string;
    symbol: string;
    value: number;
    baseline: number;
    min: number;
    max: number;
    history: number[];
    description: string;
  }> = {
    dopamine: {
      name: 'Dopamina',
      symbol: 'DA',
      value: 0.35,
      baseline: 0.35,
      min: 0.0,
      max: 1.0,
      history: [0.35],
      description: 'Sinal de recompensa prevista, erro de predição temporal (TD) e reforço.'
    },
    noradrenaline: {
      name: 'Noradrenalina',
      symbol: 'NA',
      value: 0.30,
      baseline: 0.30,
      min: 0.0,
      max: 1.0,
      history: [0.30],
      description: 'Alerta, resposta a novidades e regulação da taxa de exploração.'
    },
    serotonin: {
      name: 'Serotonina',
      symbol: '5-HT',
      value: 0.50,
      baseline: 0.50,
      min: 0.0,
      max: 1.0,
      history: [0.50],
      description: 'Modulador de estabilidade emocional, persistência e moderação de risco.'
    },
    acetylcholine: {
      name: 'Acetilcolina',
      symbol: 'ACh',
      value: 0.40,
      baseline: 0.40,
      min: 0.0,
      max: 1.0,
      history: [0.40],
      description: 'Foco atencional, processamento de novas pistas e plasticidade de codificação.'
    },
    glutamate: {
      name: 'Glutamato',
      symbol: 'Glu',
      value: 0.45,
      baseline: 0.45,
      min: 0.0,
      max: 1.0,
      history: [0.45],
      description: 'Transmissão excitatória principal e disparo neural computacional.'
    },
    gaba: {
      name: 'GABA',
      symbol: 'GABA',
      value: 0.45,
      baseline: 0.45,
      min: 0.0,
      max: 1.0,
      history: [0.45],
      description: 'Inibição seletiva, controle de impulsos e contenção de hiperexcitabilidade.'
    },
    cortisol: {
      name: 'Cortisol',
      symbol: 'CORT',
      value: 0.20,
      baseline: 0.20,
      min: 0.0,
      max: 1.0,
      history: [0.20],
      description: 'Indicador computacional de estresse, colisões repetidas e carga cognitiva.'
    },
    melatonin: {
      name: 'Melatonina',
      symbol: 'MEL',
      value: 0.15,
      baseline: 0.15,
      min: 0.0,
      max: 1.0,
      history: [0.15],
      description: 'Ciclo circadiano simulado, consolidação de memória e repouso.'
    }
  };

  // Regiões do Cérebro 3D
  public brainRegions: Record<string, BrainRegion> = {
    cortex_visual: { name: 'Córtex Visual', pos: [0.0, -0.65, -0.15], activation: 0.32, module: 'Visão' },
    cortex_auditivo: { name: 'Córtex Auditivo', pos: [-0.62, 0.0, -0.08], activation: 0.24, module: 'Audição' },
    area_linguagem: { name: 'Área de Linguagem', pos: [-0.50, 0.35, 0.12], activation: 0.28, module: 'Linguagem' },
    cortex_prefrontal: { name: 'Córtex Pré-Frontal', pos: [0.0, 0.82, 0.25], activation: 0.52, module: 'Decisão & Metas' },
    hipocampo: { name: 'Hipocampo', pos: [0.12, -0.10, -0.32], activation: 0.41, module: 'Memória Episódica' },
    ganglios_base: { name: 'Gânglios da Base', pos: [0.0, 0.15, -0.18], activation: 0.44, module: 'Procedural & Ações' },
    amigdala: { name: 'Amígdala', pos: [-0.32, -0.12, -0.38], activation: 0.22, module: 'Alerta de Risco' },
    locus_coeruleus: { name: 'Locus Coeruleus', pos: [0.0, -0.42, -0.52], activation: 0.30, module: 'Noradrenalina & Foco' }
  };

  // Ambiente 2D
  public envGrid = {
    width: 10,
    height: 10,
    agent_pos: [1, 1] as [number, number],
    orbs: [[3, 2], [7, 4], [2, 7], [8, 8]] as [number, number][],
    hazards: [[4, 4], [5, 4], [4, 5], [1, 5], [7, 2]] as [number, number][],
    step: 0,
    score: 0,
    orbsCollected: 0,
    hazardHits: 0
  };

  // RL Q-Learning
  public qTable: Record<string, Record<string, number>> = {};
  public actionsList = ['cima', 'baixo', 'esquerda', 'direita'];
  public gamma: number = 0.95;
  public alpha: number = 0.15;
  public epsilon: number = 0.20;
  public recentRewards: number[] = [0];
  public lastAction: string = 'observar';
  public lastReason: string = 'Inicialização do núcleo cognitivo.';

  // Memórias
  public workingMemory: WorkingMemoryItem[] = [
    { type: 'goal', content: 'Localizar esferas de energia no quadrante leste', importance: 0.9, timestamp: Date.now() },
    { type: 'context', content: 'Obstáculo detectado na coordenada (4, 4)', importance: 0.7, timestamp: Date.now() - 2000 }
  ];

  public episodicMemory: EpisodicMemoryItem[] = [];
  public semanticMemory: SemanticConcept[] = [
    { id: 1, concept: 'Esfera_Energia', definition: 'Gera reforço positivo (+10.0) e eleva a dopamina computacional.', confidence: 0.98, source: 'regras_ambiente_2d', associations: ['recompensa', 'meta', 'dopamina'], updated_at: Date.now() },
    { id: 2, concept: 'Obstaculo_Hazard', definition: 'Colisões penalizam (-5.0) e disparam surto agudo de cortisol.', confidence: 0.95, source: 'regras_ambiente_2d', associations: ['colisao', 'perigo', 'cortisol'], updated_at: Date.now() },
    { id: 3, concept: 'Desconto_Temporal_Gamma', definition: 'G_t = sum(gamma^k * r_{t+k}) pondera recompensas futuras.', confidence: 0.92, source: 'algoritmo_rl', associations: ['gamma', 'bellman', 'retorno'], updated_at: Date.now() },
    { id: 4, concept: 'GABA_Inibicao', definition: 'Filtra ações impulsivas e reduz probabilidade de comandos erráticos.', confidence: 0.90, source: 'neuroquimica', associations: ['inibicao', 'estabilidade'], updated_at: Date.now() }
  ];

  public proceduralMemory: ProceduralSkill[] = [
    { id: 1, skill_name: 'Desvio_Frontal', condition_trigger: 'obstaculo_a_1_casa', action_sequence: ['rotacionar_90', 'avancar'], success_rate: 0.91, total_executions: 28, updated_at: Date.now() },
    { id: 2, skill_name: 'Aproximacao_Orb', condition_trigger: 'orb_alinhado_vetorial', action_sequence: ['passo_direcional'], success_rate: 0.94, total_executions: 45, updated_at: Date.now() },
    { id: 3, skill_name: 'Freada_Emergencial', condition_trigger: 'limite_da_grade', action_sequence: ['parar_movimento'], success_rate: 0.99, total_executions: 14, updated_at: Date.now() }
  ];

  // Checkpoints
  public checkpoints: CheckpointRecord[] = [
    { id: 'chk_init', version_name: 'v1.0-Baseline', created_at: Date.now() - 3600000, model_type: 'q_learning_table', metrics: { average_reward_recent: 1.2, accuracy: 0.65, q_states_count: 14 }, notes: 'Estado inicial com pesos neutros' }
  ];

  // Sessões de observação gravadas
  public recordedSessions: { id: string; goal: string; targetApp: string; events: SessionEvent[]; date: string }[] = [];
  public currentRecordingSession: { id: string; goal: string; targetApp: string; events: SessionEvent[]; startTime: number } | null = null;

  // Timeline histórico para Neurovisualização (buffer circular)
  public telemetryTimeline: BrainTelemetry[] = [];
  private maxTimelineSize = 100;

  private constructor() {
    this.loadFromStorage();
    // Executa alguns passos iniciais
    for (let i = 0; i < 5; i++) {
      this.stepCycle();
    }
  }

  public static getInstance(): BrainEngineService {
    if (!BrainEngineService.instance) {
      BrainEngineService.instance = new BrainEngineService();
    }
    return BrainEngineService.instance;
  }

  public setMode(newMode: OperatingMode, confirmed: boolean = false): { success: boolean; message: string } {
    if (newMode === 'authorized_computer' && !confirmed) {
      return { success: false, message: 'O Modo Computador Autorizado exige confirmação explícita no diálogo de segurança.' };
    }
    this.mode = newMode;
    return { success: true, message: `Modo alterado com sucesso para ${newMode}.` };
  }

  public triggerEmergencyStop(): void {
    this.emergencyStop = true;
    this.mode = 'observation';
    this.neurochemistry.cortisol.value = Math.min(1.0, this.neurochemistry.cortisol.value + 0.35);
    this.neurochemistry.gaba.value = Math.min(1.0, this.neurochemistry.gaba.value + 0.40);
  }

  public resetEmergencyStop(): void {
    this.emergencyStop = false;
  }

  // Ciclo Cognitivo Completo
  public stepCycle(): BrainTelemetry {
    this.cycleCount++;

    const obs = this.getEnvObservation();
    const stateKey = obs.state_key;

    // 1. Modulação Neuroquímica sobre Exploração e Aprendizado
    const da = this.neurochemistry.dopamine.value;
    const na = this.neurochemistry.noradrenaline.value;
    const cort = this.neurochemistry.cortisol.value;
    const ht5 = this.neurochemistry.serotonin.value;
    const gaba = this.neurochemistry.gaba.value;
    const glu = this.neurochemistry.glutamate.value;

    const lrMod = Math.max(0.2, (da * 1.5 + this.neurochemistry.acetylcholine.value) / (1.0 + cort * 0.8));
    const explorMod = Math.max(0.1, (na * 1.8) / (0.5 + ht5 * 1.2));

    // 2. Seleção de Ação (Q-Learning / Epsilon-Greedy)
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = { cima: 0, baixo: 0, esquerda: 0, direita: 0 };
    }

    const effectiveEps = Math.min(0.9, this.epsilon * explorMod);
    let chosenAction = 'cima';
    let reason = '';

    if (Math.random() < effectiveEps) {
      chosenAction = this.actionsList[Math.floor(Math.random() * this.actionsList.length)];
      reason = `Exploração estocástica (epsilon efetivo=${effectiveEps.toFixed(2)}, noradrenalina=${na.toFixed(2)})`;
    } else {
      const qVals = this.qTable[stateKey];
      let maxQ = -Infinity;
      const bestActions: string[] = [];
      for (const [act, val] of Object.entries(qVals)) {
        if (val > maxQ) {
          maxQ = val;
          bestActions.length = 0;
          bestActions.push(act);
        } else if (val === maxQ) {
          bestActions.push(act);
        }
      }
      chosenAction = bestActions[Math.floor(Math.random() * bestActions.length)] || 'cima';
      reason = `Explotação Q-valor máximo (${maxQ.toFixed(2)}) para ação '${chosenAction}'`;
    }

    this.lastAction = chosenAction;
    this.lastReason = reason;

    // 3. Execução se permitido
    let reward = 0;
    if (!this.emergencyStop && (this.mode === 'controlled_environment' || this.mode === 'simulation')) {
      const execResult = this.stepEnvironment(chosenAction);
      reward = execResult.reward;

      // Bellman Update Q(s, a) <- Q(s, a) + alpha * [r + gamma * max Q(s', a') - Q(s, a)]
      const nextObs = this.getEnvObservation();
      if (!this.qTable[nextObs.state_key]) {
        this.qTable[nextObs.state_key] = { cima: 0, baixo: 0, esquerda: 0, direita: 0 };
      }
      const maxNextQ = Math.max(...Object.values(this.qTable[nextObs.state_key]));
      const tdTarget = reward + this.gamma * maxNextQ;
      const tdError = tdTarget - this.qTable[stateKey][chosenAction];
      this.qTable[stateKey][chosenAction] += (this.alpha * lrMod) * tdError;

      // Repercussões Neuroquímicas
      if (execResult.collected) {
        this.neurochemistry.dopamine.value = Math.min(1.0, this.neurochemistry.dopamine.value + 0.32);
        this.neurochemistry.serotonin.value = Math.min(1.0, this.neurochemistry.serotonin.value + 0.15);
        this.neurochemistry.cortisol.value = Math.max(0.05, this.neurochemistry.cortisol.value - 0.15);
      } else if (execResult.hitHazard) {
        this.neurochemistry.dopamine.value = Math.max(0.05, this.neurochemistry.dopamine.value - 0.25);
        this.neurochemistry.cortisol.value = Math.min(1.0, this.neurochemistry.cortisol.value + 0.35);
        this.neurochemistry.noradrenaline.value = Math.min(1.0, this.neurochemistry.noradrenaline.value + 0.28);
      }

      // Registro de Memória Episódica
      if (this.episodicMemory.length > 200) this.episodicMemory.pop();
      this.episodicMemory.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        session_id: `cycle_${Math.floor(this.cycleCount / 50)}`,
        timestamp: Date.now(),
        task_name: 'gridworld_foraging',
        observation_summary: `Agente em (${obs.agent_pos[0]}, ${obs.agent_pos[1]}) | Orb mais prox: ${obs.nearest_orb_dist.toFixed(1)}`,
        action_taken: chosenAction,
        reward: reward,
        next_observation_summary: `Agente em (${nextObs.agent_pos[0]}, ${nextObs.agent_pos[1]})`,
        neuro_state: {
          dopamine: this.neurochemistry.dopamine.value,
          noradrenaline: this.neurochemistry.noradrenaline.value,
          cortisol: this.neurochemistry.cortisol.value
        }
      });
    }

    // 4. Decaimento das variáveis neuroquímicas em direção aos baselines
    for (const key of Object.keys(this.neurochemistry)) {
      const chem = this.neurochemistry[key];
      chem.value += -0.04 * (chem.value - chem.baseline);
      chem.value = Math.max(chem.min, Math.min(chem.max, chem.value));
      chem.history.push(Number(chem.value.toFixed(3)));
      if (chem.history.length > 60) chem.history.shift();
    }

    // 5. Atualizar Ativação das Regiões do Cérebro
    this.brainRegions.cortex_visual.activation = Math.min(1.0, 0.25 + 0.5 * (1.0 / (1.0 + obs.nearest_orb_dist)));
    this.brainRegions.cortex_prefrontal.activation = Math.min(1.0, 0.30 + 0.45 * this.neurochemistry.dopamine.value + 0.2 * na);
    this.brainRegions.ganglios_base.activation = Math.min(1.0, 0.35 + 0.45 * glu - 0.25 * gaba);
    this.brainRegions.amigdala.activation = Math.min(1.0, 0.15 + 0.65 * this.neurochemistry.cortisol.value);
    this.brainRegions.hipocampo.activation = Math.min(1.0, 0.25 + 0.45 * this.neurochemistry.acetylcholine.value);
    this.brainRegions.locus_coeruleus.activation = Math.min(1.0, 0.20 + 0.60 * na);

    // 6. Conexões neurais dinâmicas
    const connections = [
      { from: 'cortex_visual', to: 'cortex_prefrontal', weight: Number((this.brainRegions.cortex_visual.activation * 0.85).toFixed(2)) },
      { from: 'cortex_prefrontal', to: 'ganglios_base', weight: Number((this.brainRegions.cortex_prefrontal.activation * 0.90).toFixed(2)) },
      { from: 'hipocampo', to: 'cortex_prefrontal', weight: Number((this.brainRegions.hipocampo.activation * 0.75).toFixed(2)) },
      { from: 'amigdala', to: 'locus_coeruleus', weight: Number((this.brainRegions.amigdala.activation * 0.85).toFixed(2)) },
      { from: 'locus_coeruleus', to: 'cortex_visual', weight: Number((na * 0.80).toFixed(2)) }
    ];

    // 7. Canais de EEG simulados
    const now = Date.now() / 1000;
    const eeg_channels = {
      F3_Prefrontal_L: Number((Math.sin(now * 10) * 0.4 * glu + Math.sin(now * 24) * 0.3 * da).toFixed(4)),
      F4_Prefrontal_R: Number((Math.cos(now * 10) * 0.4 * glu + Math.cos(now * 22) * 0.3 * na).toFixed(4)),
      O1_Visual_Occipital: Number((Math.sin(now * 12) * 0.6 * this.brainRegions.cortex_visual.activation).toFixed(4)),
      C3_Motor_Central: Number((Math.cos(now * 18) * 0.5 * this.brainRegions.ganglios_base.activation).toFixed(4)),
      T3_Temporal_Hippocampal: Number((Math.sin(now * 6) * 0.5 * this.brainRegions.hipocampo.activation).toFixed(4))
    };

    // 8. Cortes tomográficos (Axial, Coronal, Sagital) matrizes 8x8
    const slices = {
      axial: this.computeSliceMatrix('axial'),
      coronal: this.computeSliceMatrix('coronal'),
      sagittal: this.computeSliceMatrix('sagittal')
    };

    const telemetry: BrainTelemetry = {
      timestamp: Date.now(),
      cycle: this.cycleCount,
      regions: { ...this.brainRegions },
      connections,
      eeg_channels,
      slices,
      neurochemistry: JSON.parse(JSON.stringify(this.neurochemistry)),
      env_state: obs,
      rl_metrics: {
        total_steps: this.envGrid.step,
        q_states_count: Object.keys(this.qTable).length,
        episodes_count: Math.floor(this.cycleCount / 100) + 1,
        average_reward_recent: Number((this.recentRewards.reduce((a, b) => a + b, 0) / Math.max(1, this.recentRewards.length)).toFixed(2)),
        recent_rewards: this.recentRewards.slice(-15),
        gamma: this.gamma,
        alpha: this.alpha,
        epsilon: this.epsilon
      },
      last_action: chosenAction,
      reason,
      mode: this.mode,
      emergency_stop: this.emergencyStop
    };

    this.telemetryTimeline.push(telemetry);
    if (this.telemetryTimeline.length > this.maxTimelineSize) {
      this.telemetryTimeline.shift();
    }

    if (this.cycleCount % 20 === 0) {
      this.saveToStorage();
    }

    return telemetry;
  }

  // Ações Manuais ou do Ambiente
  public stepEnvironment(action: string): { reward: number; collected: boolean; hitHazard: boolean } {
    this.envGrid.step++;
    const actionDelta: Record<string, [number, number]> = {
      cima: [0, -1],
      baixo: [0, 1],
      esquerda: [-1, 0],
      direita: [1, 0]
    };

    const [dx, dy] = actionDelta[action] || [0, 0];
    const nx = Math.max(0, Math.min(this.envGrid.width - 1, this.envGrid.agent_pos[0] + dx));
    const ny = Math.max(0, Math.min(this.envGrid.height - 1, this.envGrid.agent_pos[1] + dy));

    let reward = -0.1; // Custo por passo
    let hitHazard = false;
    let collected = false;

    // Colisão com obstáculo
    const isHazard = this.envGrid.hazards.some(h => h[0] === nx && h[1] === ny);
    if (isHazard) {
      reward -= 5.0;
      this.envGrid.hazardHits++;
      hitHazard = true;
    } else {
      this.envGrid.agent_pos = [nx, ny];
    }

    // Coleta de esfera de energia
    const orbIdx = this.envGrid.orbs.findIndex(o => o[0] === this.envGrid.agent_pos[0] && o[1] === this.envGrid.agent_pos[1]);
    if (orbIdx !== -1) {
      reward += 10.0;
      collected = true;
      this.envGrid.orbsCollected++;
      this.envGrid.orbs.splice(orbIdx, 1);
      // Respawn em local desocupado
      let newX = Math.floor(Math.random() * this.envGrid.width);
      let newY = Math.floor(Math.random() * this.envGrid.height);
      this.envGrid.orbs.push([newX, newY]);
    }

    this.envGrid.score += reward;
    this.recentRewards.push(reward);
    if (this.recentRewards.length > 50) this.recentRewards.shift();

    return { reward, collected, hitHazard };
  }

  public getEnvObservation(): GridworldObservation {
    const ax = this.envGrid.agent_pos[0];
    const ay = this.envGrid.agent_pos[1];

    let nearestOrbDist = 999;
    for (const orb of this.envGrid.orbs) {
      const d = Math.abs(ax - orb[0]) + Math.abs(ay - orb[1]);
      if (d < nearestOrbDist) nearestOrbDist = d;
    }

    let nearestHazardDist = 999;
    for (const haz of this.envGrid.hazards) {
      const d = Math.abs(ax - haz[0]) + Math.abs(ay - haz[1]);
      if (d < nearestHazardDist) nearestHazardDist = d;
    }

    const stateKey = `x${ax}_y${ay}_orb${Math.min(5, Math.floor(nearestOrbDist))}_haz${Math.min(3, Math.floor(nearestHazardDist))}`;

    return {
      agent_pos: [...this.envGrid.agent_pos],
      orbs: this.envGrid.orbs.map(o => [...o]),
      hazards: this.envGrid.hazards.map(h => [...h]),
      grid_size: [this.envGrid.width, this.envGrid.height],
      nearest_orb_dist: nearestOrbDist,
      nearest_hazard_dist: nearestHazardDist,
      state_key: stateKey,
      step: this.envGrid.step,
      score: Number(this.envGrid.score.toFixed(1))
    };
  }

  private computeSliceMatrix(plane: 'axial' | 'coronal' | 'sagittal'): number[][] {
    const matrix: number[][] = Array.from({ length: 8 }, () => Array(8).fill(0.04));
    for (const region of Object.values(this.brainRegions)) {
      const [px, py, pz] = region.pos;
      const act = region.activation;
      let u = 0, v = 0;
      if (plane === 'axial') {
        u = Math.floor((px + 1.0) * 3.5);
        v = Math.floor((py + 1.0) * 3.5);
      } else if (plane === 'coronal') {
        u = Math.floor((px + 1.0) * 3.5);
        v = Math.floor((pz + 1.0) * 3.5);
      } else {
        u = Math.floor((py + 1.0) * 3.5);
        v = Math.floor((pz + 1.0) * 3.5);
      }
      u = Math.max(0, Math.min(7, u));
      v = Math.max(0, Math.min(7, v));
      matrix[v][u] = Math.min(1.0, matrix[v][u] + act * 0.7);
      // Vizinhos
      for (const [du, dv] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nu = u + du, nv = v + dv;
        if (nu >= 0 && nu < 8 && nv >= 0 && nv < 8) {
          matrix[nv][nu] = Math.min(1.0, matrix[nv][nu] + act * 0.25);
        }
      }
    }
    return matrix.map(row => row.map(cell => Number(cell.toFixed(3))));
  }

  // Estimulação neuroquímica causal
  public stimulate(event: string, intensity: number = 1.0) {
    if (event === 'reward_positive') {
      this.neurochemistry.dopamine.value = Math.min(1.0, this.neurochemistry.dopamine.value + 0.35 * intensity);
      this.neurochemistry.serotonin.value = Math.min(1.0, this.neurochemistry.serotonin.value + 0.20 * intensity);
      this.neurochemistry.cortisol.value = Math.max(0.05, this.neurochemistry.cortisol.value - 0.20 * intensity);
    } else if (event === 'stress') {
      this.neurochemistry.cortisol.value = Math.min(1.0, this.neurochemistry.cortisol.value + 0.40 * intensity);
      this.neurochemistry.noradrenaline.value = Math.min(1.0, this.neurochemistry.noradrenaline.value + 0.30 * intensity);
      this.neurochemistry.dopamine.value = Math.max(0.05, this.neurochemistry.dopamine.value - 0.20 * intensity);
    } else if (event === 'novelty') {
      this.neurochemistry.noradrenaline.value = Math.min(1.0, this.neurochemistry.noradrenaline.value + 0.35 * intensity);
      this.neurochemistry.acetylcholine.value = Math.min(1.0, this.neurochemistry.acetylcholine.value + 0.30 * intensity);
    } else if (event === 'inhibition') {
      this.neurochemistry.gaba.value = Math.min(1.0, this.neurochemistry.gaba.value + 0.35 * intensity);
      this.neurochemistry.glutamate.value = Math.max(0.1, this.neurochemistry.glutamate.value - 0.25 * intensity);
    }
  }

  // Persistência em LocalStorage
  private saveToStorage() {
    try {
      const stateToSave = {
        cycleCount: this.cycleCount,
        qTable: this.qTable,
        episodicMemory: this.episodicMemory.slice(0, 50),
        semanticMemory: this.semanticMemory,
        proceduralMemory: this.proceduralMemory,
        checkpoints: this.checkpoints
      };
      localStorage.setItem('virtual_brain_state', JSON.stringify(stateToSave));
    } catch {
      // Ignora se quota estiver cheia
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('virtual_brain_state');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.cycleCount) this.cycleCount = data.cycleCount;
        if (data.qTable) this.qTable = data.qTable;
        if (data.episodicMemory) this.episodicMemory = data.episodicMemory;
        if (data.semanticMemory) this.semanticMemory = data.semanticMemory;
        if (data.proceduralMemory) this.proceduralMemory = data.proceduralMemory;
        if (data.checkpoints) this.checkpoints = data.checkpoints;
      }
    } catch {
      // Fallback para estado padrão
    }
  }
}
