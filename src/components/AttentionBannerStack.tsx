import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { AttentionItem } from '@/lib/engineIntelligence';

const ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
} as const;

const colors = (severity: AttentionItem['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        border: 'rgba(239, 68, 68, 0.5)',
        bg: 'rgba(239, 68, 68, 0.12)',
        text: '#fca5a5',
        hoverBg: '#fca5a51F',
      };
    case 'warning':
      return {
        border: 'rgba(245, 192, 0, 0.45)',
        bg: 'rgba(245, 192, 0, 0.12)',
        text: '#f5c000',
        hoverBg: '#f5c0001F',
      };
    default:
      return {
        border: 'rgba(255, 255, 255, 0.35)',
        bg: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        hoverBg: '#ffffff1F',
      };
  }
};

type AttentionBannerStackProps = {
  items: AttentionItem[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
};

/**
 * Top-right attention banners, animated like the HTML notification banners.
 */
const AttentionBannerStack = ({ items, onDismiss, onDismissAll }: AttentionBannerStackProps) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="gem-banner-stack gem-banner-stack--attention" aria-live="polite">
      {items.map((data, index) => {
        const Icon = ICONS[data.severity];
        const c = colors(data.severity);
        const hoverBg = c.hoverBg;

        return (
          <div
            key={data.id}
            className="gem-banner"
            style={{
              borderColor: c.border,
              // Match the reference HTML delays: 0.2s, 0.4s, 0.6s...
              animationDelay: `${(index + 1) * 0.2}s`,
            }}
          >
            <div className="gem-banner-icon-bg" style={{ background: c.bg, color: c.text }}>
              <Icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="gem-banner-content">
              <div className="gem-banner-title">{data.title}</div>
              <div className="gem-banner-desc">{data.description}</div>
            </div>
            <div className="gem-banner-actions">
              <button
                type="button"
                className="gem-banner-cta"
                style={
                  {
                    borderColor: c.border,
                    color: c.text,
                    ['--hover-bg' as string]: hoverBg,
                  } as CSSProperties
                }
                onClick={() => {
                  onDismiss(data.id);
                  if (data.ctaHref) navigate(data.ctaHref);
                }}
              >
                {data.ctaLabel}
              </button>
              <button
                type="button"
                className="gem-banner-close"
                aria-label="Dismiss"
                onClick={() => onDismiss(data.id)}
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttentionBannerStack;

