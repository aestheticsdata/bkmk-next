// filter-modals.jsx — filter overlays that float on top of any view

const { useContext } = React;

function Backdrop({ onClick, dark }) {
  return (
    <div onClick={onClick} style={{
      position: 'absolute', inset: 0,
      background: dark || 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(2px)',
      zIndex: 50,
      animation: 'bkmk-fade .15s ease-out',
    }} />
  );
}

// =========== PHOSPHOR — terminal modal ============
function FilterModal_Phosphor() {
  const ctx = useContext(window.BkmkCtx);
  return (
    <>
      <Backdrop onClick={ctx.closeFilters} dark="rgba(5,10,6,0.78)" />
      <div className="theme-phosphor" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 580,
        background: 'var(--bg)',
        border: '1px solid var(--fg-2)',
        boxShadow: '0 0 0 1px var(--bg), 0 0 60px rgba(95,255,133,0.35), 0 0 12px rgba(95,255,133,0.15) inset',
        zIndex: 51,
        animation: 'bkmk-pop .2s cubic-bezier(.2,.7,.3,1)',
        fontFamily: 'var(--font)',
        color: 'var(--fg)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', padding: '6px 12px',
          borderBottom: '1px solid var(--border-2)', background: 'var(--bg-2)',
        }}>
          <span className="accent" style={{ marginRight: 8, textShadow: '0 0 6px var(--accent)' }}>●</span>
          <span className="bright" style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--fg-2)', textShadow: '0 0 6px var(--fg-2)' }}>filter --interactive</span>
          <span data-clickable onClick={ctx.closeFilters} className="dim" style={{ marginLeft: 'auto', fontSize: 11, cursor: 'pointer' }}>[esc] close</span>
        </div>
        <div style={{ padding: 22 }}>
          {[
            { label: 'category', val: '#dev × #demoscene' },
            { label: 'title',    val: '~ amiga|copper' },
            { label: 'stars',    val: '≥ 3' },
            { label: 'priority', val: 'high | med' },
            { label: 'reminder', val: 'any' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="dim uppercase" style={{ width: 100, fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg-3)' }}>{r.label}</span>
              <span className="accent" style={{ marginRight: 4, color: 'var(--accent)' }}>›</span>
              <span className="bright" style={{ flex: 1, color: 'var(--fg-2)' }}>{r.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, fontSize: 11, color: 'var(--fg-3)', alignItems: 'center' }}>
            <span className="uppercase" style={{ width: 100, fontSize: 11, letterSpacing: '0.1em' }}>contains</span>
            <span style={{ padding: '2px 7px', border: '1px solid var(--accent)', color: 'var(--accent)' }}>screenshot ✓</span>
            <span style={{ padding: '2px 7px', border: '1px solid var(--border)' }}>notes</span>
            <span style={{ padding: '2px 7px', border: '1px solid var(--border)' }}>url</span>
          </div>
          <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border-2)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn primary" onClick={ctx.closeFilters} style={{
              padding: '7px 14px', border: '1px solid var(--accent)', background: 'var(--accent)', color: '#000',
              fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}>› apply</button>
            <button className="btn" onClick={ctx.closeFilters} style={{
              padding: '7px 14px', border: '1px solid var(--border-2)', background: 'var(--bg-2)',
              color: 'var(--fg-2)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}>reset</button>
            <span className="dim" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg-3)' }}>
              matches: <span className="bright" style={{ color: 'var(--fg-2)' }}>27</span> / 312
            </span>
          </div>
          <div className="dim" style={{ marginTop: 10, fontSize: 11, color: 'var(--fg-3)' }}>
            tip: ⌘k for command palette · ⏎ to apply
          </div>
        </div>
      </div>
    </>
  );
}

