import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  Sun,
  Flashlight,
  Check,
  Send,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  MessageSquare,
  Music,
  Home,
  ChevronLeft,
  Search,
  Sparkles,
} from 'lucide-react';
import { ThreeOrb } from './ThreeOrb';
import {
  OrbState,
  SystemHardwareState,
  SimulatedAppMessage,
  SpotifyTrack,
} from '../types/assistant';

interface AndroidPhoneSimulatorProps {
  orbState: OrbState;
  audioAmplitude: number;
  hardwareState: SystemHardwareState;
  onHardwareChange: (newState: Partial<SystemHardwareState>) => void;
  activeUtterance: string;
  assistantSpokenText: string;
  voiceGenderStatus: string;
  onTriggerAssistant: () => void;
  lastExecutedAction: string | null;
  onSendMessageToMom: (text: string) => void;
  messages: SimulatedAppMessage[];
  spotifyTrack: SpotifyTrack;
  onToggleSpotifyPlay: () => void;
}

type ActiveScreen = 'home' | 'whatsapp' | 'spotify' | 'settings';

export const AndroidPhoneSimulator: React.FC<AndroidPhoneSimulatorProps> = ({
  orbState,
  audioAmplitude,
  hardwareState,
  onHardwareChange,
  activeUtterance,
  assistantSpokenText,
  voiceGenderStatus,
  onTriggerAssistant,
  lastExecutedAction,
  onSendMessageToMom,
  messages,
  spotifyTrack,
  onToggleSpotifyPlay,
}) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isOverlayExpanded, setIsOverlayExpanded] = useState<boolean>(false);
  const [manualChatInput, setManualChatInput] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Expand overlay when assistant is listening, processing, or speaking
  useEffect(() => {
    if (orbState !== 'idle') {
      setIsOverlayExpanded(true);
    } else {
      const timer = setTimeout(() => {
        setIsOverlayExpanded(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [orbState]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Phone Hardware Shell (Samsung S24 Ultra / Pixel 9 Pro aesthetic) */}
      <div className="relative w-[360px] sm:w-[380px] h-[740px] rounded-[52px] p-3 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.85)] border-[3.5px] border-neutral-700/80 overflow-hidden select-none">
        {/* Outer Titanium Rim Specular Highlight */}
        <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/10" />

        {/* Side Hardware Buttons */}
        <div className="absolute -left-[5px] top-[140px] w-[3px] h-[45px] bg-neutral-600 rounded-l" />
        <div className="absolute -left-[5px] top-[195px] w-[3px] h-[45px] bg-neutral-600 rounded-l" />
        <div className="absolute -right-[5px] top-[160px] w-[3px] h-[65px] bg-neutral-600 rounded-r" />

        {/* Inner AMOLED Display with System Brightness Filter */}
        <div
          className="relative w-full h-full rounded-[42px] overflow-hidden flex flex-col bg-[#07090e] transition-opacity duration-300"
          style={{
            filter: `brightness(${0.45 + (hardwareState.brightness / 100) * 0.55})`,
          }}
        >
          {/* Top Status Bar & Punch-Hole Camera */}
          <div className="relative z-30 h-10 px-6 flex items-center justify-between text-xs text-white/80 font-medium">
            <span className="tabular-nums font-semibold tracking-tight">{currentTime}</span>

            {/* Centered Punch-Hole Camera */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-cyan-500/20" />
            </div>

            {/* Status Icons: Wi-Fi, 5G, Ringer, Battery */}
            <div className="flex items-center gap-1.5 text-white/80">
              {hardwareState.isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              {hardwareState.wifiEnabled ? (
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-white/40" />
              )}
              {hardwareState.bluetoothEnabled && (
                <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-[10px] font-bold tracking-wider">5G</span>
              <div className="flex items-center gap-0.5 border border-white/40 rounded px-1 py-0.2">
                <span className="text-[9px] font-mono tabular-nums">{hardwareState.batteryLevel}%</span>
              </div>
            </div>
          </div>

          {/* Flashlight Active Glow Indicator on Phone */}
          {hardwareState.flashlightOn && (
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-amber-300/20 via-amber-300/5 to-transparent pointer-events-none z-20" />
          )}

          {/* SYSTEM-LEVEL FLOATING OVERLAY (TYPE_APPLICATION_OVERLAY) */}
          <div className="absolute top-10 left-3 right-3 z-50 pointer-events-none flex justify-center">
            <div
              className={`pointer-events-auto transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
                isOverlayExpanded
                  ? 'w-full py-2 px-3 liquid-glass-pill rounded-3xl'
                  : 'w-12 h-12 rounded-full liquid-glass-button flex items-center justify-center -translate-x-28 -translate-y-1'
              }`}
            >
              {isOverlayExpanded ? (
                /* Expanded Dynamic Island Pill */
                <div className="flex items-center justify-between gap-3 w-full">
                  {/* Floating Mini 3D Fluid Orb */}
                  <div
                    className="shrink-0 w-11 h-11 relative cursor-pointer"
                    onClick={onTriggerAssistant}
                    title="Tap to speak"
                  >
                    <ThreeOrb
                      state={orbState}
                      audioAmplitude={audioAmplitude}
                      size={44}
                      interactive={false}
                    />
                  </div>

                  {/* Dynamic Status / Speech Stream */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
                      <span className="truncate">
                        {orbState === 'listening'
                          ? 'Listening...'
                          : orbState === 'processing'
                          ? 'Processing Intent...'
                          : orbState === 'speaking'
                          ? 'JARVIS Responding'
                          : 'JARVIS Standby'}
                      </span>
                      {voiceGenderStatus && (
                        <span className="text-[10px] text-white/50">· {voiceGenderStatus}</span>
                      )}
                    </div>
                    <p className="text-xs text-white truncate font-normal">
                      {activeUtterance || assistantSpokenText || 'Say "Hey Jarvis" or tap orb'}
                    </p>
                  </div>

                  {/* Micro Feedback: Success Checkmark / Audio Wave */}
                  <div className="shrink-0 flex items-center">
                    {lastExecutedAction ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 animate-in fade-in zoom-in duration-200">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 h-6">
                        {[0.3, 0.8, 0.5, 0.9, 0.4].map((scale, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-cyan-400 rounded-full transition-all duration-100"
                            style={{
                              height: `${Math.max(
                                4,
                                (orbState === 'listening' || orbState === 'speaking'
                                  ? audioAmplitude * 20
                                  : 4) * scale
                              )}px`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Collapsed Floating 48x48dp Orb Anchor beside punch-hole */
                <div
                  className="w-10 h-10 relative cursor-pointer"
                  onClick={() => {
                    setIsOverlayExpanded(true);
                    onTriggerAssistant();
                  }}
                  title="JARVIS Floating Overlay (TYPE_APPLICATION_OVERLAY) - Tap to expand"
                >
                  <ThreeOrb
                    state={orbState}
                    audioAmplitude={audioAmplitude}
                    size={40}
                    interactive={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE OS SCREEN CONTENT */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {activeScreen === 'home' && (
              /* SCREEN 1: ANDROID HOME SCREEN */
              <div className="flex-1 flex flex-col justify-between p-5 pt-8 bg-gradient-to-br from-[#0b101c] via-[#070b14] to-[#04060a]">
                {/* Liquid Glass Weather & Clock Widget */}
                <div className="mt-8 liquid-glass p-4 rounded-3xl flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-light tracking-tight text-white font-mono">
                      {currentTime}
                    </span>
                    <p className="text-xs text-white/60 mt-0.5">Tuesday, October 27 · 24°C</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-cyan-400 font-medium">New Delhi</span>
                    <p className="text-[11px] text-white/50">AQI 42 · Clear Sky</p>
                  </div>
                </div>

                {/* Simulated Assistant Trigger Card */}
                <div
                  onClick={onTriggerAssistant}
                  className="liquid-glass-card p-4 rounded-2xl cursor-pointer hover:border-cyan-400/40 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white">Voice Assistant Ready</h4>
                    <p className="text-[11px] text-white/60 truncate">
                      Listening for "Hey Jarvis" 24/7 on NPU
                    </p>
                  </div>
                  <span className="text-[10px] text-cyan-300/80 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                    &lt;120ms
                  </span>
                </div>

                {/* App Dock */}
                <div className="grid grid-cols-4 gap-3 py-2 px-1 liquid-glass rounded-3xl">
                  <button
                    onClick={() => setActiveScreen('whatsapp')}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-white/80">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen('spotify')}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] group-hover:scale-105 transition-transform">
                      <Music className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-white/80">Spotify</span>
                  </button>

                  <button
                    onClick={() => setActiveScreen('settings')}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-700/40 border border-white/20 flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform">
                      <Sliders className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-white/80">Settings</span>
                  </button>

                  <button
                    onClick={onTriggerAssistant}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-cyan-300 font-medium">Jarvis</span>
                  </button>
                </div>
              </div>
            )}

            {activeScreen === 'whatsapp' && (
              /* SCREEN 2: SIMULATED WHATSAPP APP */
              <div className="flex-1 flex flex-col bg-[#0b141a] text-white">
                {/* WhatsApp Chat Header */}
                <div className="pt-6 px-4 pb-2 bg-[#202c33] flex items-center gap-3 border-b border-white/5">
                  <button
                    onClick={() => setActiveScreen('home')}
                    className="text-white/70 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">Mom ❤️</h3>
                    <p className="text-[10px] text-emerald-400">online</p>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  <div className="text-center text-[10px] text-white/40 my-2">Today</div>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[78%] rounded-2xl px-3 py-1.5 text-xs ${
                        msg.isSent
                          ? 'ml-auto bg-[#005c4b] text-white rounded-br-none'
                          : 'mr-auto bg-[#202c33] text-white/90 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] text-white/50 self-end mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Chat Input Field (Accessible Node: com.whatsapp:id/entry) */}
                <div className="p-2 bg-[#202c33] flex items-center gap-2">
                  <input
                    type="text"
                    value={manualChatInput}
                    onChange={(e) => setManualChatInput(e.target.value)}
                    placeholder="Message Mom..."
                    className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-xs text-white placeholder-white/40 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualChatInput.trim()) {
                        onSendMessageToMom(manualChatInput.trim());
                        setManualChatInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (manualChatInput.trim()) {
                        onSendMessageToMom(manualChatInput.trim());
                        setManualChatInput('');
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 hover:bg-[#00a884]/90"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeScreen === 'spotify' && (
              /* SCREEN 3: SIMULATED SPOTIFY APP */
              <div className="flex-1 flex flex-col justify-between p-5 pt-8 bg-gradient-to-b from-[#121212] via-[#090b0e] to-black text-white">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveScreen('home')}
                    className="text-white/70 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Playing From Search
                  </span>
                  <div className="w-5" />
                </div>

                {/* Album Art */}
                <div className="my-auto flex flex-col items-center">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-purple-800 via-indigo-700 to-cyan-500 shadow-2xl flex items-center justify-center border border-white/10">
                    <Music className="w-16 h-16 text-white/80" />
                  </div>
                  <div className="mt-5 text-center">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {spotifyTrack.title}
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5">{spotifyTrack.artist}</p>
                  </div>
                </div>

                {/* Media Playback Controls */}
                <div className="space-y-3 pb-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{
                          width: `${(spotifyTrack.progressSec / spotifyTrack.durationSec) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>1:24</span>
                      <span>3:48</span>
                    </div>
                  </div>

                  {/* Transport Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <button className="text-white/70 hover:text-white">
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onToggleSpotifyPlay}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {spotifyTrack.isPlaying ? (
                        <Pause className="w-6 h-6 fill-black" />
                      ) : (
                        <Play className="w-6 h-6 fill-black translate-x-0.5" />
                      )}
                    </button>
                    <button className="text-white/70 hover:text-white">
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeScreen === 'settings' && (
              /* SCREEN 4: SIMULATED ANDROID SETTINGS */
              <div className="flex-1 flex flex-col p-4 pt-6 bg-[#090b10] text-white overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setActiveScreen('home')}
                    className="text-white/70 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-sm font-semibold">Sound & Display Settings</h2>
                </div>

                <div className="space-y-4">
                  {/* Volume Slider */}
                  <div className="liquid-glass p-3 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-white/80">
                        {hardwareState.isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        )}
                        Media Volume
                      </span>
                      <span className="text-cyan-300 font-mono tabular-nums">
                        {hardwareState.isMuted ? 'Muted' : `${hardwareState.volume}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={hardwareState.volume}
                      onChange={(e) =>
                        onHardwareChange({
                          volume: Number(e.target.value),
                          isMuted: Number(e.target.value) === 0,
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Brightness Slider */}
                  <div className="liquid-glass p-3 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-white/80">
                        <Sun className="w-4 h-4 text-amber-400" />
                        Screen Brightness
                      </span>
                      <span className="text-amber-300 font-mono tabular-nums">
                        {hardwareState.brightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={hardwareState.brightness}
                      onChange={(e) =>
                        onHardwareChange({ brightness: Number(e.target.value) })
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Quick Toggles: Wi-Fi, Bluetooth, Flashlight */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        onHardwareChange({ wifiEnabled: !hardwareState.wifiEnabled })
                      }
                      className={`p-3 rounded-2xl flex items-center gap-2 text-xs transition-colors ${
                        hardwareState.wifiEnabled
                          ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                          : 'liquid-glass text-white/60'
                      }`}
                    >
                      <Wifi className="w-4 h-4" />
                      <span>Wi-Fi {hardwareState.wifiEnabled ? 'On' : 'Off'}</span>
                    </button>

                    <button
                      onClick={() =>
                        onHardwareChange({
                          flashlightOn: !hardwareState.flashlightOn,
                        })
                      }
                      className={`p-3 rounded-2xl flex items-center gap-2 text-xs transition-colors ${
                        hardwareState.flashlightOn
                          ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                          : 'liquid-glass text-white/60'
                      }`}
                    >
                      <Flashlight className="w-4 h-4" />
                      <span>Torch {hardwareState.flashlightOn ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar (Gesture pill & Home Assist Trigger) */}
          <div className="h-9 bg-black/60 backdrop-blur-md flex items-center justify-center">
            {/* Gesture Bar - Long press or click triggers assistant */}
            <div
              onClick={onTriggerAssistant}
              className="w-32 h-1 rounded-full bg-white/40 hover:bg-cyan-400 cursor-pointer transition-colors"
              title="Long-press Home Gesture / Swipe to activate JARVIS assistant"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
