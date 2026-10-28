import React from 'react';
import {
  Palette,
  Sliders,
  Move,
  Volume2,
  Power,
  RotateCcw,
  Sparkles,
  Check,
  Radio,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { OrbCustomization, PRESET_THEMES, DEFAULT_CUSTOMIZATION } from '../types/customization';

interface JarvisCustomizerProps {
  isServiceActive: boolean;
  onToggleService: () => void;
  customization: OrbCustomization;
  onChange: (patch: Partial<OrbCustomization>) => void;
  onTestVoice: () => void;
  onReset: () => void;
}

export const JarvisCustomizer: React.FC<JarvisCustomizerProps> = ({
  isServiceActive,
  onToggleService,
  customization,
  onChange,
  onTestVoice,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. MASTER JARVIS SERVICE CONTROL SWITCH */}
      <div className="liquid-glass-card p-5 sm:p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleService}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isServiceActive
                ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                : 'bg-rose-500/20 border border-rose-400/40 text-rose-400'
            }`}
            title="Toggle JARVIS Background Service"
          >
            <Power className="w-7 h-7" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                JARVIS Core System Service
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isServiceActive
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {isServiceActive ? 'ONLINE & LISTENING' : 'OFFLINE / SUSPENDED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isServiceActive
                ? 'Zero-lag background listener active. Responds to voice and silent OS directives.'
                : 'Service stopped. 3D Orb dormant. Click power button to activate.'}
            </p>
          </div>
        </div>

        {/* Big On / Off Button */}
        <button
          onClick={onToggleService}
          className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isServiceActive
              ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isServiceActive ? 'Turn Service OFF' : 'Turn Service ON'}</span>
        </button>
      </div>

      {/* 2. CUSTOMIZATION CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION A: ORB COLORS & THEMES */}
        <div className="liquid-glass-card p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Orb Colors & Liquid Fluid Blobs</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Shaders</span>
          </div>

          {/* Preset Color Themes */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-2">
              Curated Theme Presets:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((theme) => {
                const isActive =
                  customization.primaryColor.toLowerCase() === theme.primary.toLowerCase() &&
                  customization.secondaryColor.toLowerCase() === theme.secondary.toLowerCase();
                return (
                  <button
                    key={theme.name}
                    onClick={() =>
                      onChange({
                        primaryColor: theme.primary,
                        secondaryColor: theme.secondary,
                        glassTint: theme.glass,
                      })
                    }
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400/50 shadow-sm'
                        : 'liquid-glass border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {theme.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.secondary }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Pickers */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-medium text-slate-400 block mb-1">
                Primary Blob
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5">
                <input
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">
                  {customization.primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-slate-400 block mb-1">
                Secondary Blob
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5">
                <input
                  type="color"
                  value={customization.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">
                  {customization.secondaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-slate-400 block mb-1">
                Glass Refraction Tint
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5">
                <input
                  type="color"
                  value={customization.glassTint}
                  onChange={(e) => onChange({ glassTint: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-[11px] font-mono text-slate-300 uppercase">
                  {customization.glassTint}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: STRUCTURE & FLUID DYNAMICS */}
        <div className="liquid-glass-card p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Orb Structure & Fluid Physics</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Zero Blur Screen</span>
          </div>

          <div className="space-y-3">
            {/* Convection Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Convection Speed</span>
                <span className="text-cyan-300 font-mono">{customization.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={customization.speed}
                onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Fluid Turbulence / Viscosity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Fluid Turbulence & Swirl</span>
                <span className="text-cyan-300 font-mono">{customization.turbulence.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.1"
                value={customization.turbulence}
                onChange={(e) => onChange({ turbulence: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Glass Index of Refraction (IOR) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Glass Refraction Index (IOR)</span>
                <span className="text-cyan-300 font-mono">{customization.refractionIor.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="2.0"
                step="0.02"
                value={customization.refractionIor}
                onChange={(e) => onChange({ refractionIor: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Orb Diameter / Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Orb Diameter Size</span>
                <span className="text-cyan-300 font-mono">{customization.size}px</span>
              </div>
              <input
                type="range"
                min="200"
                max="400"
                step="10"
                value={customization.size}
                onChange={(e) => onChange({ size: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: SCREEN POSITION */}
        <div className="liquid-glass-card p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Move className="w-4 h-4 text-purple-400" />
              <span>Screen Position & Overlay Anchor</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">TYPE_APPLICATION_OVERLAY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'top-left', label: 'Top-Left', sub: 'Punch-hole' },
              { id: 'top-center', label: 'Top-Center', sub: 'Dynamic Island' },
              { id: 'top-right', label: 'Top-Right', sub: 'Status Corner' },
              { id: 'center', label: 'Center Stage', sub: 'Focus Display' },
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onChange({ position: pos.id as any })}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  customization.position === pos.id
                    ? 'bg-purple-500/20 border-purple-400/50 shadow-sm text-purple-300'
                    : 'liquid-glass border-white/5 hover:border-white/15 text-slate-400'
                }`}
              >
                <span className="text-xs font-semibold text-white block">{pos.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{pos.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION D: VOICE ENGINE (DEEP CLEAR MALE VOICE - INDIAN ACCENT) */}
        <div className="liquid-glass-card p-5 rounded-3xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Voice Engine (Deep Clear Male · Indian English)</span>
            </h3>
            <button
              onClick={onTestVoice}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Test Voice</span>
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Voice Pitch (Deep Male) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Voice Pitch (Deep Authoritative Tone)</span>
                <span className="text-amber-300 font-mono">
                  {customization.voicePitch <= 0.8 ? `${customization.voicePitch.toFixed(2)}x (Deep Male)` : `${customization.voicePitch.toFixed(2)}x`}
                </span>
              </div>
              <input
                type="range"
                min="0.65"
                max="1.0"
                step="0.02"
                value={customization.voicePitch}
                onChange={(e) => onChange({ voicePitch: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Honorific & Zero-Talk */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Caller Honorific
                </label>
                <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
                  {(['Sir', 'Boss', "Ma'am"] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => onChange({ honorific: h })}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        customization.honorific === h
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Command Handling Policy
                </label>
                <button
                  onClick={() => onChange({ zeroTalkMode: !customization.zeroTalkMode })}
                  className={`w-full py-1.5 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                    customization.zeroTalkMode
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-black/40 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="truncate">
                    {customization.zeroTalkMode ? 'Never Repeat (Silent)' : 'Verbal Response'}
                  </span>
                  <Check className={`w-3.5 h-3.5 shrink-0 ${customization.zeroTalkMode ? 'text-emerald-400' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Defaults Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white liquid-glass-button cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Customizations to Factory Default</span>
        </button>
      </div>
    </div>
  );
};
