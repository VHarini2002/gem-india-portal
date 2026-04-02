import BottomDock from '@/components/BottomDock';
import GemAiChat from '@/components/GemAiChat';

type PortalFooterProps = {
  activePanel: 'settings' | 'files' | null;
  onOpenPanel: (panel: 'settings' | 'files') => void;
};

const PortalFooter = ({ activePanel, onOpenPanel }: PortalFooterProps) => {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/10 bg-[#0a0a0b]/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
      aria-label="Navigation and assistant"
    >
      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-[1fr_auto_1fr] items-center gap-1 px-2 sm:px-4 md:px-10 py-2 pb-3 min-h-[4.25rem]">
        <div className="min-w-0" aria-hidden />
        <div className="flex min-w-0 justify-center">
          <BottomDock activePanel={activePanel} onOpenPanel={onOpenPanel} />
        </div>
        <div className="flex min-w-0 justify-end items-center pr-1 sm:pr-0 md:-mr-4">
          <GemAiChat embeddedInFooter />
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
