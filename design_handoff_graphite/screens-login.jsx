// screens.jsx — all 6 redesigned screens
// theme-agnostic; outer wrapper sets .theme-{phosphor|paperwhite|neon}.bkmk-screen

const { useState, useMemo } = React;

const DATA = window.BKMK_DATA;
const PAL  = DATA.tagPalette;

// ============ tag pill (themed via CSS) =============
function Tag({ name }) {
  const p = PAL[name] || { hue: 200, name };
  return <span className="tag" style={{ '--th': p.hue }}>{p.name}</span>;
}

function Stars({ n, max = 5 }) {
  if (!n) return null;
  return (
    <span className="stars" aria-label={`${n} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ opacity: i < n ? 1 : 0.18 }}>★</span>
      ))}
    </span>
  );
}

function PriorityGlyph({ p }) {
  if (p === 'high') return <span className="accent" style={{ letterSpacing: '-2px' }}>↑↑↑</span>;
  if (p === 'med')  return <span className="dim">↑↑</span>;
  if (p === 'low')  return <span className="dim-2">↑</span>;
  return <span className="dim-2">—</span>;
}

// Tiny placeholder thumb — stripes + label, no actual screenshot
function Thumb({ id, w = 56, h = 36, shot = true }) {
  if (!shot) {
    return (
      <div className="thumb-empty" style={{
        width: w, height: h,
        border: '1px dashed var(--border)',
        opacity: 0.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: 'var(--fg-4)',
      }}>—</div>
    );
  }
  const hue = (id * 31) % 360;
  return (
    <div style={{
      width: w, height: h,
      background: `repeating-linear-gradient(135deg, hsla(${hue},40%,40%,.35), hsla(${hue},40%,40%,.35) 4px, hsla(${hue},40%,55%,.18) 4px, hsla(${hue},40%,55%,.18) 8px)`,
      border: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
      flex: '0 0 auto',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, color: 'rgba(255,255,255,.65)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>shot</div>
    </div>
  );
}

// ============ Topbar ============
function Topbar({ active, variant }) {
  const ctx = React.useContext(window.BkmkCtx);
  const cur = active || ctx.view;
  const items = [
    { id: 'list',      label: 'bookmarks',    badge: DATA.total },
    { id: 'create',    label: 'create',       glyph: '+' },
    { id: 'reminders', label: 'reminders',    badge: DATA.reminders.length },
  ];
  return (
    <div className="bkmk-topbar">
      <div className="logo" data-clickable onClick={() => ctx.go('list')}>
        {variant === 'phosphor' && <><span style={{ marginRight: 2 }}>◆</span>BKMK<span className="mono-caret" /></>}
        {variant === 'paperwhite' && <><span>bkmk</span><span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>/v2</span></>}
        {variant === 'neon' && <><span className="glow">▰ BKMK</span></>}
        {variant === 'dusk' && <><span style={{ marginRight: 2, color: 'var(--accent)' }}>›</span>bkmk</>}
      </div>
      <nav className="nav">
        {items.map(it => (
          <a key={it.id} className={it.id === cur ? 'active' : ''} data-clickable onClick={() => ctx.go(it.id)}>
            {it.glyph && <span className="dim-2">{it.glyph}</span>}
            <span>{it.label}</span>
            {it.badge && <span className="dim-2">({it.badge})</span>}
          </a>
        ))}
      </nav>
      <div className="user" data-clickable onClick={() => ctx.go('login')} title="sign out">
        <span className="dim-2">user@</span>
        <span>{DATA.user}</span>
        <span className="dim">▾</span>
      </div>
    </div>
  );
}

// ====================================================================
// 1. LOGIN
// ====================================================================
function Login_Phosphor() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ width: 480 }}>
          <pre className="ascii bright" style={{ fontSize: 11, lineHeight: 1.1, color: 'var(--fg-2)', textShadow: '0 0 8px rgba(95,255,133,0.7)' }}>
{`  ____  _  ____  __  __  _  __
 | __ )| |/ /  \\/  ||  \\/  || |/ /
 |  _ \\| ' /| |\\/| || |\\/| || ' /
 | |_) | . \\| |  | || |  | || . \\
 |____/|_|\\_\\_|  |_||_|  |_||_|\\_\\`}
          </pre>
          <div className="dim" style={{ marginTop: 14, fontSize: 12 }}>
            v2.0.1 · personal bookmark store · since 2023
          </div>
          <div className="asciiBox" style={{ marginTop: 28, padding: '22px 24px', background: 'var(--bg-2)' }}>
            <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>$ login --identity</div>
            <div style={{ marginBottom: 18 }}>
              <div className="dim-2" style={{ fontSize: 11, marginBottom: 3 }}>EMAIL</div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-2)', paddingBottom: 5 }}>
                <span className="accent" style={{ marginRight: 8 }}>›</span>
                <span className="bright">user@example.com</span>
                <span className="mono-caret" style={{ marginLeft: 1 }} />
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <div className="dim-2" style={{ fontSize: 11, marginBottom: 3 }}>PASSPHRASE</div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 5 }}>
                <span className="dim" style={{ marginRight: 8 }}>›</span>
                <span style={{ letterSpacing: '2px' }}>●●●●●●●●●●●●●●●</span>
                <span style={{ marginLeft: 'auto' }} className="dim">[show]</span>
              </div>
            </div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => ctx.go('list')}>
              › Authenticate
            </button>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span className="dim">[tab] next field</span>
              <a className="accent" style={{ textDecoration: 'underline', textDecorationStyle: 'dotted' }}>forgot passphrase?</a>
            </div>
          </div>
          <div className="dim-2" style={{ marginTop: 18, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
            <span>tls: aes-256-gcm · session: 24h</span>
            <span>312 bookmarks indexed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login_Paperwhite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
        <div style={{ padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>bkmk · est. 2023</div>
            <div style={{ marginTop: 80 }}>
              <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.04em' }}>
                A quiet<br />place for<br />the things<br />you want<br />to <span className="accent" style={{ fontStyle: 'italic' }}>find again.</span>
              </h1>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)', display: 'grid', gap: 4 }}>
            <div>{DATA.total} bookmarks · 18 categories · 4 reminders due</div>
            <div>last synced 4 minutes ago</div>
          </div>
        </div>
        <div style={{ padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 32 }}>
            ── Sign in
          </div>
          <label style={{ display: 'block', marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>email</div>
            <input className="field" defaultValue="user@example.com" />
          </label>
          <label style={{ display: 'block', marginBottom: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>passphrase</span>
              <a style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--accent)', textDecoration: 'underline' }}>forgot?</a>
            </div>
            <input className="field" type="password" defaultValue="●●●●●●●●●●●●●●●" />
          </label>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }} onClick={() => ctx.go('list')}>Sign in →</button>
          <div style={{ marginTop: 28, fontSize: 11, color: 'var(--fg-3)', borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            No accounts. Invite-only. Mail <span className="accent">hello@bkmk</span> if you want in.
          </div>
        </div>
      </div>
    </div>
  );
}

function Login_Neon() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ width: 460, position: 'relative' }}>
          {/* corner brackets */}
          <div style={{ position: 'absolute', inset: -12, pointerEvents: 'none' }}>
            {['tl','tr','bl','br'].map(c => (
              <div key={c} className="accent glow" style={{
                position: 'absolute',
                width: 18, height: 18,
                borderColor: 'var(--accent)',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(c.includes('t') ? { top: 0, borderTopWidth: 2 } : { bottom: 0, borderBottomWidth: 2 }),
                ...(c.includes('l') ? { left: 0, borderLeftWidth: 2 } : { right: 0, borderRightWidth: 2 }),
                boxShadow: '0 0 12px var(--accent)',
              }} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="accent-2 glow" style={{ fontSize: 11, letterSpacing: '0.4em', color: 'var(--accent-2)' }}>// SECURE CHANNEL</div>
            <div className="glow bright" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '0.15em', marginTop: 8, color: '#fff' }}>
              B K M K
            </div>
            <div className="accent" style={{ fontSize: 12, letterSpacing: '0.3em', marginTop: 4 }}>━━ v2.0 ━━</div>
          </div>
          <div style={{ padding: 26, background: 'rgba(20,16,46,0.6)', border: '1px solid var(--border)', borderRadius: 2, backdropFilter: 'blur(2px)' }}>
            <label style={{ display: 'block', marginBottom: 18 }}>
              <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.25em', marginBottom: 6, color: 'var(--accent-2)' }}>[ EMAIL ]</div>
              <input className="field" defaultValue="user@example.com" />
            </label>
            <label style={{ display: 'block', marginBottom: 24 }}>
              <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.25em', marginBottom: 6, color: 'var(--accent-2)' }}>[ PASSPHRASE ]</div>
              <input className="field" type="password" defaultValue="●●●●●●●●●●●●●●●" />
            </label>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => ctx.go('list')}>
              ► JACK IN
            </button>
          </div>
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span className="dim">aes-256 · tls 1.3</span>
            <a className="accent-2" style={{ textDecoration: 'underline', color: 'var(--accent-2)' }}>recover ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Login_Phosphor   = Login_Phosphor;
window.Login_Paperwhite = Login_Paperwhite;
window.Login_Neon       = Login_Neon;
window.Topbar           = Topbar;
window.Tag              = Tag;
window.Stars            = Stars;
window.PriorityGlyph    = PriorityGlyph;
window.Thumb            = Thumb;
