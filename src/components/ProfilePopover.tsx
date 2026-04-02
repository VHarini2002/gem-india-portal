import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';

type ProfilePopoverProps = {
  open: boolean;
  name?: string;
  email?: string;
  phone?: string;
  onClose: () => void;
};

const ProfilePopover = ({ open, name, email, phone, onClose }: ProfilePopoverProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const safeName = name?.trim() || '—';
  const safeEmail = email?.trim() || '—';
  const safePhone = phone?.trim() || '—';

  const subtitle = useMemo(() => safeEmail, [safeEmail]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current) return;
      if (ref.current.contains(t)) return;
      onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed top-[62px] right-[48px] z-[80] w-[280px] max-w-[calc(100vw-24px)] rounded-2xl border border-white/10 bg-[#0a0a0b]/92 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
      role="dialog"
      aria-label="Profile"
    >
      <div className="p-5 flex items-start justify-between gap-4 border-b border-white/10">
        <div className="min-w-0">
          <div className="text-[13px] font-heading font-bold text-white truncate">{safeName}</div>
          <div className="text-[11px] text-white/45 mt-1 truncate">{subtitle}</div>
          <div className="text-[11px] text-white/45 mt-1 truncate">{safePhone}</div>
        </div>
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-white/10 text-white/50 transition-colors"
          onClick={onClose}
          aria-label="Close profile"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 pt-4" aria-hidden="true" />
    </div>
  );
};

export default ProfilePopover;

