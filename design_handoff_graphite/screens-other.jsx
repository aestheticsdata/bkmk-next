// screens-other.jsx — filters, create, reminders, detail (3 themes each)

const BMD = window.BKMK_DATA.bookmarks;
const PALD = window.BKMK_DATA.tagPalette;

// ====================================================================
// FILTERS — three layouts
// ====================================================================
function Filters_Phosphor() {
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="phosphor" />
        {/* dimmed background list */}
        <div style={{ flex: 1, padding: 22, opacity: 0.35, pointerEvents: 'none' }}>
          {BMD.slice(0, 12).map(b => (
            <div key={b.id} style={{ display: 'flex', gap: 18, fontSize: 11.5, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--fg-3)' }}>
              <span className="dim-2">{String(b.id).padStart(4, '0')}</span>
              <span className="accent">↳</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
              <span>{b.dateLabel}</span>
            </div>
          ))}
        </div>
        {/* terminal modal */}
        <div style={{
          position: 'absolute',
          top: 110, left: '50%', transform: 'translateX(-50%)',
          width: 580,
          background: 'var(--bg)',
          border: '1px solid var(--fg-2)',
          boxShadow: '0 0 0 1px var(--bg), 0 0 40px rgba(255,176,0,0.25)',
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid var(--border-2)', background: 'var(--bg-2)' }}>
            <span className="accent" style={{ marginRight: 8 }}>●</span>
            <span className="bright" style={{ fontSize: 12, letterSpacing: '0.1em' }}>filter --interactive</span>
            <span className="dim" style={{ marginLeft: 'auto', fontSize: 11 }}>[esc] close</span>
          </div>
          <div style={{ padding: 22 }}>
            {[
              { label: 'category', val: '#dev × #demoscene', op: '∩' },
              { label: 'title', val: '~ amiga|copper', op: '' },
              { label: 'stars', val: '≥ 3', op: '' },
              { label: 'priority', val: 'high | med', op: '' },
              { label: 'reminder', val: 'any', op: '' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="dim uppercase" style={{ width: 100, fontSize: 11, letterSpacing: '0.1em' }}>{r.label}</span>
                <span className="accent" style={{ marginRight: 4 }}>›</span>
                <span className="bright" style={{ flex: 1 }}>{r.val}</span>
                <span className="dim-2">{r.op}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, display: 'flex', gap: 8, fontSize: 11, color: 'var(--fg-3)' }}>
              <span className="uppercase" style={{ width: 100, fontSize: 11, letterSpacing: '0.1em' }}>contains</span>
              <span style={{ padding: '2px 7px', border: '1px solid var(--accent)', color: 'var(--accent)' }}>screenshot ✓</span>
              <span style={{ padding: '2px 7px', border: '1px solid var(--border)' }}>notes</span>
              <span style={{ padding: '2px 7px', border: '1px solid var(--border)' }}>url</span>
            </div>
            <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border-2)', display: 'flex', gap: 10 }}>
              <button className="btn primary">› apply</button>
              <button className="btn">reset</button>
              <span className="dim" style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11 }}>
                matches: <span className="bright">27</span> / 312
              </span>
            </div>
            <div className="dim" style={{ marginTop: 10, fontSize: 11 }}>
              tip: ⌘k for command palette · ⏎ to apply
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Filters_Paperwhite() {
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="paperwhite" />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
          {/* persistent filter sidebar */}
          <aside style={{ padding: '32px 28px 28px 56px', borderRight: '1px solid var(--border)', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>Refine</h2>
              <button className="dim" style={{ fontSize: 11, textDecoration: 'underline' }}>reset all</button>
            </div>

            <FilterSection title="Search">
              <input className="field" placeholder="title, note, url…" defaultValue="amiga" />
            </FilterSection>

            <FilterSection title="Categories">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['dev','demoscene','amiga','python','blogpost'].map((t, i) => (
                  <span key={t} className="tag" style={{
                    '--th': PALD[t].hue,
                    padding: '3px 8px',
                    border: i < 2 ? '1px solid var(--fg)' : '1px solid var(--border)',
                    background: i < 2 ? 'var(--fg)' : 'transparent',
                    color: i < 2 ? 'var(--bg)' : 'inherit',
                  }}>{t}</span>
                ))}
                <span style={{ padding: '3px 8px', border: '1px solid var(--border)', fontSize: 11, color: 'var(--fg-3)' }}>+ 13 more</span>
              </div>
            </FilterSection>

            <FilterSection title="Stars">
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontSize: 16, color: n <= 3 ? 'var(--accent)' : 'var(--fg-4)' }}>★</span>
                ))}
                <span className="dim" style={{ marginLeft: 8, fontSize: 11, alignSelf: 'center' }}>≥ 3 stars</span>
              </div>
            </FilterSection>

            <FilterSection title="Priority">
              <div style={{ display: 'grid', gap: 6 }}>
                {['high','med','low','none'].map((p, i) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{
                      width: 12, height: 12,
                      border: '1px solid var(--fg)',
                      background: i < 2 ? 'var(--fg)' : 'transparent',
                      position: 'relative',
                    }}>
                      {i < 2 && <span style={{ position: 'absolute', inset: 0, color: 'var(--bg)', fontSize: 10, display: 'grid', placeItems: 'center', lineHeight: 1 }}>✓</span>}
                    </span>
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Has">
              <div style={{ display: 'grid', gap: 6 }}>
                {[['screenshot', true], ['notes', false], ['reminder', false], ['url shot', false]].map(([n, on]) => (
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
            </FilterSection>

            <FilterSection title="Date added">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                <input className="field" defaultValue="2025-01" style={{ width: 90 }} />
                <span className="dim">→</span>
                <input className="field" defaultValue="2026-01" style={{ width: 90 }} />
              </div>
            </FilterSection>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
              Apply — show 27 results
            </button>
          </aside>

          {/* preview of filtered results */}
          <div style={{ padding: '32px 56px', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>27 matching <span className="dim" style={{ fontWeight: 400 }}>of 312</span></h2>
              <div className="dim" style={{ fontSize: 11 }}>updating live ●</div>
            </div>
            {BMD.filter(b => b.tags.includes('amiga') || b.tags.includes('demoscene')).slice(0, 9).map((b, i) => (
              <div key={b.id} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <Thumb id={b.id} shot={b.shot} w={32} h={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span dangerouslySetInnerHTML={{
                      __html: b.title.replace(/(amiga|copper|demoscene)/gi, m => `<mark style="background:rgba(184,65,11,0.18);color:var(--accent);padding:0 2px">${m}</mark>`)
                    }} />
                  </div>
                  <div className="dim" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.url.replace(/^https?:\/\//, '')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {b.tags.map(t => <Tag key={t} name={t} />)}
                </div>
                <Stars n={b.stars} />
                <div className="dim" style={{ fontSize: 11, width: 80, textAlign: 'right' }}>{b.dateLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Filters_Neon() {
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="neon" />
        {/* dimmed bg */}
        <div style={{ flex: 1, padding: 22, opacity: 0.3, pointerEvents: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {BMD.slice(0, 9).map(b => (
            <div key={b.id} style={{ height: 130, border: '1px solid var(--border)', padding: 10, background: 'rgba(20,16,46,0.5)' }}>
              <div style={{ height: 50, background: 'rgba(255,255,255,0.04)', marginBottom: 6 }} />
              <div className="dim" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
            </div>
          ))}
        </div>
        {/* hud panel */}
        <div style={{
          position: 'absolute',
          top: 90, left: '50%', transform: 'translateX(-50%)',
          width: 700,
          background: 'linear-gradient(180deg, rgba(20,16,46,0.95), rgba(11,8,32,0.95))',
          border: '1px solid var(--accent)',
          boxShadow: '0 0 0 1px var(--bg), 0 0 60px rgba(255,43,214,0.4), inset 0 0 40px rgba(255,43,214,0.05)',
          zIndex: 20,
          padding: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--accent)', justifyContent: 'space-between' }}>
            <div className="bright glow-sm" style={{ letterSpacing: '0.3em', fontSize: 12 }}>// QUERY BUILDER</div>
            <div className="accent" style={{ fontSize: 11, letterSpacing: '0.2em' }}>[ESC]</div>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <FieldNeon label="MATCH" value="amiga OR demoscene" />
            <FieldNeon label="TAGS" custom={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                <Tag name="dev" /><Tag name="amiga" /><Tag name="demoscene" />
              </div>
            } />
            <FieldNeon label="MIN STARS" custom={
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} className="glow-sm" style={{ fontSize: 18, color: n <= 3 ? 'var(--accent)' : 'var(--fg-4)' }}>★</span>
                ))}
              </div>
            } />
            <FieldNeon label="PRIORITY" value="high | med" />
            <FieldNeon label="DATE RANGE" value="2025-01 → 2026-01" />
            <FieldNeon label="HAS" custom={
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {[['screenshot', true], ['notes', false], ['reminder', false]].map(([n, on]) => (
                  <span key={n} style={{
                    padding: '2px 8px',
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    border: on ? '1px solid var(--accent-2)' : '1px solid var(--border)',
                    color: on ? 'var(--accent-2)' : 'var(--fg-3)',
                    boxShadow: on ? '0 0 8px rgba(0,240,255,0.3)' : 'none',
                  }}>{on ? '✓ ' : '  '}{n}</span>
                ))}
              </div>
            } />
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--accent)', background: 'rgba(255,43,214,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="btn primary">► EXECUTE</button>
            <button className="btn">CLEAR</button>
            <div style={{ marginLeft: 'auto', fontSize: 11, letterSpacing: '0.2em' }}>
              <span className="dim">MATCHES </span>
              <span className="accent glow-sm" style={{ fontSize: 18, fontWeight: 700 }}>27</span>
              <span className="dim"> / 312</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FieldNeon({ label, value, custom }) {
  return (
    <div>
      <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent-2)', marginBottom: 4 }}>[ {label} ]</div>
      {custom || (
        <div style={{ borderBottom: '1px solid var(--accent-2)', paddingBottom: 4, color: 'var(--fg-2)', fontSize: 13, display: 'flex', alignItems: 'center' }}>
          <span className="accent" style={{ marginRight: 6 }}>›</span>{value}
        </div>
      )}
    </div>
  );
}

// ====================================================================
// CREATE BOOKMARK
// ====================================================================
function Create_Phosphor() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="phosphor" active="create" />
        <div style={{ flex: 1, padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
          <div>
            <div className="accent" style={{ fontSize: 11, letterSpacing: '0.15em' }}>$ bkmk add</div>
            <div className="bright" style={{ fontSize: 22, marginTop: 6, marginBottom: 22, color: 'var(--fg-2)' }}>create new bookmark<span className="mono-caret" /></div>

            <FormPhos label="url" value="https://addyosmani.com/blog/next-two-years/" active />
            <FormPhos label="title" value="The Next Two Years of Software Engineering" hint="auto-fetched from <title>" />
            <FormPhos label="categories" value="#dev #blogpost" hint="space-separated · type to autocomplete" />
            <FormPhos label="notes" multiline value={`AI coding evolution — autocomplete on steroids → agents.\nEfficiency mandate over growth.\nNew graduate calculus.`} />

            <div style={{ display: 'flex', gap: 28, marginTop: 8 }}>
              <FormPhos label="stars" custom={
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: 18, color: n <= 4 ? 'var(--accent)' : 'var(--fg-4)' }}>★</span>
                  ))}
                </div>
              } />
              <FormPhos label="priority" custom={
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['high','↑↑↑'],['med','↑↑'],['low','↑'],['—','—']].map(([k, g], i) => (
                    <span key={k} style={{ padding: '2px 8px', border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)', color: i === 0 ? 'var(--accent)' : 'var(--fg-3)' }}>
                      {g}
                    </span>
                  ))}
                </div>
              } />
              <FormPhos label="remind" custom={
                <div style={{ display: 'flex', gap: 6 }}>
                  {['off','1d','3d','7d','30d'].map((k, i) => (
                    <span key={k} style={{ padding: '2px 8px', border: i === 3 ? '1px solid var(--accent)' : '1px solid var(--border)', color: i === 3 ? 'var(--accent)' : 'var(--fg-3)' }}>{k}</span>
                  ))}
                </div>
              } />
            </div>

            <div style={{ marginTop: 26, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="btn primary" onClick={() => ctx.go('list')}>› submit</button>
              <button className="btn" onClick={() => ctx.go('list')}>cancel</button>
              <span className="dim" style={{ marginLeft: 12, fontSize: 11 }}>⏎ to submit · esc to cancel</span>
            </div>
          </div>

          {/* live preview */}
          <div>
            <div className="dim uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', marginBottom: 8 }}>// preview</div>
            <div style={{ border: '1px solid var(--border-2)', padding: 14, background: 'var(--bg-2)' }}>
              <div className="dim" style={{ fontSize: 10 }}>#2088 · just now</div>
              <div className="bright" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>The Next Two Years of Software Engineering</div>
              <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>addyosmani.com/blog/next-two-years</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}><Tag name="dev" /><Tag name="blogpost" /></div>
              <div style={{ marginTop: 10, fontSize: 12 }}><Stars n={4} /></div>
              <div style={{ marginTop: 10, height: 70, background: 'repeating-linear-gradient(135deg, rgba(255,176,0,0.15), rgba(255,176,0,0.15) 4px, transparent 4px, transparent 8px)', display: 'grid', placeItems: 'center', fontSize: 10 }}>
                <span className="dim">[ screenshot fetched ]</span>
              </div>
            </div>
            <div className="dim" style={{ marginTop: 14, fontSize: 11 }}>
              ┌─ ai assist ────────────────<br />
              │ <span className="accent">5 tag suggestions</span> based on url<br />
              │ <span className="accent">2 similar bookmarks</span> found<br />
              │ summary will fetch on save<br />
              └─────────────────────────────
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FormPhos({ label, value, hint, multiline, custom, active }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="dim-2 uppercase" style={{ fontSize: 10, letterSpacing: '0.15em', marginBottom: 4 }}>{label}</div>
      {custom ? custom : (
        <div style={{
          borderBottom: active ? '1px solid var(--accent)' : '1px solid var(--border-2)',
          paddingBottom: 4,
          color: 'var(--fg-2)',
          display: multiline ? 'block' : 'flex',
          alignItems: 'center',
          minHeight: 22,
        }}>
          <span className={active ? 'accent' : 'dim'} style={{ marginRight: 8 }}>{active ? '›' : '·'}</span>
          {multiline ? (
            <pre style={{ font: 'inherit', whiteSpace: 'pre-wrap', display: 'inline' }}>{value}</pre>
          ) : value}
          {active && <span className="mono-caret" />}
        </div>
      )}
      {hint && <div className="dim-2" style={{ fontSize: 11, marginTop: 4 }}>// {hint}</div>}
    </div>
  );
}

function Create_Paperwhite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="paperwhite" active="create" />
        <div style={{ padding: '36px 56px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>New entry</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>Save something worth finding.</h1>
        </div>
        <div style={{ flex: 1, padding: '32px 56px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48 }}>
          <div>
            <FieldPw label="URL" required>
              <input className="field" defaultValue="https://addyosmani.com/blog/next-two-years/" style={{ fontSize: 15 }} />
            </FieldPw>
            <FieldPw label="Title">
              <input className="field" defaultValue="The Next Two Years of Software Engineering" style={{ fontSize: 15 }} />
              <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>Auto-pulled from page. Edit as needed.</div>
            </FieldPw>
            <FieldPw label="Categories">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 6, borderBottom: '1px solid var(--border-2)' }}>
                <Tag name="dev" /><Tag name="blogpost" />
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>add tag…</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>Suggested: <a className="accent" style={{ textDecoration: 'underline' }}>ai</a> · <a className="accent" style={{ textDecoration: 'underline' }}>career</a></div>
            </FieldPw>
            <FieldPw label="Notes">
              <textarea className="field" rows={6} defaultValue={`AI coding evolution — autocomplete on steroids to agents.\nEfficiency mandate over growth.\nNew graduate calculus.`} style={{ fontSize: 13, resize: 'none', width: '100%', borderBottom: '1px solid var(--border-2)' }} />
            </FieldPw>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 8 }}>
              <FieldPw label="Stars">
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: 22, color: n <= 4 ? 'var(--accent)' : 'var(--fg-4)', cursor: 'pointer' }}>★</span>
                  ))}
                </div>
              </FieldPw>
              <FieldPw label="Priority">
                <select className="field" defaultValue="high" style={{ borderBottom: '1px solid var(--border-2)' }}>
                  <option>high</option><option>medium</option><option>low</option>
                </select>
              </FieldPw>
              <FieldPw label="Remind in">
                <select className="field" defaultValue="7d" style={{ borderBottom: '1px solid var(--border-2)' }}>
                  <option>never</option><option>1 day</option><option>3 days</option><option>7 days</option>
                </select>
              </FieldPw>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <button className="btn primary" onClick={() => ctx.go('list')}>Save bookmark →</button>
              <button className="btn" onClick={() => ctx.go('list')}>Cancel</button>
              <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11, color: 'var(--fg-3)' }}>⏎ to save</div>
            </div>
          </div>
          <aside>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 12 }}>Preview</div>
            <div style={{ border: '1px solid var(--border-2)', padding: 18, background: 'var(--panel)' }}>
              <Thumb id={2088} shot={true} w={'100%'} h={120} />
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 12 }}>The Next Two Years of Software Engineering</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4 }}>addyosmani.com</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}><Tag name="dev" /><Tag name="blogpost" /></div>
              <div style={{ marginTop: 10, color: 'var(--accent)' }}><Stars n={4} /></div>
            </div>
            <div style={{ marginTop: 18, fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>↳ Similar to:</div>
              <div>· What Is REST API? Crash Course…</div>
              <div>· Why TypeScript 5.7 Changes…</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
function FieldPw({ label, required, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 4 }}>
        {label}{required && <span className="accent"> *</span>}
      </div>
      {children}
    </div>
  );
}

