/**
 * Left sidebar: app branding, Spotify login/logout, status.
 */

import type { ReactNode } from 'react';

interface SidebarProps {
  isSpotifyLoggedIn: boolean;
  isHandlingCallback: boolean;
  spotifyError: string | null;
  onLogin: () => void;
  onLogout: () => void;
  children?: ReactNode;
}

export function Sidebar({
  isSpotifyLoggedIn,
  isHandlingCallback,
  spotifyError,
  onLogin,
  onLogout,
  children,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="sidebar-title">PulseMix</h1>
        <p className="sidebar-tagline">Mix Spotify &amp; SoundCloud</p>
      </div>

      <div className="sidebar-spotify">
        {isSpotifyLoggedIn ? (
          <button type="button" className="btn btn-secondary" onClick={onLogout} disabled={isHandlingCallback}>
            Log out (Spotify)
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onLogin} disabled={isHandlingCallback}>
            {isHandlingCallback ? 'Logging in…' : 'Log in with Spotify'}
          </button>
        )}
      </div>

      <div className="sidebar-status">
        {spotifyError && <p className="sidebar-error">{spotifyError}</p>}
        {isSpotifyLoggedIn && !spotifyError && (
          <p className="sidebar-status-text">Spotify connected</p>
        )}
      </div>

      {children}
    </aside>
  );
}
