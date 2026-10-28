import React, { useState } from 'react';
import {
  Mic,
  Cpu,
  Zap,
  Sliders,
  Volume2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  CheckCircle,
} from 'lucide-react';

export const SystemArchitectureDiagram: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: 0,
      title: '1. Continuous Audio Feed (<120ms)',
      subtitle: 'AudioRecord + Porcupine / Vosk / TFLite Micro',
      description:
        'Continuous 16kHz PCM mono stream captured via FOREGROUND_SERVICE_MICROPHONE. Low-power duty cycling loop on NPU detects "Hey Jarvis" in <120ms without waking power-hungry AP cores.',
      tags: ['Wake-Lock', 'ForegroundService', 'DSP / NPU'],
    },
    {
      id: 1,
      title: '2. Voice Pitch Analyzer & Neural TTS',
      subtitle: 'YIN Autocorrelation + Indian English Neural Voice',
      description:
        'Analyzes caller fundamental frequency (F0). Frequency < 155Hz auto-greets "Hi Sir"; >= 160Hz greets "Hi Ma\'am". Generates crisp Indian English speech at 0.85x pitch and 1.0x cadence.',
      tags: ['Pitch Estimation', 'Sir / Ma\'am Classifier', 'TTS 0.85x Pitch'],
    },
    {
      id: 2,
      title: '3. Dual-Engine Hybrid Brain Router',
      subtitle: 'Offline SLM vs Online Gemini 3.8 Flash',
      description:
        'Offline Engine: On-device SLM (SmolLM-135M / Gemma-2B) for timers, app launches, and OS hardware without internet. Online Engine: High-parameter Gemini 3.8 Flash router for complex reasoning.',
      tags: ['SmolLM-135M', 'Gemini 3.8 Flash', 'Agentic Router'],
    },
    {
      id: 3,
      title: '4. Zero-Talk Silent Execution Pipeline',
      subtitle: 'Headless Accessibility + System Settings Provider',
      description:
        'For actionable OS commands ("Mute phone", "Set brightness to 40%", "Send WhatsApp to Mom"), JARVIS executes silently without speaking. AccessibilityService injects clicks directly into background nodes.',
      tags: ['Zero-Talk', 'AccessibilityNodeInfo', 'WRITE_SETTINGS'],
    },
    {
      id: 4,
      title: '5. Dynamic Island 3D Liquid Orb Overlay',
      subtitle: 'WindowManager TYPE_APPLICATION_OVERLAY + OpenGL GLSL',
      description:
        'Anchored beside the camera punch-hole (48x48dp). Procedural 3D fluid morphing sphere with translucent silicone/liquid-glass shell refracting internal cyan and magenta fluid convection blobs.',
      tags: ['TYPE_APPLICATION_OVERLAY', 'Fragment Shader', 'Fluid Convection'],
    },
  ];

  return (
    <div className="liquid-glass-card p-6 rounded-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>End-to-End System Architecture Pipeline</span>
          <span className="text-xs font-mono text-cyan-300 font-normal bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            Zero-Lag OS Level
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Visualizing the uninterrupted flow from low-power background microphone capture, through voice pitch classification and dual-engine reasoning, to zero-talk headless automation.
        </p>
      </div>

      {/* Interactive Step Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {stages.map((stage, idx) => (
          <button
            key={stage.id}
            onClick={() => setActiveStage(idx)}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
              activeStage === idx
                ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                : 'liquid-glass border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={activeStage === idx ? 'text-cyan-300' : 'text-slate-300'}>
                Stage 0{idx + 1}
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <h4 className="text-xs font-medium text-white mt-1.5 line-clamp-1">
              {stage.title.split('. ')[1]}
            </h4>
          </button>
        ))}
      </div>

      {/* Active Stage Deep-Dive Card */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            {stages[activeStage].title}
          </h3>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
            {stages[activeStage].subtitle}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {stages[activeStage].description}
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          {stages[activeStage].tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