function Create_Neon() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="neon" active="create" />
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div className="accent-2 glow-sm" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent-2)' }}>// NEW ENTRY</div>
          <div className="bright glow" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.05em', marginTop: 4, color: '#fff' }}>UPLINK NEW DATA</div>
        </div>
        <div style={{ flex: 1, padding: 28, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, overflow: 'auto' }}>
          <div>
            <FieldNeon label="URL" value="https://addyosmani.com/blog/next-two-years/" />
            <div style={{ height: 16 }} />
            <FieldNeon label="TITLE" value="The Next Two Years of Software Engineering" />
            <div style={{ height: 16 }} />
            <FieldNeon label="TAGS" custom={
              <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag name="dev" /><Tag name="blogpost" />
                <span style={{ padding: '2px 8px', fontSize: 10, letterSpacing: '0.1em', border: '1px dashed var(--accent-2)', color: 'var(--accent-2)' }}>+ ADD</span>
              </div>
            } />
            <div style={{ height: 18 }} />
            <FieldNeon label="NOTES" custom={
              <textarea className="field" rows={5} defaultValue={`AI coding evolution — autocomplete on steroids to agents.\nEfficiency mandate over growth.\nNew graduate calculus.`} style={{ marginTop: 6, fontSize: 12, resize: 'none', width: '100%' }} />
            } />
            <div style={{ height: 18 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              <FieldNeon label="STARS" custom={
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="glow-sm" style={{ fontSize: 20, color: n <= 4 ? 'var(--accent)' : 'var(--fg-4)' }}>★</span>
                  ))}
                </div>
              } />
              <FieldNeon label="PRIORITY" custom={
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {['HI','MD','LO','—'].map((k, i) => (
                    <span key={k} className={i === 0 ? 'accent glow-sm' : ''} style={{
                      padding: '2px 8px', border: '1px solid', borderColor: i === 0 ? 'var(--accent)' : 'var(--border)', color: i === 0 ? 'var(--accent)' : 'var(--fg-3)',
                      fontSize: 10, letterSpacing: '0.15em',
                    }}>{k}</span>
                  ))}
                </div>
              } />
              <FieldNeon label="REMIND" custom={
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {['OFF','1D','7D','30D'].map((k, i) => (
                    <span key={k} style={{
                      padding: '2px 8px', border: '1px solid', borderColor: i === 2 ? 'var(--accent-2)' : 'var(--border)', color: i === 2 ? 'var(--accent-2)' : 'var(--fg-3)',
                      fontSize: 10, letterSpacing: '0.15em',
                    }}>{k}</span>
                  ))}
                </div>
              } />
            </div>
            <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--accent)', display: 'flex', gap: 10 }}>
              <button className="btn primary" onClick={() => ctx.go('list')}>► TRANSMIT</button>
              <button className="btn" onClick={() => ctx.go('list')}>ABORT</button>
              <div style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '0.2em', alignSelf: 'center', color: 'var(--fg-3)' }}>[ ⌘ + ⏎ ]</div>
            </div>
          </div>
          <div>
            <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--accent-2)', marginBottom: 8 }}>// LIVE PREVIEW</div>
            <NeonCard b={{ id: 2088, title: 'The Next Two Years of Software Engineering', url: 'https://addyosmani.com/blog/next-two-years', stars: 4, tags: ['dev','blogpost'], shot: true, alarm: true, priority: 'high', dateLabel: 'just now' }} />
            <div style={{ marginTop: 18, padding: 12, border: '1px solid var(--accent-2)', boxShadow: '0 0 12px rgba(0,240,255,0.15) inset' }}>
              <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.25em' }}>SCANNING…</div>
              <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
                <div>► title detected</div>
                <div>► favicon ok</div>
                <div>► screenshot queued (2s)</div>
                <div className="accent">► 2 duplicate candidates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// REMINDERS
