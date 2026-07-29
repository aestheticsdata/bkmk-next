// screens-list.jsx — bookmarks list, 3 different layouts per direction

const BM = window.BKMK_DATA.bookmarks;

// =================================================================
// PHOSPHOR — improved dense table, terminal/ncurses vibe
// =================================================================
function List_Phosphor() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="phosphor" />

        {/* command-bar */}
        <div style={{ padding: '10px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
          <span className="accent">›</span>
          <span className="dim">grep</span>
          <span className="bright" style={{ flex: 1, display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--fg-2)' }}>demoscene OR amiga</span>
            <span className="mono-caret" />
          </span>
          <span className="dim">┃</span>
          <span className="dim">sort:</span><span>added↓</span>
          <span className="dim">┃</span>
          <span className="dim">view:</span><span className="accent">[table]</span><span className="dim-2">cards</span><span className="dim-2">list</span>
          <span className="dim">┃</span>
          <span className="dim">page</span><span>01/13</span>
          <span className="dim-2">← →</span>
        </div>

        {/* filter chips + add-filter */}
        <div style={{ padding: '8px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
          <span className="dim-2 uppercase">filters:</span>
          <span style={{ padding: '2px 7px', border: '1px solid var(--border-2)', color: 'var(--fg-2)' }}>#dev</span>
          <span style={{ padding: '2px 7px', border: '1px solid var(--border-2)', color: 'var(--fg-2)' }}>★≥3</span>
          <span style={{ padding: '2px 7px', border: '1px solid var(--border-2)', color: 'var(--fg-2)' }}>has:screenshot</span>
          <span data-clickable onClick={ctx.toggleFilters} className="accent" style={{ padding: '2px 8px', border: '1px dashed var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            + filter
          </span>
          <span className="dim" style={{ marginLeft: 'auto' }}>27 / 312 match · 4 with reminders · 11 starred</span>
        </div>

        {/* table */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-2)' }}>
                {['', '◨', '#', 'title', 'tags', '★', 'pri', '⏰', 'added'].map((h, i) => (
                  <th key={i} className="dim uppercase" style={{
                    textAlign: 'left',
                    padding: '7px 10px',
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    fontWeight: 500,
                    color: 'var(--fg-3)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h && <span>{h} <span className="dim-2">↕</span></span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BM.slice(0, 18).map((b, idx) => {
                const sel = idx === 6;
                return (
                  <tr key={b.id}
                      data-clickable
                      onClick={() => ctx.open(b)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: sel ? 'rgba(95,255,133,0.08)' : 'transparent',
                        color: sel ? 'var(--fg-2)' : 'var(--fg)',
                      }}>
                    <td style={{ padding: '6px 6px 6px 12px', width: 16, color: 'var(--accent)' }}>
                      {sel ? '►' : ''}
                    </td>
                    <td style={{ padding: '4px 8px', width: 56 }}>
                      <Thumb id={b.id} shot={b.shot} w={48} h={28} />
                    </td>
                    <td className="dim-2" style={{ padding: '6px 10px', fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>
                      {String(b.id).padStart(4, '0')}
                    </td>
                    <td style={{ padding: '6px 10px', maxWidth: 460, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--accent)', marginRight: 6 }}>↳</span>
                      <span className={sel ? 'bright' : ''}>{b.title}</span>
                      {b.notes && <span className="dim" style={{ marginLeft: 8 }}>— {b.notes}</span>}
                    </td>
                    <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', gap: 8 }}>
                        {b.tags.slice(0, 2).map(t => <Tag key={t} name={t} />)}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      <Stars n={b.stars} />
                    </td>
                    <td style={{ padding: '6px 10px' }}><PriorityGlyph p={b.priority} /></td>
                    <td style={{ padding: '6px 10px', color: b.alarm ? 'var(--accent)' : 'var(--fg-4)' }}>
                      {b.alarm ? '●' : '○'}
                    </td>
                    <td className="dim" style={{ padding: '6px 14px 6px 10px', fontVariantNumeric: 'tabular-nums', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {b.dateLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* status bar */}
        <div style={{
          borderTop: '1px solid var(--border-2)',
          padding: '6px 22px',
          display: 'flex',
          gap: 18,
          fontSize: 11,
          background: 'var(--bg-2)',
        }}>
          <span data-clickable onClick={() => ctx.open(BM[6])}><span className="dim-2">↕</span> navigate</span>
          <span data-clickable onClick={() => ctx.open(BM[6])}><span className="dim-2">↵</span> open</span>
          <span data-clickable onClick={() => ctx.go('create')}><span className="dim-2">e</span> edit</span>
          <span><span className="dim-2">d</span> delete</span>
          <span data-clickable onClick={ctx.toggleFilters}><span className="dim-2">/</span> filter</span>
          <span data-clickable onClick={ctx.toggleFilters}><span className="dim-2">⌘k</span> command</span>
          <span style={{ marginLeft: 'auto' }} className="dim">cache: ok · idx: 312 entries · 0.3ms</span>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// PAPERWHITE — compact list with mini preview thumbs
// Editorial, paper-research feel
// =================================================================
function List_Paperwhite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="paperwhite" />

        {/* big header */}
        <div style={{ padding: '36px 56px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Index · all bookmarks</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
              <span>312 bookmarks</span><span className="dim" style={{ fontWeight: 400 }}> · 18 cats · 11 starred</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
            <input className="field" placeholder="search title, note, url…" style={{ width: 280, paddingLeft: 18 }} />
            <span className="dim">view</span>
            <span className="dim">table</span>
            <span style={{ borderBottom: '2px solid var(--accent)', paddingBottom: 1 }}>list</span>
            <span className="dim">cards</span>
          </div>
        </div>

        {/* sidebar + list */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
          {/* sidebar */}
          <div style={{ padding: '24px 24px 24px 56px', borderRight: '1px solid var(--border)', fontSize: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 10 }}>Categories</div>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 6 }}>
              {[
                ['all', 312, true],
                ['dev', 188],
                ['demoscene', 41],
                ['amiga', 17],
                ['youtube', 24],
                ['blogpost', 19],
                ['python', 12],
                ['nextjs', 8],
                ['latex', 4],
                ['impots', 6],
                ['tools', 9],
              ].map(([n, c, active]) => (
                <li key={n} style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderBottom: active ? '2px solid var(--accent)' : 'none',
                  color: active ? 'var(--fg)' : 'var(--fg-3)',
                  fontWeight: active ? 600 : 400,
                  paddingBottom: 1,
                }}>
                  <span>{n}</span>
                  <span className="dim-2">{c}</span>
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '24px 0 10px' }}>Filters</div>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 6, color: 'var(--fg-3)' }}>
              <li>★ starred only</li>
              <li>⏰ has reminder</li>
              <li>◨ has screenshot</li>
              <li>↑↑↑ high priority</li>
            </ul>
          </div>

          {/* list */}
          <div style={{ overflow: 'auto', padding: '0 56px 24px' }}>
            {BM.slice(0, 16).map((b, idx) => {
              const sel = idx === 4;
              return (
                <div key={b.id}
                     data-clickable
                     onClick={() => ctx.open(b)}
                     style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 240px 100px',
                  alignItems: 'center',
                  gap: 20,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  background: sel ? 'var(--row-sel, rgba(184,65,11,0.04))' : 'transparent',
                  marginLeft: sel ? -12 : 0,
                  paddingLeft: sel ? 12 : 0,
                  marginRight: sel ? -12 : 0,
                  paddingRight: sel ? 12 : 0,
                }}>
                  <Thumb id={b.id} shot={b.shot} w={36} h={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
                      {b.alarm && <span className="accent" style={{ fontSize: 10 }}>⏰</span>}
                      <Stars n={b.stars} />
                    </div>
                    <div className="dim" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.url.replace(/^https?:\/\//, '')}
                      {b.notes && <span> · {b.notes}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {b.tags.map(t => <Tag key={t} name={t} />)}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--fg-3)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {b.dateLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// NEON — cards grid with screenshot previews
// Synthwave dashboard
// =================================================================
function List_Neon() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="neon" />

        <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid var(--border)' }}>
          <div className="accent glow" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)' }}>// ARCHIVE</div>
          <div className="bright" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.05em' }}>312 ENTRIES</div>
          <div className="accent-2" style={{ marginLeft: 18, padding: '4px 12px', border: '1px solid var(--accent-2)', borderRadius: 2, fontSize: 11, color: 'var(--accent-2)', boxShadow: '0 0 10px rgba(0,240,255,0.2) inset' }}>
            <span className="dim-2" style={{ color: 'inherit', opacity: 0.7 }}>►</span> search<span className="mono-caret" />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
            <span className="dim">VIEW</span>
            <span className="dim">[table]</span>
            <span className="dim">[list]</span>
            <span className="accent glow-sm" style={{ color: 'var(--accent)' }}>[cards]</span>
            <span className="dim" style={{ marginLeft: 12 }}>SORT</span>
            <span className="accent-2" style={{ color: 'var(--accent-2)' }}>added ▼</span>
            <span data-clickable onClick={ctx.toggleFilters} className="accent" style={{ marginLeft: 12, padding: '4px 10px', border: '1px solid var(--accent)', boxShadow: '0 0 10px rgba(255,43,214,0.3) inset' }}>+ FILTER</span>
          </div>
        </div>

        {/* chips row */}
        <div style={{ padding: '12px 28px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <span className="dim" style={{ fontSize: 10, letterSpacing: '0.2em' }}>TAGS</span>
          {['dev','demoscene','amiga','youtube','blogpost','python','nextjs','tools','art','impots'].map((t, i) => (
            <span key={t} className="tag" style={{ '--th': PAL[t].hue, opacity: i < 3 ? 1 : 0.55 }}>{t}</span>
          ))}
        </div>

        {/* cards grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
            gap: 16,
          }}>
            {BM.slice(0, 15).map(b => (
              <div key={b.id} data-clickable onClick={() => ctx.open(b)}>
                <NeonCard b={b} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NeonCard({ b }) {
  const hue = PAL[b.tags[0]]?.hue || 280;
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'linear-gradient(180deg, rgba(20,16,46,0.7), rgba(11,8,32,0.6))',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all .2s',
    }}>
      {/* preview */}
      <div style={{
        height: 110,
        background: b.shot
          ? `linear-gradient(135deg, hsla(${hue},80%,40%,0.5), hsla(${(hue+60)%360},80%,40%,0.3)), repeating-linear-gradient(45deg, hsla(${hue},60%,60%,0.15), hsla(${hue},60%,60%,0.15) 8px, transparent 8px, transparent 16px)`
          : `linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))`,
        position: 'relative',
        borderBottom: `1px solid hsla(${hue},80%,60%,0.3)`,
      }}>
        {!b.shot && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.2em' }}>
            NO PREVIEW
          </div>
        )}
        {b.alarm && (
          <div className="accent glow-sm" style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: 'var(--accent)', padding: '2px 6px', border: '1px solid var(--accent)', background: 'rgba(11,8,32,0.7)' }}>
            ⏰ DUE
          </div>
        )}
        <div className="accent-2" style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, color: 'var(--accent-2)', letterSpacing: '0.2em', opacity: 0.9 }}>
          #{String(b.id).padStart(4, '0')}
        </div>
        {b.stars > 0 && (
          <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 11 }}>
            <Stars n={b.stars} />
          </div>
        )}
        <div className="dim-2" style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, letterSpacing: '0.1em' }}>
          <PriorityGlyph p={b.priority} />
        </div>
      </div>
      {/* body */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div className="bright" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 32 }}>
          {b.title}
        </div>
        <div className="dim" style={{ fontSize: 10.5, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          ↗ {b.url.replace(/^https?:\/\//, '').split('/')[0]}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {b.tags.slice(0, 3).map(t => <Tag key={t} name={t} />)}
        </div>
        <div className="dim-2" style={{ marginTop: 8, fontSize: 10, display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: 6 }}>
          <span>{b.dateLabel}</span>
          <span>— · — · —</span>
        </div>
      </div>
    </div>
  );
}

window.List_Phosphor = List_Phosphor;
window.List_Paperwhite = List_Paperwhite;
window.List_Neon = List_Neon;
