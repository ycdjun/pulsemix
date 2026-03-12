interface SidebarProps {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  onLogin: () => void | Promise<void>;
  onLogout: () => void;
}

export function Sidebar({ isLoggedIn, isLoggingIn, authError, onLogin, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-card">
        <div className="brand-logo">P</div>
        <div>
          <h1>PulseMix</h1>
          <p>Spotify + SoundCloud playlist builder</p>
        </div>
      </div>

      <div className="panel">
        <h2>Spotify account</h2>
        <p className="muted">Log in with Spotify to search tracks and use the Web Playback SDK.</p>

        {isLoggedIn ? (
          <button className="button button-secondary" onClick={onLogout}>
            Log out
          </button>
        ) : (
          <button className="button button-primary" onClick={onLogin} disabled={isLoggingIn}>
            {isLoggingIn ? 'Redirecting…' : 'Log in with Spotify'}
          </button>
        )}

        {authError ? <p className="error-text">{authError}</p> : null}
      </div>

      <div className="panel">
        <h2>How this demo works</h2>
        <ul className="bullet-list muted">
          <li>Spotify tracks come from live search after login.</li>
          <li>SoundCloud tracks come from public sample embeds.</li>
          <li>One playlist can hold both providers together.</li>
        </ul>
      </div>
    </aside>
  );
}
