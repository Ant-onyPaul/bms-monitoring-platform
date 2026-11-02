import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Overview } from '../types/database.types';
import { NavAlert, NavAlertTone, alertIndicator, toNavAlerts } from '../services/navigation';
import { relativeTime } from './tableCells';
import CommandPalette from './CommandPalette';
import ThemeToggle from './ThemeToggle';
import { Badge, LiveDot } from './ui/Badge';
import {
  IconMenu,
  IconSearch,
  IconBell,
  IconChevronRight,
  IconWarning,
  IconFault,
  IconInfo,
  IconLogout,
} from './icons';

/* -----------------------------------------------------------------------------
   Navbar

   Carries orientation, not decoration: where you are (breadcrumb), what needs
   attention (notifications), and a way to jump anywhere (⌘K). It sits on the
   canvas colour rather than white so the page's panels remain the brightest
   thing on screen.
   -------------------------------------------------------------------------- */

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  vendor: 'Vendor',
  customer: 'Customer',
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  customers: 'Customers',
  devices: 'Devices',
};

const ALERT_ICON: Record<NavAlertTone, typeof IconInfo> = {
  crit: IconFault,
  warn: IconWarning,
  info: IconInfo,
};

/* Alerts come from /api/overview — the same, role-scoped feed as the
   dashboards' alert panels. Loaded with the page and refreshed each time the
   bell is opened. */