// =========== PAPERWHITE — centered card ============
function FilterModal_Paperwhite() {
  const ctx = useContext(window.BkmkCtx);
  const PALD = window.BKMK_DATA.tagPalette;
  return (
    <>
      <Backdrop onClick={ctx.closeFilters} dark="rgba(60,50,40,0.42)" />
      <div className="theme-paperwhite" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 540,
        background: 'var(--panel)',
        border: '1px solid var(--border-2)',
        boxShadow: '0 24px 60px rgba(26,22,18,0.25)',
        zIndex: 51,
        animation: 'bkmk-pop .2s cubic-bezier(.2,.7,.3,1)',
        fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--fg)',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>filters · advanced</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Refine the index.</div>
          </div>
          <span data-clickable onClick={ctx.closeFilters} style={{ fontSize: 22, color: 'var(--fg-3)', cursor: 'pointer', padding: '0 6px' }}>×</span>
        </div>
        <div style={{ padding: '20px 28px', display: 'grid', gap: 16 }}>
          <FRow label="SEARCH">
            <input defaultValue="amiga" style={{
              width: '100%', font: 'inherit', background: 'transparent',
              border: 0, borderBottom: '1px solid var(--border-2)',
              padding: '4px 0', outline: 'none', color: 'var(--fg)',
            }} />
          </FRow>
          <FRow label="CATEGORIES">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['dev','demoscene','amiga','python','blogpost','youtube'].map((t, i) => (
                <span key={t} style={{
                  padding: '3px 10px',
                  border: i < 2 ? '1px solid var(--fg)' : '1px solid var(--border)',
                  background: i < 2 ? 'var(--fg)' : 'transparent',
                  color: i < 2 ? 'var(--bg)' : 'var(--fg)',
                  fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}>{t}</span>
              ))}
            </div>
          </FRow>
          <FRow label="MIN STARS">
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize: 18, color: n <= 3 ? 'var(--accent)' : 'var(--fg-4)' }}>★</span>
              ))}
              <span style={{ marginLeft: 10, alignSelf: 'center', fontSize: 11, color: 'var(--fg-3)' }}>3 stars or more</span>
            </div>
          </FRow>
          <FRow label="PRIORITY">
            <div style={{ display: 'flex', gap: 8 }}>
              {['high','med','low','—'].map((p, i) => (
                <span key={p} style={{
                  padding: '3px 12px', fontSize: 11,
                  border: i < 2 ? '1px solid var(--fg)' : '1px solid var(--border)',
                  background: i < 2 ? 'var(--fg)' : 'transparent',
                  color: i < 2 ? 'var(--bg)' : 'var(--fg)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}>{p}</span>
              ))}
            </div>
          </FRow>
          <FRow label="HAS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['screenshot', true], ['notes', false], ['reminder', false]].map(([n, on]) => (
                <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{
                    width: 12, height: 12,
                    border: '1px solid var(--fg)',
                    background: on ? 'var(--fg)' : 'transparent',
                    position: 'relative',
                  }}>
                    {on && <span style={{ position: 'absolute', inset: 0, color: 'var(--bg)', fontSize: 10, display: 'grid', placeItems: 'center', lineHeight: 1 }}>✓</span>}
                  </span>
                  <span>{n}</span>
                </label>
              ))}
            </div>
          </FRow>
        </div>
        <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)' }}>
          <button onClick={ctx.closeFilters} style={{
            padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)',
            font: 'inherit', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12,
          }}>Apply — 27 results</button>
          <button onClick={ctx.closeFilters} style={{
            padding: '8px 16px', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--fg)',
            font: 'inherit', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12,
          }}>Clear</button>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg-3)' }}>27 / 312 match · live</span>
        </div>
      </div>
    </>
  );
}
function FRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// =========== NEON — HUD modal ============
function FilterModal_Neon() {
  const ctx = useContext(window.BkmkCtx);
  return (
    <>
      <Backdrop onClick={ctx.closeFilters} dark="rgba(11,8,32,0.78)" />
      <div className="theme-neon" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
        background: 'linear-gradient(180deg, rgba(20,16,46,0.97), rgba(11,8,32,0.97))',
        border: '1px solid #ff2bd6',
        boxShadow: '0 0 0 1px #0b0820, 0 0 80px rgba(255,43,214,0.45), inset 0 0 40px rgba(255,43,214,0.06)',
        zIndex: 51,
        animation: 'bkmk-pop .22s cubic-bezier(.2,.7,.3,1)',
        fontFamily: '"Space Mono", monospace',
        color: '#e8e6ff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid #ff2bd6', justifyContent: 'space-between' }}>
          <div style={{ letterSpacing: '0.3em', fontSize: 12, color: '#fff', textShadow: '0 0 8px #fff' }}>// QUERY BUILDER</div>
          <span data-clickable onClick={ctx.closeFilters} style={{ fontSize: 11, letterSpacing: '0.2em', color: '#ff2bd6', cursor: 'pointer', textShadow: '0 0 8px #ff2bd6' }}>[ESC] CLOSE</span>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <NField label="MATCH" value="amiga OR demoscene" />
          <NField label="TAGS" custom={
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <Tag name="dev" /><Tag name="amiga" /><Tag name="demoscene" />
            </div>
          } />
          <NField label="MIN STARS" custom={
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize: 18, color: n <= 3 ? '#ff2bd6' : '#524a85', textShadow: n <= 3 ? '0 0 6px #ff2bd6' : 'none' }}>★</span>
              ))}
            </div>
          } />
          <NField label="PRIORITY" value="high | med" />
          <NField label="DATE RANGE" value="2025-01 → 2026-01" />
          <NField label="HAS" custom={
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {[['screenshot', true], ['notes', false], ['reminder', false]].map(([n, on]) => (
                <span key={n} style={{
                  padding: '2px 8px', fontSize: 10, letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  border: on ? '1px solid #00f0ff' : '1px solid rgba(183,110,255,0.22)',
                  color: on ? '#00f0ff' : '#8580b5',
                  boxShadow: on ? '0 0 8px rgba(0,240,255,0.3)' : 'none',
                  cursor: 'pointer',
                }}>{on ? '✓ ' : '  '}{n}</span>
              ))}
            </div>
          } />
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #ff2bd6', background: 'rgba(255,43,214,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={ctx.closeFilters} style={{
            padding: '7px 16px', background: '#ff2bd6', color: '#0b0820', border: '1px solid #ff2bd6',
            font: 'inherit', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
            boxShadow: '0 0 16px rgba(255,43,214,0.5)',
          }}>► EXECUTE</button>
          <button onClick={ctx.closeFilters} style={{
            padding: '7px 16px', background: 'transparent', color: '#ff2bd6', border: '1px solid #ff2bd6',
            font: 'inherit', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>CLEAR</button>
          <div style={{ marginLeft: 'auto', fontSize: 11, letterSpacing: '0.2em' }}>
            <span style={{ color: '#8580b5' }}>MATCHES </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#ff2bd6', textShadow: '0 0 6px #ff2bd6' }}>27</span>
            <span style={{ color: '#8580b5' }}> / 312</span>
          </div>
        </div>
      </div>
    </>
  );
}
function NField({ label, value, custom }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#00f0ff', marginBottom: 4 }}>[ {label} ]</div>
      {custom || (
        <div style={{ borderBottom: '1px solid #00f0ff', paddingBottom: 4, color: '#fff', fontSize: 13, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#ff2bd6', marginRight: 6 }}>›</span>{value}
        </div>
      )}
    </div>
  );
}

window.FilterModal_Phosphor   = FilterModal_Phosphor;
window.FilterModal_Paperwhite = FilterModal_Paperwhite;
window.FilterModal_Neon       = FilterModal_Neon;
