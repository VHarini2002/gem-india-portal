import type { LucideIcon } from 'lucide-react';
import { Calendar, CheckCircle2, Download, Package } from 'lucide-react';

export type PortalGeneralNotificationIcon = 'approval' | 'milestone' | 'parts' | 'report';

export type PortalGeneralNotification = {
  id: string;
  title: string;
  description: string;
  cta: string;
  delay: string;
  colors: { border: string; bg: string; text: string };
  icon: PortalGeneralNotificationIcon;
  href?: string;
};

export const BANNER_ICONS: Record<PortalGeneralNotificationIcon, LucideIcon> = {
  approval: CheckCircle2,
  milestone: Calendar,
  parts: Package,
  report: Download,
};

/** Demo notifications shown in the notifications panel (bell). */
export const PORTAL_GENERAL_NOTIFICATIONS: PortalGeneralNotification[] = [
  {
    id: '1',
    title: 'Approval Required',
    description: 'CFM56-7B · Borescope findings need sign-off',
    cta: 'Review Now',
    delay: '0.2s',
    colors: { border: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
    icon: 'approval',
    href: '/dashboard',
  },
  {
    id: '2',
    title: 'Milestone in 3 Days',
    description: 'GE90-115B · Final inspection due soon',
    cta: 'View Engine',
    delay: '0.4s',
    colors: { border: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
    icon: 'milestone',
    href: '/dashboard',
  },
  {
    id: '3',
    title: 'Parts Hold',
    description: 'V2500-A5 · 2 parts awaiting your PO confirmation',
    cta: 'Confirm PO',
    delay: '0.6s',
    colors: { border: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
    icon: 'parts',
    href: '/dashboard',
  },
  {
    id: '4',
    title: 'Report Ready',
    description: 'Monthly teardown summary is available to download',
    cta: 'Download',
    delay: '0.8s',
    colors: { border: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.1)', text: '#ffffff' },
    icon: 'report',
    href: '/dashboard',
  },
];

export const PORTAL_GENERAL_NOTIFICATION_COUNT = PORTAL_GENERAL_NOTIFICATIONS.length;