// ====================================================================
const REMINDER_ITEMS = [
  { ...BMD.find(b => b.id === 2087), days: 7, daysLeft: -2, status: 'overdue' },
  { ...BMD.find(b => b.id === 2069), days: 3, daysLeft: 0, status: 'due' },
  { ...BMD.find(b => b.id === 2062), days: 1, daysLeft: 1, status: 'soon' },
  { ...BMD.find(b => b.id === 2061), days: 5, daysLeft: 3, status: 'soon' },
  { ...BMD.find(b => b.id === 2079), days: 14, daysLeft: 6, status: 'upcoming' },
  { ...BMD.find(b => b.id === 2083), days: 30, daysLeft: 18, status: 'upcoming' },
];

function Reminders_Phosphor() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="phosphor" active="reminders" />
        <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'baseline', gap: 18, borderBottom: '1px solid var(--border)' }}>
          <div className="accent" style={{ fontSize: 11, letterSpacing: '0.15em' }}>$ bkmk reminders</div>
          <div className="bright" style={{ fontSize: 18, color: 'var(--fg-2)' }}>4 due · 2 upcoming</div>
          <div style={{ marginLeft: 'auto', fontSize: 11 }}>
            <span className="dim">view:</span> <span className="accent">[timeline]</span> <span className="dim-2">cards</span> <span className="dim-2">list</span>
          </div>
        </div>
        {/* timeline */}
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {REMINDER_ITEMS.map((r, i) => {
            const color = r.status === 'overdue' ? 'var(--danger)' : r.status === 'due' ? 'var(--accent)' : r.status === 'soon' ? 'var(--fg-2)' : 'var(--fg-3)';
            return (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '90px 24px 1fr', gap: 12, padding: '10px 0', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'right', fontSize: 11, color, paddingTop: 2 }}>
                  <div className="uppercase" style={{ letterSpacing: '0.1em' }}>{r.status}</div>
                  <div className="dim" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.daysLeft < 0 ? `${-r.daysLeft}d ago` : r.daysLeft === 0 ? 'today' : `+${r.daysLeft}d`}
                  </div>
                </div>
                <div style={{ position: 'relative', height: '100%' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)', transform: 'translateX(-50%)' }} />
                  <div style={{ position: 'absolute', left: '50%', top: 4, width: 9, height: 9, background: color, transform: 'translateX(-50%)', boxShadow: '0 0 8px ' + color }} />
                </div>
                <div data-clickable onClick={() => ctx.open(r)} style={{ border: '1px solid var(--border)', padding: '8px 12px', background: 'var(--bg-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span className="dim-2" style={{ fontSize: 10 }}>#{r.id}</span>
                    <span className="bright" style={{ fontSize: 13, flex: 1 }}>{r.title}</span>
                    <Stars n={r.stars} />
                  </div>
                  <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>{r.url}</div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                    <span style={{ display: 'inline-flex', gap: 8 }}>
                      {r.tags.map(t => <Tag key={t} name={t} />)}
                    </span>
                    <span className="dim" style={{ marginLeft: 'auto' }}>set: every {r.days}d · added {r.dateLabel}</span>
                    <span style={{ color }} className="accent">[snooze]</span>
                    <span style={{ color: 'var(--good)' }}>[done]</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Reminders_Paperwhite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="paperwhite" active="reminders" />
        <div style={{ padding: '36px 56px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Reminders · today is Jan 19, 2026</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
            <span className="accent">2 overdue</span><span className="dim" style={{ fontWeight: 400 }}> · 2 due this week · 2 upcoming.</span>
          </h1>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 56px' }}>
          {['Overdue & due', 'Upcoming'].map((group, gi) => (
            <div key={group} style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>──</span><span>{group}</span><span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              {REMINDER_ITEMS.filter((r, i) => gi === 0 ? r.daysLeft <= 3 : r.daysLeft > 3).map(r => (
                <div key={r.id} data-clickable onClick={() => ctx.open(r)} style={{ display: 'grid', gridTemplateColumns: '120px 60px 1fr 280px', gap: 24, padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: r.daysLeft <= 0 ? 'var(--accent)' : 'var(--fg)' }}>
                      {r.daysLeft < 0 ? `−${-r.daysLeft}d` : r.daysLeft === 0 ? 'today' : `+${r.daysLeft}d`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{r.status}</div>
                  </div>
                  <Thumb id={r.id} shot={r.shot} w={56} h={56} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
                    <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>{r.url}</div>
                    {r.notes && <div style={{ fontStyle: 'italic', fontSize: 12, marginTop: 6, color: 'var(--fg-3)' }}>"{r.notes}"</div>}
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                      {r.tags.map(t => <Tag key={t} name={t} />)}
                      <span className="dim" style={{ fontSize: 11 }}>· bookmarked {r.dateLabel}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', fontSize: 12 }}>
                    <div><Stars n={r.stars} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="accent" style={{ textDecoration: 'underline' }}>open ↗</button>
                      <button className="dim" style={{ textDecoration: 'underline' }}>snooze 1d</button>
                      <button className="dim" style={{ textDecoration: 'underline' }}>done</button>
                    </div>
                    <div className="dim" style={{ fontSize: 11 }}>repeat every {r.days}d</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reminders_Neon() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="neon" active="reminders" />
        <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid var(--border)' }}>
          <div className="accent glow" style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)' }}>// PINGS</div>
          <div className="bright glow-sm" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>4 SIGNALS</div>
          <div className="accent-2" style={{ marginLeft: 'auto', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent-2)' }}>JAN 19, 2026 · 14:32 UTC</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {REMINDER_ITEMS.map(r => {
            const isOverdue = r.daysLeft <= 0;
            const accent = isOverdue ? 'var(--accent)' : 'var(--accent-2)';
            return (
              <div key={r.id} data-clickable onClick={() => ctx.open(r)} style={{
                border: `1px solid ${accent}`,
                background: 'linear-gradient(180deg, rgba(20,16,46,0.7), rgba(11,8,32,0.6))',
                boxShadow: `0 0 16px ${isOverdue ? 'rgba(255,43,214,0.25)' : 'rgba(0,240,255,0.15)'}`,
                padding: 0,
                position: 'relative',
              }}>
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${accent}`, background: isOverdue ? 'rgba(255,43,214,0.06)' : 'rgba(0,240,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.3em', color: accent, fontWeight: 700 }} className="glow-sm">
                    {isOverdue ? (r.daysLeft < 0 ? `⚠ OVERDUE −${-r.daysLeft}D` : '◉ DUE TODAY') : `▷ +${r.daysLeft}D`}
                  </span>
                  <span className="dim" style={{ fontSize: 10, letterSpacing: '0.2em' }}>#{r.id}</span>
                </div>
                <div style={{ padding: 14 }}>
                  <div className="bright" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{r.title}</div>
                  <div className="dim" style={{ fontSize: 10.5, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>↗ {r.url.replace(/^https?:\/\//, '')}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.tags.map(t => <Tag key={t} name={t} />)}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                    <span className="dim">REPEAT/{r.days}D</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span className="accent-2" style={{ color: 'var(--accent-2)' }}>[OPEN]</span>
                      <span className="dim">[SNOOZE]</span>
                      <span style={{ color: 'var(--good)' }}>[DONE]</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// BOOKMARK DETAIL
// ====================================================================
function Detail_Phosphor() {
  const ctx = React.useContext(window.BkmkCtx);
  const DETAIL = ctx.selected || BMD.find(b => b.id === 2087);
  return (
    <div className="theme-phosphor bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="phosphor" />
        <div style={{ padding: '8px 22px', borderBottom: '1px solid var(--border)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="dim">$ cat bookmark/<span className="bright">{String(DETAIL.id).padStart(4,'0')}</span></span>
          <span className="dim-2">|</span>
          <span data-clickable onClick={() => ctx.go('list')} className="accent">‹ back</span>
          <span className="dim-2">|</span>
          <span data-clickable onClick={() => ctx.go('create')}>e edit</span>
          <span className="dim-2">|</span>
          <span style={{ color: 'var(--danger)' }}>d delete</span>
          <span className="dim-2">|</span>
          <span>o open ↗</span>
          <span className="dim" style={{ marginLeft: 'auto' }}>j/k prev/next</span>
        </div>
        <div style={{ flex: 1, padding: '20px 32px 32px', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          <div>
            <div className="dim-2" style={{ fontSize: 10, letterSpacing: '0.2em' }}>// TITLE</div>
            <h1 className="bright" style={{ fontSize: 22, lineHeight: 1.25, marginTop: 4, color: 'var(--fg-2)' }}>{DETAIL.title}</h1>
            <div style={{ marginTop: 6, color: 'var(--accent)' }}>
              ↗ {DETAIL.url}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 14, fontSize: 12 }}>
              <span><Stars n={DETAIL.stars} /></span>
              <PriorityGlyph p={DETAIL.priority} />
              <span style={{ display: 'inline-flex', gap: 8 }}>
                {DETAIL.tags.map(t => <Tag key={t} name={t} />)}
              </span>
            </div>

            <div className="dim-2" style={{ fontSize: 10, letterSpacing: '0.2em', marginTop: 22 }}>// NOTES</div>
            <pre className="ascii" style={{
              marginTop: 8, padding: 16, background: 'var(--bg-2)', border: '1px solid var(--border)',
              color: 'var(--fg)', fontSize: 12.5, lineHeight: 1.65, whiteSpace: 'pre-wrap',
            }}>
{`The software industry sits at a strange inflection point. AI coding has
evolved from autocomplete on steroids to agents that can autonomously
execute development tasks. The economic boom that fueled tech's hiring
spree has given way to an efficiency mandate: companies now often favor
profitability over growth, experienced hires over fresh graduates, and
smaller teams armed with better tools.

Meanwhile, a new generation of developers is entering the workforce
with a different calculus: pragmatic about career stability, skeptical
of hustle culture, and raised on AI assistance from day one.`}
            </pre>

            <div className="dim-2" style={{ fontSize: 10, letterSpacing: '0.2em', marginTop: 22 }}>// SCREENSHOT</div>
            <div style={{
              marginTop: 8, height: 200,
              background: 'repeating-linear-gradient(135deg, hsla(40,80%,40%,0.4), hsla(40,80%,40%,0.4) 6px, hsla(40,60%,55%,0.2) 6px, hsla(40,60%,55%,0.2) 12px)',
              border: '1px solid var(--border-2)',
              display: 'grid', placeItems: 'center',
              fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>captured 2026-01-12 · 1240×720</div>
          </div>
          <aside style={{ fontSize: 12 }}>
            <div className="dim-2" style={{ fontSize: 10, letterSpacing: '0.2em' }}>// METADATA</div>
            <table style={{ width: '100%', marginTop: 10, fontSize: 12, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['id', '#2087'],
                  ['added', '2026-01-12 09:14'],
                  ['domain', 'addyosmani.com'],
                  ['reminder', '7 days · next in 5d'],
                  ['stars', '★★★★★'],
                  ['priority', 'high'],
                  ['categories', 'dev, blogpost'],
                  ['screenshot', '1240×720 · 84kb'],
                  ['hash', '0x4a91...c2e3'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="dim-2 uppercase" style={{ padding: '4px 0', letterSpacing: '0.08em', fontSize: 10.5 }}>{k}</td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="dim-2" style={{ fontSize: 10, letterSpacing: '0.2em', marginTop: 24 }}>// RELATED</div>
            <div style={{ marginTop: 8 }}>
              {BMD.filter(b => b.tags.includes('blogpost') || b.tags.includes('dev')).slice(0, 4).map(b => (
                <div key={b.id} data-clickable onClick={() => ctx.open(b)} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, fontSize: 11.5 }}>
                  <span className="accent">↳</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Detail_Paperwhite() {
  const ctx = React.useContext(window.BkmkCtx);
  const DETAIL = ctx.selected || BMD.find(b => b.id === 2087);
  return (
    <div className="theme-paperwhite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="paperwhite" />
        <div style={{ padding: '10px 56px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 22, fontSize: 12 }}>
          <a data-clickable onClick={() => ctx.go('list')} className="accent" style={{ textDecoration: 'underline' }}>‹ all bookmarks</a>
          <span className="dim">·</span>
          <a data-clickable onClick={() => ctx.go('create')}>edit</a>
          <a>delete</a>
          <a>open ↗</a>
          <span className="dim" style={{ marginLeft: 'auto' }}>#{String(DETAIL.id).padStart(4,'0')} of 312 · ← →</span>
        </div>
        <article style={{ flex: 1, overflow: 'auto', padding: '40px 56px 64px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
            <span>Blogpost</span> · <span>Bookmarked 12 Jan 2026</span> · <span>addyosmani.com</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 10 }}>
            {DETAIL.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, fontSize: 12, color: 'var(--fg-3)' }}>
            <Stars n={DETAIL.stars} />
            <span>·</span>
            <span>{DETAIL.priority} priority</span>
            <span>·</span>
            <span>{DETAIL.alarm ? 'Reminder in 5 days' : 'No reminder'}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              {DETAIL.tags.map(t => <Tag key={t} name={t} />)}
            </span>
          </div>
          <div style={{ marginTop: 26, padding: 0, height: 280, border: '1px solid var(--border-2)' }}>
            <Thumb id={DETAIL.id} shot={true} w={'100%'} h={'100%'} />
          </div>
          <div style={{ marginTop: 28, fontSize: 14.5, lineHeight: 1.7, color: 'var(--fg)', fontFamily: 'JetBrains Mono, monospace' }}>
            <p style={{ marginBottom: 14 }}>
              "The software industry sits at a strange inflection point. AI coding has evolved from autocomplete on steroids to agents that can autonomously execute development tasks. The economic boom that fueled tech's hiring spree has given way to an efficiency mandate."
            </p>
            <p style={{ marginBottom: 14, color: 'var(--fg-3)', fontStyle: 'italic' }}>
              Companies now often favor profitability over growth, experienced hires over fresh graduates, and smaller teams armed with better tools.
            </p>
            <p>
              Meanwhile, a new generation of developers is entering the workforce with a different calculus: pragmatic about career stability, skeptical of hustle culture, and raised on AI assistance from day one.
            </p>
          </div>
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, fontSize: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>Source</div>
              <div className="accent" style={{ textDecoration: 'underline', wordBreak: 'break-all' }}>{DETAIL.url}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>Bookmarked</div>
              <div>12 January 2026, 09:14</div>
              <div className="dim">8 days ago</div>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>Reminder</div>
              <div>Every 7 days</div>
              <div className="dim">next ping in 5 days</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Detail_Neon() {
  const ctx = React.useContext(window.BkmkCtx);
  const DETAIL = ctx.selected || BMD.find(b => b.id === 2087);
  return (
    <div className="theme-neon bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar variant="neon" />
        <div style={{ padding: '10px 28px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 11, letterSpacing: '0.15em' }}>
          <a data-clickable onClick={() => ctx.go('list')} className="accent-2 glow-sm" style={{ color: 'var(--accent-2)' }}>◀ BACK</a>
          <a data-clickable onClick={() => ctx.go('create')} className="dim">EDIT</a>
          <a className="dim">DELETE</a>
          <a className="dim">OPEN ↗</a>
          <span className="dim" style={{ marginLeft: 'auto' }}>ENTRY #{String(DETAIL.id).padStart(4,'0')}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 28, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28 }}>
          <div>
            {/* hero */}
            <div style={{ position: 'relative', height: 280, border: '1px solid var(--accent)', boxShadow: '0 0 24px rgba(255,43,214,0.25)' }}>
              <Thumb id={DETAIL.id} shot={true} w={'100%'} h={'100%'} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(11,8,32,0.95) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                <div className="accent-2 glow-sm" style={{ fontSize: 10, letterSpacing: '0.4em', color: 'var(--accent-2)' }}>// {DETAIL.tags[0]?.toUpperCase()} · {DETAIL.url.replace(/^https?:\/\//,'').split('/')[0]}</div>
                <div className="bright glow-sm" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginTop: 4, color: '#fff', textTransform: 'uppercase' }}>
                  {DETAIL.title}
                </div>
              </div>
              <div className="accent glow-sm" style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: 'var(--accent)', padding: '3px 8px', border: '1px solid var(--accent)' }}>
                ⏰ REMIND +5D
              </div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <Stars n={DETAIL.stars} />
              <span className="dim-2">·</span>
              <span className="accent glow-sm" style={{ color: 'var(--accent)' }}><PriorityGlyph p={DETAIL.priority} /> {DETAIL.priority.toUpperCase()}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{DETAIL.tags.map(t => <Tag key={t} name={t} />)}</span>
            </div>
            <div className="accent-2" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--accent-2)', marginTop: 22 }}>// EXCERPT</div>
            <div style={{
              marginTop: 8, padding: 18,
              background: 'rgba(20,16,46,0.5)',
              border: '1px solid var(--border)',
              fontSize: 12.5, lineHeight: 1.65,
              borderLeft: '2px solid var(--accent)',
            }}>
              The software industry sits at a strange inflection point. AI coding has evolved from autocomplete on steroids to agents that can autonomously execute development tasks. The economic boom that fueled tech's hiring spree has given way to an efficiency mandate.
            </div>
          </div>
          <aside>
            <div className="accent" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--accent)' }}>// DATA</div>
            <div style={{ marginTop: 10, fontSize: 11.5 }}>
              {[
                ['ENTRY', '#2087'],
                ['ADDED', '2026-01-12 · 09:14'],
                ['SOURCE', 'addyosmani.com'],
                ['SIGNAL', '+5D'],
                ['STARS', '5/5'],
                ['CAT', 'dev / blogpost'],
                ['SHA', '0x4a91...c2e3'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span className="dim" style={{ letterSpacing: '0.2em' }}>{k}</span>
                  <span className="bright" style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="accent" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--accent)', marginTop: 24 }}>// SIMILAR ENTRIES</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {BMD.filter(b => b.tags.includes('blogpost') || b.tags.includes('dev')).slice(0, 4).map(b => (
                <div key={b.id} data-clickable onClick={() => ctx.open(b)} style={{ padding: '8px 10px', border: '1px solid var(--border)', background: 'rgba(20,16,46,0.4)' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                  <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>#{b.id} · <Stars n={b.stars} /></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

window.Filters_Phosphor   = Filters_Phosphor;
window.Filters_Paperwhite = Filters_Paperwhite;
window.Filters_Neon       = Filters_Neon;
window.Create_Phosphor    = Create_Phosphor;
window.Create_Paperwhite  = Create_Paperwhite;
window.Create_Neon        = Create_Neon;
window.Reminders_Phosphor = Reminders_Phosphor;
window.Reminders_Paperwhite = Reminders_Paperwhite;
window.Reminders_Neon     = Reminders_Neon;
window.Detail_Phosphor    = Detail_Phosphor;
window.Detail_Paperwhite  = Detail_Paperwhite;
window.Detail_Neon        = Detail_Neon;
window.REMINDER_ITEMS     = REMINDER_ITEMS;
