export type OperatingMode =
  | 'observation'
  | 'simulation'
  | 'controlled_environment'
  | 'authorized_computer';

export interface BrainRegion {
  name: string;
  pos: [number, number, number];
  activation: number;
  module: string;
}

export interface NeuralConnection {
  from: string;
  to: string;
  weight: number;
}

export interface NeurotransmitterState {
  name: string;
  symbol: string;
  value: number;
  baseline: number;
  min: number;
  max: number;
  history: number[];
  description: string;
}

export interface EEGChannels {
  F3_Prefrontal_L: number;
  F4_Prefrontal_R: number;
  O1_Visual_Occipital: number;
  C3_Motor_Central: number;
  T3_Temporal_Hippocampal: number;
}

export interface GridworldObservation {
  agent_pos: [number, number];
  orbs: [number, number][];
  hazards: [number, number][];
  grid_size: [number, number];
  nearest_orb_dist: number;
  nearest_hazard_dist: number;
  state_key: string;
  step: number;
  score: number;
}

export interface BrainTelemetry {
  timestamp: number;
  cycle: number;
  regions: Record<string, BrainRegion>;
  connections: NeuralConnection[];
  eeg_channels: EEGChannels;
  slices: {
    axial: number[][];
    coronal: number[][];
    sagittal: number[][];
  };
  neurochemistry: Record<string, NeurotransmitterState>;
  env_state: GridworldObservation;
  rl_metrics: {
    total_steps: number;
    q_states_count: number;
    episodes_count: number;
    average_reward_recent: number;
    recent_rewards: number[];
    gamma: number;
    alpha: number;
    epsilon: number;
  };
  last_action: string;
  reason: string;
  mode: OperatingMode;
  emergency_stop: boolean;
}

export interface WorkingMemoryItem {
  type: string;
  content: string;
  importance: number;
  timestamp: number;
}

export interface EpisodicMemoryItem {
  id: number;
  session_id: string;
  timestamp: number;
  task_name: string;
  observation_summary: string;
  action_taken: string;
  reward: number;
  next_observation_summary: string;
  neuro_state: Record<string, number>;
}

export interface SemanticConcept {
  id: number;
  concept: string;
  definition: string;
  confidence: number;
  source: string;
  associations: string[];
  updated_at: number;
}

export interface ProceduralSkill {
  id: number;
  skill_name: string;
  condition_trigger: string;
  action_sequence: string[];
  success_rate: number;
  total_executions: number;
  updated_at: number;
}

export interface CheckpointRecord {
  id: string;
  version_name: string;
  created_at: number;
  model_type: string;
  metrics: {
    average_reward_recent: number;
    accuracy?: number;
    q_states_count?: number;
  };
  notes: string;
}

export interface SessionEvent {
  id: number;
  t_mono: number;
  type: 'mouse_move' | 'mouse_click' | 'keypress' | 'observation';
  data: Record<string, any>;
}
