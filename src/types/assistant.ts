export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

export type VoiceGender = 'male' | 'female' | 'detecting';

export type ExecutionType = 'OS_HARDWARE' | 'ACCESSIBILITY_AUTOMATION' | 'ONLINE_REASONING' | 'LOCAL_SLM';

export interface CommandIntent {
  rawText: string;
  type: ExecutionType;
  action: string;
  params: Record<string, any>;
  silent: boolean;
  voiceFeedbackText?: string;
  executionStatus: 'pending' | 'executing' | 'success' | 'failed';
  executionTimeMs?: number;
}

export interface SystemHardwareState {
  isMuted: boolean;
  ringerMode: 'NORMAL' | 'VIBRATE' | 'SILENT';
  brightness: number; // 0 to 100
  volume: number; // 0 to 100
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  flashlightOn: boolean;
  screenTimeoutSec: number;
  batteryLevel: number;
}

export interface SimulatedAppMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSent?: boolean;
}

export interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  durationSec: number;
  progressSec: number;
}

export interface AndroidPermissionItem {
  id: string;
  name: string;
  permissionString: string;
  category: 'Critical System Privilege' | 'Hardware Access' | 'Background Persistence';
  granted: boolean;
  description: string;
  oemImpact: string;
  systemIntentAction: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  command: string;
  category: ExecutionType;
  details: string;
  durationMs: number;
  silent: boolean;
}
