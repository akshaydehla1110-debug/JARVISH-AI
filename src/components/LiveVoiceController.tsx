import React, { useState } from 'react';
import { Mic, MicOff, Play, Send, Zap, Activity } from 'lucide-react';
import { VoiceGender, ExecutionType } from '../types/assistant';
import { audioEngine } from '../utils/audioAnalyzer';

interface LiveVoiceControllerProps {
  isListening: boolean;
  onToggleListening: () => void;
  onExecuteCommand: (command: string, isVoiceTrigger: boolean) => void;
  voiceGender: VoiceGender;
  detectedPitchHz: number;
  lastExecutedAction: string | null;
  lastExecutionType: ExecutionType | null;
  executionLatencyMs: number;
}

export const LiveVoiceController: React.FC<LiveVoiceControllerProps> = ({
  isListening,
  onToggleListening,
  onExecuteCommand,
  voiceGender,
  detectedPitchHz,
  lastExecutedAction,
  lastExecutionType,
  executionLatencyMs,
}) => {
  const [customInput, setCustomInput] = useState<string>('');

  const quickCommands = [
    { label: 'Mute Phone', text: 'Mute phone', type: 'OS Hardware (Silent)' },
    { label: 'Brightness 40%', text: 'Set brightness to 40%', type: 'Hardware Level' },
    { label: 'Send WhatsApp', text: "Send WhatsApp to Mom saying I'm reaching", type: 'Accessibility UI Injection' },
    { label: 'Play Rock on Spotify', text: 'Open Spotify and play rock', type: 'App Intent' },
    { label: 'Torch On', text: 'Turn on flashlight', type: 'Hardware Level' },
    { label: 'Explain Quantum Logic', text: 'What is quantum superposition in computing?', type: 'Dual-Engine Brain (LLM)' },
  ];

  return (
    <div className="liquid-glass-card p-5 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Voice & Agentic Controller</span>
            <span className="text-[11px] font-mono text-cyan-400 font-normal">
              latency: {executionLatencyMs}ms
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time FFT pitch analyzer, hotword detection & zero-talk executor
          </p>
        </div>

        {/* Microphone Toggle Button */}
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500/20 border border-rose-400/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
              : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-4 h-4 text-rose-400" />
              <span>Mic Active</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 text-cyan-400" />
              <span>Listen ("Hey Jarvis")</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Voice Gender & Frequency Pitch Telemetry */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="liquid-glass p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Caller Pitch</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
              {detectedPitchHz > 0 ? detectedPitchHz : 118}
            </span>
            <span className="text-xs text-slate-400 font-mono">Hz</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">YIN Autocorrelation</span>
        </div>

        <div className="liquid-glass p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Voice Gender Band</span>
          <div className="mt-1">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {voiceGender === 'female' ? "Ma'am (Female)" : 'Sir (Male)'}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400/80 mt-0.5">
            {voiceGender === 'female' ? '165-255 Hz Band' : '85-155 Hz Band'}
          </span>
        </div>

        <div className="liquid-glass p-3 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Execution Pipeline</span>
          <div className="mt-1">
            <span className="text-xs font-semibold text-emerald-300 truncate block">
              {lastExecutionType || 'Zero-Talk NPU'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">
            {lastExecutedAction ? 'Silent Action Executed' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Preset 1-Click Command Chips */}
      <div>
        <label className="text-[11px] font-medium text-slate-400 block mb-2">
          Test Fast-Path Voice Directives (Zero-Talk & High-Reasoning):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => onExecuteCommand(cmd.text, true)}
              className="text-left p-2.5 rounded-xl liquid-glass hover:bg-white/10 hover:border-cyan-400/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                <span className="truncate">{cmd.label}</span>
                <Play className="w-3 h-3 text-cyan-400/60 group-hover:text-cyan-300 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                {cmd.type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Command Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder='Type a command (e.g. "Mute phone", "Set brightness to 65%", "Who was Alan Turing?")...'
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customInput.trim()) {
              onExecuteCommand(customInput.trim(), false);
              setCustomInput('');
            }
          }}
        />
        <button
          onClick={() => {
            if (customInput.trim()) {
              onExecuteCommand(customInput.trim(), false);
              setCustomInput('');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};
