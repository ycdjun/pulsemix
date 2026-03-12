interface SidebarProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">P</div>
        <div>
          <h1>PulseMix</h1>
          <p>Spotify + SoundCloud playlist lab</p>
        </div>
      </div>

      <div className="panel">
        <h2>Spotify</h2>
        <p className="muted">
          Log in to search Spotify tracks and play them through the Spotify Web Playback SDK.
        </p>
        <button className="button primary" onClick={props.isAuthenticated ? props.onLogout : props.onLogin}>
          {props.isAuthenticated ? 'Log out of Spotify' : 'Log in with Spotify'}
        </button>
        {props.isLoading ? <p className="muted">Completing Spotify login…</p> : null}
        {props.authError ? <p className="error">{props.authError}</p> : null}
      </div>

      <div className="panel">
        <h2>How this works</h2>
        <ul className="hint-list">
          <li>SoundCloud samples are available immediately.</li>
          <li>Spotify search unlocks after login.</li>
          <li>Your mixed playlist is saved in local storage.</li>
        </ul>
      </div>
    </aside>
  );
}
