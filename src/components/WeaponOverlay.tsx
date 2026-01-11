import { usePanelStore } from "../stores/panelStore";

export function WeaponOverlay() {
  const { hoveredWeapon, isOpen, panelType } = usePanelStore();

  // Only show when player panel is open and weapon is hovered
  if (!hoveredWeapon || !isOpen || panelType !== "player") return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-[#0a0e13]/90 backdrop-blur-sm animate-fade-in" />

      {/* Content container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        {/* Weapon type */}
        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-cyan/60">{hoveredWeapon.weaponType}</span>
        </div>

        {/* Weapon image - large with glow */}
        <div className="relative w-full max-w-[280px] h-[120px] flex items-center justify-center mb-4 animate-weapon-enter">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-accent-cyan/10 blur-3xl rounded-full" />

          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute inset-0 scan-lines" />
          </div>

          {/* Weapon image */}
          <img src={hoveredWeapon.icon} alt="" className="relative max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(0,212,170,0.4)]" />
        </div>

        {/* Weapon name - clean */}
        <h2 className="text-lg font-black text-primary tracking-wide">{hoveredWeapon.name}</h2>

        {/* Decorative lines */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-px bg-linear-to-r from-transparent to-accent-cyan/50" />
          <div className="w-1.5 h-1.5 rotate-45 border border-accent-cyan/50" />
          <div className="w-8 h-px bg-linear-to-l from-transparent to-accent-cyan/50" />
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-accent-cyan/40" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-accent-cyan/40" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-accent-cyan/40" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-accent-cyan/40" />
    </div>
  );
}
