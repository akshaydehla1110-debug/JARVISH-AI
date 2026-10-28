import React, { useState } from 'react';
import {
  Layers,
  Mic,
  MousePointerClick,
  Sliders,
  BatteryCharging,
  Package,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { AndroidPermissionItem } from '../types/assistant';

export const PermissionOnboarding: React.FC = () => {
  const [permissions, setPermissions] = useState<AndroidPermissionItem[]>([
    {
      id: 'overlay',
      name: 'System Alert Window (Draw Over Apps)',
      permissionString: 'android.permission.SYSTEM_ALERT_WINDOW',
      category: 'Critical System Privilege',
      granted: true,
      description: 'Mandatory for displaying the dynamic 3D Orb overlay across any screen, app, or setting via TYPE_APPLICATION_OVERLAY.',
      oemImpact: 'Bypasses app isolation; renders with zero occlusion of active apps.',
      systemIntentAction: 'Settings.ACTION_MANAGE_OVERLAY_PERMISSION',
    },
    {
      id: 'mic',
      name: 'Continuous Microphone & Foreground Service',
      permissionString: 'android.permission.RECORD_AUDIO & FOREGROUND_SERVICE_MICROPHONE',
      category: 'Hardware Access',
      granted: true,
      description: 'Required by Android 14/15 to prevent the OS from killing the background hotword listener thread.',
      oemImpact: 'Foreground sticky notification with microphone service type prevents low-memory killer.',
      systemIntentAction: 'ActivityCompat.requestPermissions(RECORD_AUDIO)',
    },
    {
      id: 'accessibility',
      name: 'Accessibility Service (Silent UI Automation)',
      permissionString: 'android.permission.BIND_ACCESSIBILITY_SERVICE',
      category: 'Critical System Privilege',
      granted: true,
      description: 'Reads on-screen text nodes, simulates clicks, and injects inputs (WhatsApp, Spotify, etc.) without opening full apps.',
      oemImpact: 'Enables zero-talk headless actions with zero user disruption.',
      systemIntentAction: 'Settings.ACTION_ACCESSIBILITY_SETTINGS',
    },
    {
      id: 'settings',
      name: 'Modify System Settings (Hardware Toggles)',
      permissionString: 'android.permission.WRITE_SETTINGS',
      category: 'Hardware Access',
      granted: true,
      description: 'Direct hardware level manipulation: volume levels, screen brightness, display timeout, and torch.',
      oemImpact: 'Allows immediate silent changes without opening device settings menus.',
      systemIntentAction: 'Settings.ACTION_MANAGE_WRITE_SETTINGS',
    },
    {
      id: 'battery',
      name: 'Bypass OEM Battery Optimizations',
      permissionString: 'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      category: 'Background Persistence',
      granted: true,
      description: 'Auto-whitelists JARVIS from aggressive OEM battery killers (Xiaomi/MIUI, Samsung OneUI, OnePlus OxygenOS).',
      oemImpact: 'Prevents CPU sleep during continuous wake-word detection loops.',
      systemIntentAction: 'Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    },
    {
      id: 'boot_packages',
      name: 'Package Queries & Boot Receiver',
      permissionString: 'android.permission.QUERY_ALL_PACKAGES & RECEIVE_BOOT_COMPLETED',
      category: 'Background Persistence',
      granted: true,
      description: 'Instant package queries for silent app launching and task routing; boots hotword listener upon device reboot.',
      oemImpact: 'Restores foreground listener immediately after phone restart.',
      systemIntentAction: 'Manifest Declarations (Auto-granted at install)',
    },
  ]);

  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [activeOemTab, setActiveOemTab] = useState<'xiaomi' | 'samsung' | 'oneplus'>('xiaomi');

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, granted: !item.granted } : item
      )
    );
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'overlay':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'mic':
        return <Mic className="w-5 h-5 text-purple-400" />;
      case 'accessibility':
        return <MousePointerClick className="w-5 h-5 text-emerald-400" />;
      case 'settings':
        return <Sliders className="w-5 h-5 text-amber-400" />;
      case 'battery':
        return <BatteryCharging className="w-5 h-5 text-rose-400" />;
      default:
        return <Package className="w-5 h-5 text-blue-400" />;
    }
  };

  const allGranted = permissions.every((p) => p.granted);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="liquid-glass-card p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Automated Permission Onboarding Engine</span>
              <span className="text-xs font-normal text-cyan-300 font-mono bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                PermissionManager.kt
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configures high-level system privileges to bypass aggressive OEM battery killers,
              maintain unbroken 24/7 background listening, and execute silent OS actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Privileges Active</span>
              <p className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {permissions.filter((p) => p.granted).length} / {permissions.length}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                allGranted
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Permission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm) => (
          <div
            key={perm.id}
            className={`p-5 rounded-2xl border transition-all ${
              perm.granted
                ? 'liquid-glass border-white/10 hover:border-white/20'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {getIcon(perm.id)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {perm.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[240px]">
                    {perm.permissionString}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => togglePermission(perm.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                  perm.granted ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    perm.granted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {perm.description}
            </p>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                <strong className="text-slate-200">System Intent:</strong>{' '}
                <code className="text-cyan-300 font-mono text-[10px]">
                  {perm.systemIntentAction}
                </code>
              </span>
              <button
                onClick={() => setActiveDialog(perm.id)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OEM Battery Killer Whitelist Engine */}
      <div className="liquid-glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>OEM Battery Optimization Exemption Guide</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                MIUI · OneUI · OxygenOS
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Xiaomi, Samsung, and OnePlus kill background audio loops after 10–15 minutes unless explicit intent bypasses are registered.
            </p>
          </div>

          {/* OEM Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {(['xiaomi', 'samsung', 'oneplus'] as const).map((oem) => (
              <button
                key={oem}
                onClick={() => setActiveOemTab(oem)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  activeOemTab === oem
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {oem}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="liquid-glass p-4 rounded-2xl text-xs space-y-3">
          {activeOemTab === 'xiaomi' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-semibold text-white">Xiaomi / Redmi (MIUI & HyperOS) Autostart Bypass:</span>
                <span className="text-amber-400 font-mono text-[11px]">Action: com.miui.securitycenter</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1. Navigate to <strong>Security &gt; Manage Apps &gt; JARVIS AI &gt; Autostart</strong> (Toggle ON).
                <br />
                2. Set <strong>Battery Saver</strong> to <em>"No restrictions"</em>.
                <br />
                3. Lock app in Recent Tasks menu (swipe down on thumbnail &gt; click Padlock icon).
              </p>
              <div className="bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>adb shell dumpsys deviceidle whitelist +com.jarvis.assistant</span>
                <Terminal className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {activeOemTab === 'samsung' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-semibold text-white">Samsung OneUI Deep Sleeping Apps Bypass:</span>
                <span className="text-blue-400 font-mono text-[11px]">Action: com.samsung.android.lool</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1. Go to <strong>Settings &gt; Battery and Device Care &gt; Battery &gt; Background usage limits</strong>.
                <br />
                2. Ensure JARVIS AI is added to <strong>"Never sleeping apps"</strong>.
                <br />
                3. Under <strong>App Info &gt; Battery</strong>, select <em>"Unrestricted"</em>.
              </p>
              <div className="bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>adb shell cmd deviceidle whitelist +com.jarvis.assistant</span>
                <Terminal className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {activeOemTab === 'oneplus' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-semibold text-white">OnePlus (OxygenOS) Sleep Standby Optimization:</span>
                <span className="text-rose-400 font-mono text-[11px]">Action: com.oneplus.security</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1. Open <strong>Settings &gt; Battery &gt; Advanced settings &gt; Optimize battery use</strong>.
                <br />
                2. Locate JARVIS AI and choose <strong>"Don't optimize"</strong>.
                <br />
                3. Disable <em>"Sleep standby optimization"</em>.
              </p>
              <div className="bg-black/40 p-2.5 rounded-xl font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>adb shell appops set com.jarvis.assistant RUN_IN_BACKGROUND allow</span>
                <Terminal className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
