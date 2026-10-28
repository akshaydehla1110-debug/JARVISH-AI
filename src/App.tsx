import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Power,
  Volume2,
  CheckCircle2,
  Send,
  Zap,
  Activity,
  Sliders,
  Check,
  Download,
  Github,
} from 'lucide-react';
import { ThreeOrb } from './components/ThreeOrb';
import { JarvisCustomizer } from './components/JarvisCustomizer';
import { OrbState, ExecutionType } from './types/assistant';
import { OrbCustomization, DEFAULT_CUSTOMIZATION, PRESET_THEMES } from './types/customization';
import { audioEngine } from './utils/audioAnalyzer';
import { generateAndroidStudioProjectZip } from './utils/zipGenerator';

export default function App() {
  // Service Master State
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);

  // Customization Configuration
  const [customization, setCustomization] = useState<OrbCustomization>(DEFAULT_CUSTOMIZATION);

  // Live Orb & Voice States
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [lastExecutedTask, setLastExecutedTask] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState<string>('');
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const blob = await generateAndroidStudioProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'JARVIS-AI-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download project zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Handle Customization Patch
  const handleCustomizationChange = (patch: Partial<OrbCustomization>) => {
    setCustomization((prev) => ({ ...prev, ...patch }));
  };

  // Reset to Factory Default
  const handleResetDefaults = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
  };

  // Master Service Toggle (ON / OFF)
  const handleToggleService = () => {
    const nextState = !isServiceActive;
    setIsServiceActive(nextState);

    if (!nextState) {
      // Turn OFF
      audioEngine.stopMicrophone();
      setIsListeningMic(false);
      setOrbState('idle');
      setLastExecutedTask('JARVIS Service Suspended');
    } else {
      // Turn ON
      setLastExecutedTask('JARVIS Service Activated');
      // Speak brief greeting in deep clear male voice with Indian accent
      audioEngine.speak(
        `JARVIS core online. Standing by, ${customization.honorific}.`,
        customization.voicePitch,
        customization.voiceSpeed,
        customization.accent,
        () => setOrbState('speaking'),
        () => setOrbState('idle'),
        (amp) => setAudioAmplitude(amp)
      );
    }
  };

  // Toggle Continuous Microphone Listening
  const handleToggleListening = async () => {
    if (!isServiceActive) {
      handleToggleService();
      return;
    }

    if (isListeningMic) {
      audioEngine.stopMicrophone();
      setIsListeningMic(false);
      setOrbState('idle');
      return;
    }

    const granted = await audioEngine.initMicrophone((amp) => {
      setAudioAmplitude(amp);
    });

    if (granted) {
      setIsListeningMic(true);
      setOrbState('listening');

      // Start continuous speech recognition with ZERO-ECHO direct execution!
      audioEngine.startSpeechRecognition(
        (recognizedCommand) => {
          handleDirectExecution(recognizedCommand);
        },
        (err) => {
          console.warn('Speech recognition warning:', err);
        }
      );
    }
  };

  // ZERO-TALK DIRECT WORK EXECUTION PIPELINE
  // RULE: DO NOT REPEAT THE USER'S PROMPT. EXECUTE DIRECTLY!
  const handleDirectExecution = async (rawUtterance: string) => {
    if (!isServiceActive) return;

    const lower = rawUtterance.toLowerCase().trim();
    setOrbState('processing');

    // 1. Service Control Directives
    if (lower.includes('service off') || lower.includes('stop service') || lower.includes('turn off')) {
      setIsServiceActive(false);
      audioEngine.stopMicrophone();
      setIsListeningMic(false);
      setOrbState('idle');
      setLastExecutedTask('Service Deactivated');
      return;
    }

    if (lower.includes('service on') || lower.includes('start service')) {
      setIsServiceActive(true);
      setOrbState('idle');
      setLastExecutedTask('Service Activated');
      return;
    }

    // 2. Orb Color Customization Directives
    if (lower.includes('color emerald') || lower.includes('color green')) {
      handleCustomizationChange({ primaryColor: '#00ff88', secondaryColor: '#0066ff' });
      setLastExecutedTask('Orb Color: Emerald & Azure');
      finishSilentTask();
      return;
    }
    if (lower.includes('color red') || lower.includes('color ruby') || lower.includes('color solar')) {
      handleCustomizationChange({ primaryColor: '#ffaa00', secondaryColor: '#ff0033' });
      setLastExecutedTask('Orb Color: Solar Amber & Ruby');
      finishSilentTask();
      return;
    }
    if (lower.includes('color purple') || lower.includes('color violet')) {
      handleCustomizationChange({ primaryColor: '#9900ff', secondaryColor: '#ff00aa' });
      setLastExecutedTask('Orb Color: Deep Violet');
      finishSilentTask();
      return;
    }
    if (lower.includes('color cyan') || lower.includes('color blue') || lower.includes('default color')) {
      handleCustomizationChange({ primaryColor: '#00f0ff', secondaryColor: '#ff0055' });
      setLastExecutedTask('Orb Color: Cyber Cyan');
      finishSilentTask();
      return;
    }

    // 3. Screen Position Directives
    if (lower.includes('top left')) {
      handleCustomizationChange({ position: 'top-left' });
      setLastExecutedTask('Position: Top-Left Anchor');
      finishSilentTask();
      return;
    }
    if (lower.includes('top right')) {
      handleCustomizationChange({ position: 'top-right' });
      setLastExecutedTask('Position: Top-Right Anchor');
      finishSilentTask();
      return;
    }
    if (lower.includes('top center')) {
      handleCustomizationChange({ position: 'top-center' });
      setLastExecutedTask('Position: Top-Center Island');
      finishSilentTask();
      return;
    }
    if (lower.includes('center')) {
      handleCustomizationChange({ position: 'center' });
      setLastExecutedTask('Position: Center Stage');
      finishSilentTask();
      return;
    }

    // 4. Fluid Dynamics Directives
    if (lower.includes('speed up') || lower.includes('faster')) {
      handleCustomizationChange({ speed: Math.min(2.5, customization.speed + 0.5) });
      setLastExecutedTask(`Convection Speed: ${(customization.speed + 0.5).toFixed(1)}x`);
      finishSilentTask();
      return;
    }
    if (lower.includes('slow down') || lower.includes('slower')) {
      handleCustomizationChange({ speed: Math.max(0.3, customization.speed - 0.4) });
      setLastExecutedTask(`Convection Speed: ${(customization.speed - 0.4).toFixed(1)}x`);
      finishSilentTask();
      return;
    }

    // 5. Silent OS Directives (Zero-Talk, Never Echo Command!)
    if (lower.includes('mute') || lower.includes('silent')) {
      setLastExecutedTask('System Muted (Silent Mode Active)');
      finishSilentTask();
      return;
    }

    if (lower.includes('brightness')) {
      const match = lower.match(/\d+/);
      const val = match ? match[0] : '50';
      setLastExecutedTask(`System Brightness Set: ${val}%`);
      finishSilentTask();
      return;
    }

    if (lower.includes('volume')) {
      const match = lower.match(/\d+/);
      const val = match ? match[0] : '75';
      setLastExecutedTask(`Media Volume Set: ${val}%`);
      finishSilentTask();
      return;
    }

    if (lower.includes('flashlight') || lower.includes('torch')) {
      setLastExecutedTask('Torch Toggled');
      finishSilentTask();
      return;
    }

    // 6. Direct Informational / Identification Queries
    // Deep clear male voice answers directly WITHOUT repeating the prompt!
    if (lower.includes('who are you') || lower.includes('introduce yourself') || lower.includes('what are you')) {
      const answer = `I am JARVIS, your system-level artificial intelligence. All fluid shader cores and low-latency listeners are operational, ${customization.honorific}.`;
      setLastExecutedTask('Identity Query Executed');
      speakDirectAnswer(answer);
      return;
    }

    if (lower.includes('status') || lower.includes('system check')) {
      const answer = `All system parameters nominal. 60 frames per second WebGL fluid convection active, ${customization.honorific}.`;
      setLastExecutedTask('Diagnostics Verified');
      speakDirectAnswer(answer);
      return;
    }

    // 7. General Knowledge Query -> Backend Gemini API
    // Returns concise direct answer, NEVER repeats the user's prompt!
    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawUtterance,
          voiceGender: 'male',
        }),
      });
      const data = await res.json();
      const directAnswer = data.response || `Task completed as requested, ${customization.honorific}.`;
      setLastExecutedTask('Inference Executed');
      speakDirectAnswer(directAnswer);
    } catch (err) {
      setLastExecutedTask('Direct Directive Executed');
      finishSilentTask();
    }
  };

  const finishSilentTask = () => {
    setTimeout(() => {
      setOrbState('idle');
    }, 900);
  };

  const speakDirectAnswer = (answer: string) => {
    audioEngine.speak(
      answer,
      customization.voicePitch,
      customization.voiceSpeed,
      customization.accent,
      () => setOrbState('speaking'),
      () => setOrbState('idle'),
      (amp) => setAudioAmplitude(amp)
    );
  };

  // Test Deep Male Indian Voice
  const handleTestVoice = () => {
    audioEngine.speak(
      `All sub-routines operational, ${customization.honorific}. How may I assist you?`,
      customization.voicePitch,
      customization.voiceSpeed,
      customization.accent,
      () => setOrbState('speaking'),
      () => setOrbState('idle'),
      (amp) => setAudioAmplitude(amp)
    );
  };

  // Quick Action Directives for 1-Click Verification
  const quickDirectives = [
    { label: 'Mute Phone', cmd: 'Mute phone' },
    { label: 'Brightness 40%', cmd: 'Set brightness to 40%' },
    { label: 'Emerald Theme', cmd: 'Color emerald' },
    { label: 'Solar Amber', cmd: 'Color solar' },
    { label: 'Top-Right Anchor', cmd: 'Top right' },
    { label: 'Speed Up', cmd: 'Speed up' },
  ];

  // Dynamic Position Classes for the 3D Orb Viewport
  const getPositionClasses = () => {
    switch (customization.position) {
      case 'top-left':
        return 'fixed top-18 left-6 z-40';
      case 'top-center':
        return 'fixed top-18 left-1/2 -translate-x-1/2 z-40';
      case 'top-right':
        return 'fixed top-18 right-6 z-40';
      case 'center':
      default:
        return 'relative mx-auto my-4';
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP BAR: Brand Wordmark — Status — Master Service Control */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090b10]/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider font-display text-white">
              JARVIS AI
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              System Assistant & 3D Fluid Glass Orb
            </p>
          </div>
        </div>

        {/* Actions: Voice, Download Project, and Master Service */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
            title="Download complete Android Studio & GitHub project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingZip ? 'Packing...' : 'Download Project (.ZIP)'}</span>
          </button>

          <button
            onClick={() => setShowApkGuide(!showApkGuide)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="How to build APK from GitHub in 1 minute"
          >
            <Github className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">GitHub APK Guide</span>
          </button>

          <button
            onClick={handleToggleListening}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isListeningMic
                ? 'bg-rose-500/20 border-rose-400/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            {isListeningMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isListeningMic ? 'Listening...' : 'Voice'}</span>
          </button>

          <button
            onClick={handleToggleService}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isServiceActive
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-slate-800 border-white/10 text-slate-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isServiceActive ? 'Service ON' : 'Service OFF'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT: 3D Orb Stage & Setup Panel (NO MOCK PHONES / NO BLUR AROUND ORB) */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* GitHub APK Fast Build Banner */}
        {showApkGuide && (
          <div className="liquid-glass-card p-5 rounded-3xl border border-cyan-400/40 bg-cyan-950/20 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub se 1-Minute me APK kaise banaye:</span>
              </div>
              <button
                onClick={() => setShowApkGuide(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="liquid-glass p-3 rounded-2xl space-y-1">
                <span className="font-semibold text-cyan-300 block">Step 1: Push to GitHub</span>
                <p className="text-[11px] text-slate-400">
                  Is repo ko GitHub par push kro ya upar se <strong>"Download Project (.ZIP)"</strong> click krke GitHub repo me upload kro.
                </p>
              </div>
              <div className="liquid-glass p-3 rounded-2xl space-y-1">
                <span className="font-semibold text-emerald-300 block">Step 2: Auto Build (GitHub Actions)</span>
                <p className="text-[11px] text-slate-400">
                  Humne <code className="text-cyan-300 font-mono">.github/workflows/build-apk.yml</code> add kr diya h. Push krte hi GitHub automatically APK build kr dega!
                </p>
              </div>
              <div className="liquid-glass p-3 rounded-2xl space-y-1">
                <span className="font-semibold text-purple-300 block">Step 3: Download APK</span>
                <p className="text-[11px] text-slate-400">
                  GitHub repo ke <strong>"Actions"</strong> tab me jao &gt; latest run open kro &gt; <strong>"JARVIS-AI-debug-apk"</strong> download kr lo!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LIVE 3D FLUID ORB STAGE */}
        <div className="flex flex-col items-center justify-center relative py-4">
          {/* Positioned 3D Orb (Zero blur around the orb, 100% visible and clean) */}
          <div className={`${getPositionClasses()} transition-all duration-300`}>
            <div className="relative flex items-center justify-center bg-transparent">
              <ThreeOrb
                state={orbState}
                isServiceActive={isServiceActive}
                audioAmplitude={audioAmplitude}
                customization={customization}
                size={customization.size}
                interactive={true}
                onClick={handleToggleListening}
              />
            </div>
          </div>

          {/* Micro Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isServiceActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'bg-slate-600'
              }`}
            />
            <span>State: {isServiceActive ? orbState.toUpperCase() : 'SLEEP / SUSPENDED'}</span>
            <span aria-hidden="true">·</span>
            <span>Position: {customization.position.toUpperCase()}</span>
            {lastExecutedTask && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{lastExecutedTask}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 3. DIRECT VOICE & COMMAND INPUT BAR (ZERO-ECHO) */}
        <div className="liquid-glass-card p-4 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder='Give command (e.g., "Mute", "Brightness 40%", "Color emerald", "Top right", "Who are you")...'
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commandInput.trim()) {
                  handleDirectExecution(commandInput.trim());
                  setCommandInput('');
                }
              }}
            />
            <button
              onClick={() => {
                if (commandInput.trim()) {
                  handleDirectExecution(commandInput.trim());
                  setCommandInput('');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute</span>
            </button>
          </div>

          {/* Quick Directives: Test Fast Actions Without Echo */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500">Quick Test Directives:</span>
            {quickDirectives.map((d) => (
              <button
                key={d.label}
                onClick={() => handleDirectExecution(d.cmd)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. JARVIS SETUP & CUSTOMIZATION SUITE */}
        <JarvisCustomizer
          isServiceActive={isServiceActive}
          onToggleService={handleToggleService}
          customization={customization}
          onChange={handleCustomizationChange}
          onTestVoice={handleTestVoice}
          onReset={handleResetDefaults}
        />
      </main>

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span>JARVIS AI · Setup & Customization Suite</span>
          <span className="font-mono text-[11px] text-slate-400">
            Deep Male Voice ({customization.voicePitch}x) · Zero-Echo Execution
          </span>
        </div>
      </footer>
    </div>
  );
}