function useNavAlerts(enabled: boolean) {
  const [alerts, setAlerts] = useState<NavAlert[] | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    if (!enabled) return;
    api<Overview>('/api/overview')
      .then((overview) => {
        setAlerts(toNavAlerts(overview.alerts ?? [], (iso) => relativeTime(iso)));
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [enabled]);

  useEffect(refresh, [refresh]);
  return { alerts, failed, refresh };
}

export default function Navbar({ toggleSidebar }: any) {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const { alerts, failed: alertsFailed, refresh: refreshAlerts } = useNavAlerts(Boolean(profile));
  const indicator = alertIndicator(alerts);
  const userRef = useRef<HTMLDivElement>(null);

  /* ⌘K / Ctrl-K opens the palette from anywhere in the app. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* One shared outside-click handler for both popovers. */
  useEffect(() => {
    if (!notificationsOpen && !userOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (notificationsOpen && !notificationsRef.current?.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userOpen && !userRef.current?.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [notificationsOpen, userOpen]);

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, index) => ({
    label: SEGMENT_LABELS[segment] ?? decodeURIComponent(segment).toUpperCase(),
    path: `/${segments.slice(0, index + 1).join('/')}`,
    isId: !SEGMENT_LABELS[segment],
  }));

  const initials = (profile?.full_name || 'User')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <header
        className="h-16 shrink-0 sticky top-0 z-30 glass-chrome border-b border-line
          flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10"
      >
        {/* Orientation */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open navigation"
            className="lg:hidden -ml-1.5 w-9 h-9 shrink-0 inline-flex items-center justify-center
              rounded-[9px] text-ink-3 hover:text-ink hover:bg-veil-2 cursor-pointer
              transition-colors duration-200"
          >
            <IconMenu size={18} />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 hidden sm:block">
            <ol className="flex items-center gap-1.5 text-[12.5px]">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                    {index > 0 && (
                      <IconChevronRight size={12} className="text-ink-4 shrink-0" />
                    )}
                    {isLast ? (
                      <span
                        className={`font-semibold text-ink truncate ${
                          crumb.isId ? 'data-technical text-[12px]' : ''
                        }`}
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-ink-3 hover:text-ink transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Palette trigger — a target, not a live input, so it never steals typing */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden md:inline-flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-[9px]
              glass-control text-[12.5px] text-ink-4 cursor-pointer
              hover:border-line-2 hover:text-ink-2 hover:bg-veil-3
              transition-[background-color,border-color,color] duration-200
              w-56 lg:w-72"
          >
            <IconSearch size={14} className="shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="data-technical text-[10px] text-ink-4 border border-line
              rounded-[4px] px-1.5 py-0.5 bg-veil-2">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-[9px]
              text-ink-3 hover:bg-veil-2 hover:text-ink cursor-pointer transition-colors"
          >
            <IconSearch size={17} />
          </button>

          {/* Colour theme */}
          <ThemeToggle />

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                if (!notificationsOpen) refreshAlerts();
                setNotificationsOpen((o) => !o);
                setUserOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              className={`relative w-9 h-9 inline-flex items-center justify-center rounded-md
                cursor-pointer transition-colors duration-150
                ${notificationsOpen ? 'bg-veil-3 text-ink' : 'text-ink-3 hover:bg-veil-2 hover:text-ink-2'}`}
            >
              <IconBell size={17} />
              {indicator && indicator !== 'info' && (
                <span className="absolute top-1.5 right-1.5">
                  <LiveDot tone={indicator} size={6} live />
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-[352px] glass-menu rounded-[13px]
                  overflow-hidden animate-menu-in z-[70]"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <span className="label-technical">Active alerts</span>
                  {alerts && (
                    <Badge tone={indicator ?? 'neutral'} size="xs">
                      {alerts.length}
                    </Badge>
                  )}
                </div>
                {(!alerts || alerts.length === 0) && (
                  <p className="px-4 py-6 text-center text-[12.5px] text-ink-3">
                    {alertsFailed ? 'Could not load alerts.' : alerts ? 'No active alerts.' : 'Loading alerts…'}
                  </p>
                )}
                <ul className="max-h-80 overflow-y-auto scrollbar-fine divide-y divide-line">
                  {(alerts ?? []).map((item) => {
                    const Icon = ALERT_ICON[item.tone];
                    const iconTone =
                      item.tone === 'crit'
                        ? 'text-crit'
                        : item.tone === 'warn'
                          ? 'text-warn'
                          : 'text-info';
                    return (
                      <li key={item.id}>
                        <div className="flex items-start gap-3 px-4 py-3 hover:bg-veil-1 transition-colors">
                          <Icon size={15} className={`${iconTone} shrink-0 mt-0.5`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-ink leading-snug">
                              {item.title}
                            </p>
                            <p className="data-technical text-[11px] text-ink-4 mt-1 truncate">
                              {item.context}
                            </p>
                          </div>
                          <span className="data-technical text-[11px] text-ink-4 shrink-0">
                            {item.time}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Identity */}
          <div ref={userRef} className="relative pl-2 ml-1 border-l border-line">
            <button
              type="button"
              onClick={() => {
                setUserOpen((o) => !o);
                setNotificationsOpen(false);
              }}
              aria-label="Account menu"
              aria-expanded={userOpen}
              className="flex items-center gap-2.5 h-10 pl-1 pr-2 rounded-[9px] cursor-pointer
                hover:bg-veil-2 transition-colors duration-200"
            >
              <span
                className="w-8 h-8 shrink-0 rounded-[8px] inline-flex items-center justify-center
                  text-[11px] font-bold tracking-wide text-on-brand
                  btn-primary-fill"
              >
                {initials}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[12.5px] font-semibold text-ink">
                  {profile?.full_name || 'Signed in'}
                </span>
                <span className="label-technical !text-[9.5px]">
                  {profile?.role ?? 'user'}
                </span>
              </span>
            </button>

            {userOpen && (
              <div
                className="absolute right-0 mt-2 w-64 glass-menu rounded-[13px]
                  overflow-hidden animate-menu-in z-[70]"
              >
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {profile?.full_name || 'Signed in'}
                  </p>
                  <p className="text-[11.5px] text-ink-4 truncate mt-0.5">
                    {profile?.email || '—'}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-[8px] text-[13px]
                      font-medium text-ink-2 hover:text-crit-ink hover:bg-crit-surface
                      cursor-pointer transition-colors"
                  >
                    <IconLogout size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
