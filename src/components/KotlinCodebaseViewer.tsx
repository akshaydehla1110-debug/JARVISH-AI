import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Code2,
  FolderTree,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { KOTLIN_ARCHITECTURE_FILES, CodeFile } from '../data/kotlinCodebase';
import { generateAndroidStudioProjectZip } from '../utils/zipGenerator';

export const KotlinCodebaseViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(KOTLIN_ARCHITECTURE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidStudioProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'JarvisAI-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create project zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const lineCount = selectedFile.content.split('\n').length;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="liquid-glass-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Production Kotlin Architecture</span>
            <span className="text-xs font-mono text-cyan-300 font-normal bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              Target SDK 35 (Android 14/15)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse complete source code for WindowManager overlays, low-power wake-word listeners,
            GLSL fluid orb shaders, and headless accessibility automation.
          </p>
        </div>

        {/* Download Project ZIP */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Packaging ZIP...' : 'Download Android Studio Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Main Code Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 liquid-glass-card p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span>Project Structure</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {KOTLIN_ARCHITECTURE_FILES.length} Files
            </span>
          </div>

          <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
            {KOTLIN_ARCHITECTURE_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                  selectedFile.name === file.name
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${
                  selectedFile.name === file.name ? 'text-cyan-400' : 'text-slate-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium block truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate font-mono mt-0.5">
                    {file.path}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Editor: Code & Meta */}
        <div className="lg:col-span-8 liquid-glass-card rounded-3xl overflow-hidden flex flex-col border border-white/10">
          {/* Editor Header */}
          <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-white">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                  {selectedFile.language}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {lineCount} lines
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass-button text-xs font-medium text-slate-200 hover:text-white cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Code Container */}
          <div className="relative flex-1 bg-[#05070b] overflow-x-auto max-h-[540px] text-xs font-mono p-4">
            <pre className="text-slate-300 leading-relaxed font-mono">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
