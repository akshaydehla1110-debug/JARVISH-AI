export interface OrbCustomization {
  // Orb Colors
  primaryColor: string; // Primary fluid blob (e.g. Electric Cyan #00f0ff)
  secondaryColor: string; // Secondary fluid blob (e.g. Crimson Magenta #ff0055)
  glassTint: string; // Outer liquid glass refraction tint (#e2f2ff)
  glowIntensity: number; // 0.5 to 2.0

  // Structure & Fluid Physics
  speed: number; // Convection animation speed multiplier (0.3 to 2.5)
  turbulence: number; // Simplex fluid vorticity (0.3 to 2.5)
  displacement: number; // Vertex amplitude reaction (0.05 to 0.4)
  refractionIor: number; // Glass index of refraction (1.1 to 2.2)
  glassOpacity: number; // Silicone outer shell transmission (0.2 to 1.0)
  size: number; // Orb diameter in px (160 to 420)

  // Screen Position
  position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'floating';
  floatingCoords?: { x: number; y: number };

  // Voice & Language Customization
  accent: 'en-IN' | 'en-GB' | 'en-US';
  voicePitch: number; // 0.65 to 1.1 (default 0.78 deep clear male voice)
  voiceSpeed: number; // 0.8 to 1.3 (default 1.0)
  honorific: 'Sir' | 'Boss' | 'Ma\'am';
  zeroTalkMode: boolean; // When true: never repeat commands; execute silently
}

export const PRESET_THEMES: {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  glass: string;
}[] = [
  {
    name: 'Cyber Cyan & Crimson',
    description: 'Original JARVIS high-contrast quantum fluid cores',
    primary: '#00f0ff',
    secondary: '#ff0055',
    glass: '#e2f2ff',
  },
  {
    name: 'Matrix Emerald & Azure',
    description: 'Deep biosensor green with azure hydrodynamic swirl',
    primary: '#00ff88',
    secondary: '#0066ff',
    glass: '#d4ffea',
  },
  {
    name: 'Solar Amber & Ruby',
    description: 'High-energy thermonuclear plasma flare',
    primary: '#ffaa00',
    secondary: '#ff0033',
    glass: '#fff0d4',
  },
  {
    name: 'Deep Violet & Electric Rose',
    description: 'Luxury neural synchrotron spectral emission',
    primary: '#9900ff',
    secondary: '#ff00aa',
    glass: '#f3e5ff',
  },
  {
    name: 'Arctic Ice & Sapphire',
    description: 'Sub-zero pure crystalline refraction',
    primary: '#00ccff',
    secondary: '#0022cc',
    glass: '#e8f8ff',
  },
  {
    name: 'Stealth Obsidian & Gold',
    description: 'Tactical titanium core with royal bullion convection',
    primary: '#ffcc00',
    secondary: '#222831',
    glass: '#fff9e6',
  },
];

export const DEFAULT_CUSTOMIZATION: OrbCustomization = {
  primaryColor: '#00f0ff',
  secondaryColor: '#ff0055',
  glassTint: '#e2f2ff',
  glowIntensity: 1.0,
  speed: 1.0,
  turbulence: 1.0,
  displacement: 0.16,
  refractionIor: 1.46,
  glassOpacity: 0.92,
  size: 320,
  position: 'center',
  accent: 'en-IN',
  voicePitch: 0.78, // Deep clear male voice
  voiceSpeed: 1.0,
  honorific: 'Sir',
  zeroTalkMode: true, // Never repeat, execute directly
};
