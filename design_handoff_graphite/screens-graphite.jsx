// screens-graphite.jsx — GRAPHITE: flat grey desk, layered instrument panels.
// Own layout language: chrome strip, floating cards, dense data table with
// column headers, index rail, command row, status line.

const GBM = window.BKMK_DATA.bookmarks;
const GPAL = window.BKMK_DATA.tagPalette;
const GDATA = window.BKMK_DATA;
const GCOLS = '58px 36px 62px 1fr 188px 168px';

function GChip({ name, dashed }) {
  const p = GPAL[name] || { hue: 210, name };
  return <span className="gr-chip" style={{ '--th': p.hue, borderStyle: dashed ? 'dashed' : 'solid', color: dashed ? 'var(--fg-3)' : undefined }}>{!dashed && <i></i>}{p.name}</span>;
}
function GStars({ n }) {
  return <span style={{ color: 'var(--accent-2)', letterSpacing: '-0.5px' }}>{'★'.repeat(n)}<span style={{ color: 'var(--fg-4)', opacity: 0.55 }}>{'★'.repeat(5 - n)}</span></span>;
}
function GPri({ p }) {
  const n = p === 'high' ? 3 : p === 'med' ? 2 : 1;
  return <span title={p} style={{ letterSpacing: '-1px', color: n === 3 ? 'var(--fg-2)' : 'var(--fg-3)' }}>{'▮'.repeat(n)}<span style={{ color: 'var(--fg-4)', opacity: 0.4 }}>{'▮'.repeat(3 - n)}</span></span>;
}

function GStrip({ active }) {
  const ctx = React.useContext(window.BkmkCtx);
  const cur = active || ctx.view;
  const tabs = [['list', 'index', GDATA.total], ['create', 'new', null], ['upload', 'import', null], ['reminders', 'alarms', GDATA.reminders.length]];
  return (
    <div className="gr-strip">
      <div data-clickable onClick={() => ctx.go('list')} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontWeight: 600, letterSpacing: '0.14em', color: 'var(--fg-2)', fontSize: 13 }}>BKMK</span>
        <span style={{ fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--fg-4)' }}>IDX/2.4.1</span>
      </div>
      <div className="gr-striptabs" style={{ display: 'flex', gap: 4 }}>
        {tabs.map(([id, label, n]) => (
          <div key={id} data-clickable onClick={() => ctx.go(id)} className={'gr-tab' + (id === cur ? ' on' : '')}>
            <i className="dot"></i>{label}{n != null && <span style={{ color: 'var(--fg-4)' }}>{String(n).padStart(3, '0')}</span>}
          </div>
        ))}
      </div>
      <div className="gr-stripmeta" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="gr-lab gr-hide-sm" data-clickable onClick={() => ctx.go('about')}>about</span>
        <span className="gr-lab gr-hide-sm">uptime 04:12</span>
        <span data-clickable onClick={() => ctx.go('login')} className="gr-hide-sm" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{GDATA.user}</span>
        <i className="gr-led"></i>
      </div>
    </div>
  );
}

function GShell({ active, children, hints, right }) {
  return (
    <div className="theme-graphite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column' }}>
        <GStrip active={active} />
        <div className="gr-desk">{children}</div>
        <div className="gr-bar">
          <span style={{ color: 'var(--accent)' }}>ready</span>
          {(hints || ['j/k move', 'enter open', 'f filter', 'n new']).map(h => <span key={h} className="gr-hide-sm">{h}</span>)}
          <span style={{ marginLeft: 'auto' }}>{right || `idx ${GDATA.total} · sync 12s`}</span>
        </div>
        <GTabbar active={active} />
      </div>
    </div>
  );
}

// bottom tab bar — only rendered visible under the mobile container width
function GTabbar({ active }) {
  const ctx = React.useContext(window.BkmkCtx);
  const cur = active || ctx.view;
  return (
    <div className="gr-tabbar">
      {[['list', 'index', '▤'], ['create', 'new', '＋'], ['upload', 'import', '⤓'], ['reminders', 'alarms', '◔']].map(([id, label, g]) => (
        <div key={id} data-clickable onClick={() => ctx.go(id)} className={'gr-tabbtn' + (id === cur ? ' on' : '')}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>{g}</span>{label}
        </div>
      ))}
    </div>
  );
}

// ============ LIST ============
function List_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const [confirmId, setConfirmId] = React.useState(null);
  const cats = [['all', 312], ['dev', 188], ['demoscene', 41], ['amiga', 17], ['youtube', 24], ['blogpost', 19], ['python', 12], ['nextjs', 8], ['latex', 4], ['impots', 6], ['tools', 9]];
  return (
    <GShell active="list">
      <div className="gr-listgrid" style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '196px 1fr', gap: 12 }}>
        {/* index rail card */}
        <div className="gr-card gr-rail">
          <div className="gr-lab" style={{ marginBottom: 8 }}>index · cat</div>
          <div style={{ display: 'grid', gap: 1 }}>
            {cats.map(([n, c], i) => (
              <div key={n} data-clickable className={'gr-railrow' + (i === 0 ? ' on' : '')}>
                <span>{n}</span><span style={{ color: 'var(--fg-4)' }}>{String(c).padStart(3, '0')}</span>
              </div>
            ))}
          </div>
          <div className="gr-lab" style={{ margin: '20px 0 8px' }}>scopes</div>
          <div style={{ display: 'grid', gap: 5, fontSize: 11.5, padding: '0 8px' }}>
            {[['starred', true], ['has alarm', false], ['has shot', false], ['prio high', false]].map(([n, on]) => (
              <div key={n} data-clickable style={{ display: 'flex', gap: 8, color: on ? 'var(--fg)' : 'var(--fg-3)' }}>
                <span style={{ color: on ? 'var(--accent)' : 'var(--fg-4)' }}>[{on ? 'x' : ' '}]</span>{n}
              </div>
            ))}
          </div>
          <div className="gr-lab" style={{ margin: '20px 0 8px' }}>storage</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'grid', gap: 6, padding: '0 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>shots</span><span style={{ color: 'var(--fg-4)' }}>84/312</span></div>
            <span className="gr-meter"><i style={{ width: '27%' }}></i></span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>db</span><span style={{ color: 'var(--fg-4)' }}>1.4 mb</span></div>
          </div>
        </div>

        {/* table card */}
        <div className="gr-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* mobile-only scope scroller, replaces the rail */}
          <div className="gr-mobrail">
            {cats.map(([n, c], i) => (
              <span key={n} data-clickable className={'gr-seg' + (i === 0 ? ' on' : '')}>{n}<span style={{ opacity: 0.6, marginLeft: 5 }}>{c}</span></span>
            ))}
          </div>
          <div className="gr-cmd">
            <span className="gr-lab" style={{ color: 'var(--accent)' }}>query</span>
            <div className="gr-q" data-clickable onClick={ctx.toggleFilters}>
              <span style={{ color: 'var(--fg-4)' }}>&gt;</span>
              <span style={{ color: 'var(--fg-2)' }}>tag:</span>demoscene
              <span style={{ color: 'var(--fg-2)', marginLeft: 8 }}>stars:</span>&gt;3
              <span className="gr-caret" style={{ color: 'var(--accent)' }}></span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="gr-lab gr-hide-sm">sort</span><span className="gr-hide-sm" style={{ fontSize: 11 }}>added ▾</span>
              <span className="gr-lab gr-hide-sm" style={{ marginLeft: 6 }}>rows</span>
              <span className="gr-hide-sm" style={{ fontSize: 11 }}>312<span style={{ color: 'var(--fg-4)' }}>/312</span></span>
              <button className="gr-btn" data-clickable onClick={ctx.toggleFilters} style={{ marginLeft: 4 }}>filter <span style={{ color: 'var(--fg-4)' }}>⌥F</span></button>
            </div>
          </div>
          <div className="gr-th" style={{ gridTemplateColumns: GCOLS }}>
            <div style={{ paddingLeft: 16 }}>id</div><div>pri</div><div>stars</div><div>title / url</div><div>tags</div><div style={{ textAlign: 'right', paddingRight: 16 }}>added</div>
          </div>
          <div style={{ overflow: 'auto' }}>
            {GBM.slice(0, 22).map((b, i) => (
              <div key={b.id} data-clickable onClick={() => ctx.open(b)} className={'gr-tr' + (i === 4 ? ' on' : '')} style={{ gridTemplateColumns: GCOLS }}>
                <div style={{ paddingLeft: 16, color: 'var(--fg-3)' }}>{b.id}</div>
                <div><GPri p={b.priority} /></div>
                <div><GStars n={b.stars} /></div>
                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg-2)' }}>{b.title}</span>
                  {b.shot && <span style={{ color: 'var(--fg-4)', flex: '0 0 auto' }}>◨</span>}
                  {b.alarm && <span style={{ color: 'var(--accent)', flex: '0 0 auto' }}>◔</span>}
                  <span style={{ color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11 }}>{b.url.replace(/^https?:\/\//, '')}</span>
                </div>
                <div style={{ display: 'flex', gap: 5, overflow: 'hidden' }}>{b.tags.slice(0, 3).map(t => <GChip key={t} name={t} />)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingRight: 12, color: 'var(--fg-3)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {confirmId === b.id ? (
                    <>
                      <span className="gr-lab" style={{ color: 'var(--accent-2)' }}>delete?</span>
                      <button className="gr-mini danger" onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}>confirm</button>
                      <button className="gr-mini" onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}>cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{b.date}</span>
                      <span className="gr-acts">
                        <span className="gr-act" title="open url" onClick={(e) => e.stopPropagation()}>↗</span>
                        <span className="gr-act" title="edit record" onClick={(e) => { e.stopPropagation(); ctx.openEdit(b); }}>✎</span>
                        <span className="gr-act danger" title="delete record" onClick={(e) => { e.stopPropagation(); setConfirmId(b.id); }}>⌧</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* pager — the index is served 22 rows at a time, like the live app */}
          <div className="gr-pager">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="gr-btn gr-pagebtn" title="previous page">←</button>
              <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>page <span style={{ fontWeight: 600 }}>00</span><span style={{ color: 'var(--fg-4)' }}>/77</span></span>
              <button className="gr-btn gr-pagebtn" title="next page">→</button>
            </div>
            <span className="gr-lab gr-hide-sm">rows 001–022 of 312</span>
            <span className="gr-lab" style={{ marginLeft: 'auto' }}>sorted by added ▾</span>
          </div>
        </div>
      </div>
    </GShell>
  );
}

// ============ DETAIL ============
function Detail_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const B = ctx.selected || GBM[0];
  const rows = [
    ['url', B.url], ['added', B.date], ['priority', B.priority], ['stars', `${B.stars}/5`],
    ['tags', B.tags.join(' · ')], ['alarm', B.alarm ? 'armed · T-07d' : 'none'],
    ['shot', B.shot ? 'captured 1280×800' : 'none'], ['hash', `sha1:${(B.id * 7919).toString(16)}a4f`],
  ];
  return (
    <GShell active="list" hints={['esc back', 'e edit', 'a alarm', 'x delete']} right={`record ${B.id}`}>
      <div className="gr-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="gr-cmd">
          <span data-clickable onClick={() => ctx.go('list')} className="gr-lab" style={{ color: 'var(--accent)' }}>‹ index</span>
          <span className="gr-lab" style={{ color: 'var(--fg-4)' }}>/</span>
          <span className="gr-lab">record {B.id}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="gr-btn" data-clickable onClick={() => ctx.openEdit(B)}>edit</button>
            <button className="gr-btn">alarm</button>
            <button className="gr-btn danger" data-clickable onClick={() => ctx.askDelete(B)}>delete</button>
            <button className="gr-btn pri">open url ↗</button>
          </div>
        </div>
        <div className="gr-split" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 372px', minHeight: 0 }}>
          <div style={{ padding: '22px 24px', overflow: 'auto' }}>
            <div className="gr-lab">title</div>
            <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--fg-2)', margin: '4px 0 20px', maxWidth: 620, textWrap: 'pretty' }}>{B.title}</h1>
            <div className="gr-lab" style={{ marginBottom: 6 }}>fields</div>
            <div className="gr-kv">
              {rows.map(([k, v]) => (<React.Fragment key={k}><div className="gr-lab" style={{ paddingTop: 9 }}>{k}</div><div style={{ wordBreak: 'break-all' }}>{v}</div></React.Fragment>))}
            </div>
            <div className="gr-lab" style={{ margin: '22px 0 8px' }}>note</div>
            <div style={{ maxWidth: 620, lineHeight: 1.6 }}>{B.notes || <span style={{ color: 'var(--fg-4)' }}>— empty —</span>}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.10)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18, overflow: 'auto' }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>preview</div>
              <div className="gr-slot" style={{ height: 178 }}>screenshot 1280×800</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>log</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'grid', gap: 4 }}>
                {[[`${B.date} 10:04`, 'record created'], [`${B.date} 10:04`, 'shot captured'], ['2026-01-14 21:11', 'tag dev added'], ['2026-01-18 08:30', 'alarm armed T-07d']].map(([t, m]) => (
                  <div key={t + m} style={{ display: 'flex', gap: 10 }}><span style={{ color: 'var(--fg-4)' }}>{t}</span><span>{m}</span></div>
                ))}
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>related · same tags</div>
              <div style={{ display: 'grid', gap: 5, fontSize: 11.5 }}>
                {GBM.slice(6, 10).map(r => (
                  <div key={r.id} data-clickable onClick={() => ctx.open(r)} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: 'var(--fg-4)' }}>{r.id}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GShell>
  );
}

// ============ CREATE ============
function Create_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <GShell active="create" hints={['tab next', '⌘↵ commit', 'esc cancel']} right="draft 2088">
      <div className="gr-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="gr-cmd">
          <span className="gr-lab" style={{ color: 'var(--accent)' }}>insert</span>
          <span className="gr-lab" style={{ color: 'var(--fg-4)' }}>/</span>
          <span className="gr-lab">record 2088 · draft</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="gr-btn" data-clickable onClick={() => ctx.go('list')}>cancel</button>
            <button className="gr-btn pri" data-clickable onClick={() => ctx.go('list')}>commit ⌘↵</button>
          </div>
        </div>
        <div className="gr-split" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0 }}>
          <div style={{ padding: '22px 24px', overflow: 'auto', display: 'grid', gap: 16, alignContent: 'start', maxWidth: 640 }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 5 }}>url</div>
              <input className="gr-in" defaultValue="https://lospec.com/articles/palette-guide" />
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 5 }}>title</div>
              <input className="gr-in" placeholder="auto-fetched from <title>" defaultValue="A pixel artist’s guide to color palettes" />
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 5 }}>note</div>
              <textarea className="gr-in" rows={3} placeholder="free text · markdown ok" />
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>tags</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {['dev', 'art', 'gamedev'].map(t => <GChip key={t} name={t} />)}
                <GChip name="+ add" dashed />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="gr-lab" style={{ marginBottom: 6 }}>priority</div>
                <div style={{ display: 'flex', gap: 6 }}>{['high', 'med', 'low'].map((p, i) => <span key={p} data-clickable className={'gr-seg' + (i === 1 ? ' on' : '')}>{p}</span>)}</div>
              </div>
              <div>
                <div className="gr-lab" style={{ marginBottom: 6 }}>stars</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 24 }}><GStars n={4} /><span style={{ color: 'var(--fg-4)', fontSize: 11 }}>4/5</span></div>
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>alarm</div>
              <div style={{ display: 'flex', gap: 6 }}>{['off', 'T-1d', 'T-3d', 'T-7d', 'date…'].map((p, i) => <span key={p} data-clickable className={'gr-seg' + (i === 3 ? ' on' : '')}>{p}</span>)}</div>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.10)', padding: 20, display: 'grid', gap: 18, alignContent: 'start' }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>shot · auto capture</div>
              <div className="gr-slot" style={{ height: 146 }}>queued · 1280×800</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>record preview</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'grid', gap: 3, lineHeight: 1.6 }}>
                {['id      2088', 'host    lospec.com', 'tags    dev, art, gamedev', 'prio    med', 'stars   4', 'alarm   2026-01-26', 'shot    queued'].map(l => <div key={l} style={{ whiteSpace: 'pre' }}>{l}</div>)}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-4)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>2 duplicate candidates in index · review before commit</div>
          </div>
        </div>
      </div>
    </GShell>
  );
}

// ============ REMINDERS ============
function Reminders_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const items = GDATA.reminders.map(r => ({ ...GBM.find(b => b.id === r.id), days: r.days }));
  const RC = '58px 1fr 132px 118px 150px 96px';
  return (
    <GShell active="reminders" hints={['enter open', 's snooze', 'd done']} right="4 armed">
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12 }}>
        <div className="gr-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="gr-cmd">
            <span className="gr-lab" style={{ color: 'var(--accent)' }}>alarms</span>
            <span className="gr-lab" style={{ color: 'var(--fg-4)' }}>/</span>
            <span className="gr-lab">clock 2026-01-19 09:12</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="gr-btn">snooze all</button>
              <button className="gr-btn pri">arm new</button>
            </div>
          </div>
          <div className="gr-th" style={{ gridTemplateColumns: RC }}>
            <div style={{ paddingLeft: 16 }}>id</div><div>title</div><div>countdown</div><div>fires</div><div>added / armed</div><div style={{ textAlign: 'right', paddingRight: 16 }}>act</div>
          </div>
          <div style={{ overflow: 'auto' }}>
            {items.map(b => (
              <div key={b.id} data-clickable onClick={() => ctx.open(b)} className="gr-tr gr-rem" style={{ gridTemplateColumns: RC, height: 44 }}>
                <div style={{ paddingLeft: 16, color: 'var(--fg-3)' }}>{b.id}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{b.url.replace(/^https?:\/\//, '')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 14 }}>
                  <span style={{ color: b.days <= 1 ? 'var(--accent-2)' : 'var(--fg-2)' }}>T-{String(b.days).padStart(2, '0')}d</span>
                  <span className="gr-meter" style={{ width: 56 }}><i style={{ width: `${100 - b.days * 12}%`, background: b.days <= 1 ? 'var(--accent-2)' : 'var(--accent)' }}></i></span>
                </div>
                <div style={{ color: 'var(--fg-3)', fontSize: 11 }}>2026-01-{String(19 + b.days).padStart(2, '0')} 09:00</div>
                <div style={{ fontSize: 10.5, color: 'var(--fg-3)', lineHeight: 1.45 }}>
                  <div>bkmk <span style={{ color: 'var(--fg-4)' }}>{b.date}</span></div>
                  <div>alarm <span style={{ color: 'var(--fg-4)' }}>2026-01-18 · {b.days}d</span></div>
                </div>
                <div style={{ textAlign: 'right', paddingRight: 16, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>snooze · done</div>
              </div>
            ))}
          </div>
        </div>
        <div className="gr-card gr-chart" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="gr-lab" style={{ marginBottom: 10 }}>next 14 days · load</div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {Array.from({ length: 14 }, (_, i) => {
              const hit = [1, 3, 5, 7].includes(i + 1);
              return <div key={i} style={{ flex: 1, height: hit ? '100%' : '14%', borderRadius: 5, background: hit ? 'var(--accent)' : 'rgba(22,23,21,0.13)', boxShadow: hit ? '0 3px 10px -4px rgba(23,71,64,0.7), inset 0 1px 0 rgba(255,255,255,0.18)' : 'none' }}></div>;
            })}
          </div>
          <div className="gr-lab" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}><span>jan 19</span><span>feb 02</span></div>
        </div>
      </div>
    </GShell>
  );
}

// ============ LOGIN ============
function Login_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-graphite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="gr-strip">
          <span style={{ fontWeight: 600, letterSpacing: '0.14em', color: 'var(--fg-2)', fontSize: 13 }}>BKMK</span>
          <span className="gr-lab">auth</span>
          <span className="gr-lab" style={{ marginLeft: 'auto' }}>build 2.4.1 · tls on</span>
          <i className="gr-led"></i>
        </div>
        <div className="gr-desk" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="gr-auth" style={{ width: 480 }}>
            <div className="gr-lab" style={{ marginBottom: 6 }}>session</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--fg-2)', marginBottom: 20 }}>sign in to the index<span className="gr-caret" style={{ color: 'var(--accent)' }}></span></div>
            <div className="gr-card" style={{ padding: 22, display: 'grid', gap: 14, boxShadow: 'var(--e2), inset 0 1px 0 var(--hair)' }}>
              <div>
                <div className="gr-lab" style={{ marginBottom: 5 }}>identity</div>
                <input className="gr-in" defaultValue={GDATA.user} />
              </div>
              <div>
                <div className="gr-lab" style={{ marginBottom: 5 }}>key</div>
                <input className="gr-in" type="password" defaultValue="••••••••••••" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="gr-btn pri" data-clickable onClick={() => ctx.go('list')}>connect ↵</button>
                <span className="gr-lab">or</span>
                <span className="gr-lab" data-clickable onClick={() => ctx.go('signup')} style={{ color: 'var(--accent)' }}>register</span>
                <span className="gr-lab" style={{ marginLeft: 'auto' }}>keys stored locally</span>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: 'var(--fg-4)', display: 'grid', gap: 3 }}>
              {['host    bkmk.local:8443', 'index   312 records · 1.4 mb', 'sync    last 12s ago'].map(l => <div key={l} style={{ whiteSpace: 'pre' }}>{l}</div>)}
            </div>
            <div className="gr-lab" data-clickable onClick={() => ctx.go('about')} style={{ marginTop: 14, color: 'var(--accent)' }}>about bkmk →</div>
          </div>
        </div>
        <div className="gr-bar"><span style={{ color: 'var(--accent)' }}>idle</span><span>↵ connect</span><span>tab next field</span></div>
      </div>
    </div>
  );
}

// ============ FILTER MODAL ============
function FilterModal_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <>
      <div onClick={ctx.closeFilters} style={{ position: 'absolute', inset: 0, background: 'rgba(28,30,27,0.40)', backdropFilter: 'blur(3px)', zIndex: 50, animation: 'bkmk-fade .15s ease-out' }} />
      <div className="theme-graphite gr-modal" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(640px, calc(100% - 20px))', maxHeight: 'calc(100% - 24px)', background: 'var(--panel)', border: '1px solid var(--border-2)', borderRadius: 14,
        boxShadow: '0 30px 70px -20px rgba(18,19,17,0.55), 0 2px 6px rgba(18,19,17,0.20), inset 0 1px 0 var(--hair)',
        zIndex: 51, color: 'var(--fg)', fontFamily: 'var(--font)', fontSize: 12.5, overflow: 'auto',
        animation: 'bkmk-pop .18s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div className="gr-cmd">
          <span style={{ letterSpacing: '0.14em', fontWeight: 600, color: 'var(--fg-2)', fontSize: 12 }}>FILTER</span>
          <span className="gr-lab">advanced · live</span>
          <span className="gr-lab" style={{ marginLeft: 'auto' }}>27/312 match</span>
          <span data-clickable onClick={ctx.closeFilters} style={{ cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16 }}>×</span>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: 16 }}>
          <div>
            <div className="gr-lab" style={{ marginBottom: 5 }}>title contains</div>
            <input className="gr-in" defaultValue="amiga" placeholder="substring match on title" />
          </div>
          <div>
            <div className="gr-lab" style={{ marginBottom: 6 }}>categories</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['dev', 'demoscene', 'amiga', 'python', 'youtube', 'blogpost', 'tools'].map((t, i) => <span key={t} data-clickable className={'gr-seg' + (i < 2 ? ' on' : '')}>{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>stars</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['any', '1+', '2+', '3+', '4+', '5'].map((s, i) => <span key={s} data-clickable className={'gr-seg' + (i === 4 ? ' on' : '')}>{s}</span>)}
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>priority</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['high', 'med', 'low', '—'].map((p, i) => <span key={p} data-clickable className={'gr-seg' + (i < 2 ? ' on' : '')}>{p}</span>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>reminder</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['any', 'armed', 'none', '≤ 3d'].map((r, i) => <span key={r} data-clickable className={'gr-seg' + (i === 1 ? ' on' : '')}>{r}</span>)}
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>contains</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11.5 }}>
                {[['screenshot', true], ['notes', false], ['url', false]].map(([n, on]) => (
                  <div key={n} data-clickable style={{ display: 'flex', gap: 7, color: on ? 'var(--fg)' : 'var(--fg-3)' }}>
                    <span style={{ color: on ? 'var(--accent)' : 'var(--fg-4)' }}>[{on ? 'x' : ' '}]</span>{n}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="gr-lab" style={{ marginBottom: 5 }}>resolved expression</div>
            <div className="gr-q" style={{ minWidth: 0 }}><span style={{ color: 'var(--fg-4)' }}>&gt;</span> title:amiga cat:dev,demoscene stars:5 prio:high,med alarm:armed has:shot</div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gr-btn pri" data-clickable onClick={ctx.closeFilters}>filter — 27 results</button>
          <button className="gr-btn" data-clickable onClick={ctx.closeFilters}>reset</button>
          <span className="gr-lab" style={{ marginLeft: 'auto' }}>live · 4 ms</span>
        </div>
      </div>
    </>
  );
}

// ============ UPLOAD / IMPORT ============
function Upload_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const parsed = [
    ['Framework reimagined for the edge! — Qwik', 'qwik.builder.io', 'new'],
    ['Send Email using Yahoo in JavaScript', 'emailarchitect.net', 'new'],
    ['Optimizing React performance without refs and memo', 'alexsidorenko.com', 'dup'],
    ['useEffect — React reference', 'react.dev', 'new'],
    ['How To Build a Next.js App with a NodeJS Backend', 'medium.com', 'new'],
  ];
  return (
    <GShell active="upload" hints={['drop file', '⌘↵ send']} right="import queue empty">
      <div className="gr-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="gr-cmd">
          <span className="gr-lab" style={{ color: 'var(--accent)' }}>import</span>
          <span className="gr-lab" style={{ color: 'var(--fg-4)' }}>/</span>
          <span className="gr-lab">session buddy .txt · .csv</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="gr-btn" data-clickable onClick={() => ctx.go('list')}>cancel</button>
            <button className="gr-btn pri" data-clickable onClick={() => ctx.go('list')}>send ⌘↵</button>
          </div>
        </div>
        <div className="gr-split" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 0 }}>
          <div style={{ padding: '22px 24px', overflow: 'auto', display: 'grid', gap: 18, alignContent: 'start' }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>file</div>
              <div className="gr-drop">
                <div style={{ fontSize: 13, color: 'var(--fg-2)', letterSpacing: '0.02em' }}>drop a .txt or .csv here</div>
                <div className="gr-lab">or</div>
                <button className="gr-btn">choose file</button>
                <div className="gr-lab">max 5 mb · utf-8</div>
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>staged · session_buddy_export_2026_07_11.txt</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div className="gr-sth" style={{ gridTemplateColumns: '1fr 190px 74px' }}>
                  <div style={{ paddingLeft: 14 }}>title</div><div>host</div><div style={{ textAlign: 'right', paddingRight: 14 }}>state</div>
                </div>
                {parsed.map(([t, h, s]) => (
                  <div key={t} className="gr-srow" style={{ gridTemplateColumns: '1fr 190px 74px', height: 30 }}>
                    <div style={{ paddingLeft: 14, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg-2)' }}>{t}</div>
                    <div style={{ color: 'var(--fg-3)', fontSize: 11 }}>{h}</div>
                    <div style={{ textAlign: 'right', paddingRight: 14, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: s === 'dup' ? 'var(--accent-2)' : 'var(--accent)' }}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="gr-lab" style={{ marginTop: 8 }}>77 entries parsed · 4 new · 1 duplicate · 0 malformed</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>on import</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['skip duplicates', 'capture shots', 'tag as imported'].map((o, i) => <span key={o} data-clickable className={'gr-seg' + (i < 2 ? ' on' : '')}>{o}</span>)}
              </div>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.10)', padding: 20, display: 'grid', gap: 16, alignContent: 'start', overflow: 'auto' }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>accepted formats</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.6 }}>a .txt exported by the Chrome <b style={{ color: 'var(--fg-2)', fontWeight: 600 }}>Session Buddy</b> extension, or a .csv with one <span style={{ color: 'var(--fg-2)' }}>title;url</span> pair per line.</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>txt · shape</div>
              <pre className="gr-code">{`$\n  Framework reimagined — Qwik$\n  https://qwik.builder.io/$\n$`}</pre>
              <div className="gr-lab" style={{ marginTop: 5 }}>“$” marks the end of a line</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>csv · shape</div>
              <pre className="gr-code">{`Oral History of Bob Belleville;https://…\nWhat Makes A Good Cli Tool;https://…`}</pre>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: 11, color: 'var(--fg-4)', lineHeight: 1.6 }}>last import 2026-07-11 · 341 entries · 12 skipped</div>
          </div>
        </div>
      </div>
    </GShell>
  );
}

// ============ SIGNUP ============
function Signup_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  return (
    <div className="theme-graphite bkmk-screen">
      <div className="content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="gr-strip">
          <span style={{ fontWeight: 600, letterSpacing: '0.14em', color: 'var(--fg-2)', fontSize: 13 }}>BKMK</span>
          <span className="gr-lab">register</span>
          <span className="gr-lab" style={{ marginLeft: 'auto' }}>build 2.4.1 · tls on</span>
          <i className="gr-led"></i>
        </div>
        <div className="gr-desk" style={{ display: 'grid', placeItems: 'center' }}>
          <div className="gr-auth" style={{ width: 480 }}>
            <div className="gr-lab" style={{ marginBottom: 6 }}>new account</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--fg-2)', marginBottom: 20 }}>create an index</div>
            <div className="gr-card" style={{ padding: 22, display: 'grid', gap: 14, boxShadow: 'var(--e2), inset 0 1px 0 var(--hair)' }}>
              <div>
                <div className="gr-lab" style={{ marginBottom: 5 }}>identity · email</div>
                <input className="gr-in" placeholder="you@domain.tld" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div className="gr-lab" style={{ marginBottom: 5 }}>key</div>
                  <input className="gr-in" type="password" placeholder="12+ chars" />
                </div>
                <div>
                  <div className="gr-lab" style={{ marginBottom: 5 }}>confirm key</div>
                  <input className="gr-in" type="password" />
                </div>
              </div>
              <div>
                <div className="gr-lab" style={{ marginBottom: 5 }}>strength</div>
                <span className="gr-meter"><i style={{ width: '62%' }}></i></span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                <span style={{ color: 'var(--accent)' }}>[x]</span> import my Session Buddy export after signup
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="gr-btn pri" data-clickable onClick={() => ctx.go('list')}>register ↵</button>
                <span className="gr-lab">or</span>
                <span className="gr-lab" data-clickable onClick={() => ctx.go('login')} style={{ color: 'var(--accent)' }}>sign in</span>
                <span className="gr-lab" style={{ marginLeft: 'auto' }}>self-hosted · no tracking</span>
              </div>
            </div>
            <div className="gr-lab" data-clickable onClick={() => ctx.go('about')} style={{ marginTop: 14, color: 'var(--accent)' }}>about bkmk →</div>
          </div>
        </div>
        <div className="gr-bar"><span style={{ color: 'var(--accent)' }}>idle</span><span>↵ register</span><span>tab next field</span></div>
      </div>
    </div>
  );
}

// ============ ABOUT ============
function About_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const keys = [['j / k', 'move selection'], ['↵', 'open record'], ['⌘↵', 'open url'], ['f', 'filters'], ['n', 'new record'], ['u', 'import file'], ['a', 'arm alarm'], ['/', 'search titles']];
  const sys = [['version', '2.4.1 · 2026-07-11'], ['host', 'bkmk.local:8443'], ['storage', 'sqlite · 1.4 mb'], ['records', '312 · 84 shots'], ['categories', '18'], ['alarms', '4 armed'], ['backup', 'nightly 03:00 · ok']];
  return (
    <GShell active="about" hints={['esc back']} right="about">
      <div className="gr-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="gr-cmd">
          <span data-clickable onClick={() => ctx.go('list')} className="gr-lab" style={{ color: 'var(--accent)' }}>‹ index</span>
          <span className="gr-lab" style={{ color: 'var(--fg-4)' }}>/</span>
          <span className="gr-lab">about</span>
        </div>
        <div className="gr-split" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0 }}>
          <div style={{ padding: '24px 26px', overflow: 'auto', maxWidth: 660 }}>
            <div className="gr-lab">bkmk</div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--fg-2)', margin: '4px 0 14px' }}>a bookmark index for people who keep everything</h1>
            <p style={{ lineHeight: 1.65, color: 'var(--fg)', maxWidth: 560, textWrap: 'pretty' }}>Self-hosted. Every entry keeps its url, categories, stars, priority, note, screenshot and an optional alarm so a link you meant to read comes back to you. Import comes from a Chrome Session Buddy export or a plain csv; nothing leaves the host.</p>
            <div className="gr-lab" style={{ margin: '24px 0 8px' }}>keyboard</div>
            <div className="gr-kv" style={{ maxWidth: 420 }}>
              {keys.map(([k, v]) => (<React.Fragment key={k}><div style={{ color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{k}</div><div style={{ color: 'var(--fg-3)' }}>{v}</div></React.Fragment>))}
            </div>
            <div className="gr-lab" style={{ margin: '24px 0 8px' }}>credits</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.7 }}>built by cosmokaat · IBM Plex Mono · sqlite · no analytics, no cookies beyond the session</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.10)', padding: 20, display: 'grid', gap: 16, alignContent: 'start', overflow: 'auto' }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>system</div>
              <div style={{ display: 'grid', gap: 5, fontSize: 11.5 }}>
                {sys.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span className="gr-lab">{k}</span><span style={{ color: 'var(--fg)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 8 }}>changelog</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', display: 'grid', gap: 4 }}>
                {[['2.4.1', 'alarm countdown view'], ['2.4.0', 'csv import + dedupe'], ['2.3.2', 'screenshot capture queue'], ['2.3.0', 'category filters']].map(([v, m]) => (
                  <div key={v} style={{ display: 'flex', gap: 10 }}><span style={{ color: 'var(--fg-4)' }}>{v}</span><span>{m}</span></div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 8 }}>
              <button className="gr-btn" data-clickable onClick={() => ctx.go('upload')}>import</button>
              <button className="gr-btn" data-clickable onClick={() => ctx.go('login')}>sign out</button>
            </div>
          </div>
        </div>
      </div>
    </GShell>
  );
}

// ============ EDIT MODAL — same fields as insert, prefilled ============
function EditModal_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const B = ctx.editing;
  if (!B) return null;
  const prio = ['high', 'med', 'low'];
  const alarms = ['off', 'T-1d', 'T-3d', 'T-7d', 'date…'];
  return (
    <>
      <div onClick={ctx.closeEdit} style={{ position: 'absolute', inset: 0, background: 'rgba(28,30,27,0.40)', backdropFilter: 'blur(3px)', zIndex: 50, animation: 'bkmk-fade .15s ease-out' }} />
      <div className="theme-graphite gr-modal" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(680px, calc(100% - 20px))', maxHeight: 'calc(100% - 24px)', background: 'var(--panel)',
        border: '1px solid var(--border-2)', borderRadius: 14,
        boxShadow: '0 30px 70px -20px rgba(18,19,17,0.55), 0 2px 6px rgba(18,19,17,0.20), inset 0 1px 0 var(--hair)',
        zIndex: 51, color: 'var(--fg)', fontFamily: 'var(--font)', fontSize: 12.5, overflow: 'auto',
        animation: 'bkmk-pop .18s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div className="gr-cmd">
          <span style={{ letterSpacing: '0.14em', fontWeight: 600, color: 'var(--fg-2)', fontSize: 12 }}>EDIT</span>
          <span className="gr-lab">record {B.id}</span>
          <span className="gr-lab gr-hide-sm" style={{ marginLeft: 'auto' }}>added {B.date} · unsaved changes</span>
          <span data-clickable onClick={ctx.closeEdit} style={{ cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16, marginLeft: 10 }}>×</span>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: 15 }}>
          <div>
            <div className="gr-lab" style={{ marginBottom: 5 }}>url</div>
            <input className="gr-in" defaultValue={B.url} />
          </div>
          <div>
            <div className="gr-lab" style={{ marginBottom: 5 }}>title</div>
            <input className="gr-in" defaultValue={B.title} />
          </div>
          <div>
            <div className="gr-lab" style={{ marginBottom: 5 }}>note</div>
            <textarea className="gr-in" rows={3} defaultValue={B.notes} placeholder="free text · markdown ok" />
          </div>
          <div>
            <div className="gr-lab" style={{ marginBottom: 6 }}>tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {B.tags.map(t => <GChip key={t} name={t} />)}
              <GChip name="+ add" dashed />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>priority</div>
              <div style={{ display: 'flex', gap: 6 }}>{prio.map(p => <span key={p} data-clickable className={'gr-seg' + (p === B.priority ? ' on' : '')}>{p}</span>)}</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>stars</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 24 }}><GStars n={B.stars} /><span style={{ color: 'var(--fg-4)', fontSize: 11 }}>{B.stars}/5</span></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>alarm</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{alarms.map((a, i) => <span key={a} data-clickable className={'gr-seg' + ((B.alarm ? i === 3 : i === 0) ? ' on' : '')}>{a}</span>)}</div>
            </div>
            <div>
              <div className="gr-lab" style={{ marginBottom: 6 }}>screenshot</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className={'gr-seg' + (B.shot ? ' on' : '')} data-clickable>{B.shot ? 'captured' : 'none'}</span>
                <span className="gr-seg" data-clickable>re-capture</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gr-btn pri" data-clickable onClick={ctx.closeEdit}>save ⌘↵</button>
          <button className="gr-btn" data-clickable onClick={ctx.closeEdit}>cancel</button>
          <button className="gr-btn danger" data-clickable onClick={() => ctx.askDelete(B)} style={{ marginLeft: 'auto' }}>delete record</button>
        </div>
      </div>
    </>
  );
}

// ============ DELETE CONFIRM ============
function ConfirmDelete_Graphite() {
  const ctx = React.useContext(window.BkmkCtx);
  const B = ctx.deleting;
  if (!B) return null;
  return (
    <>
      <div onClick={ctx.cancelDelete} style={{ position: 'absolute', inset: 0, background: 'rgba(28,30,27,0.46)', backdropFilter: 'blur(3px)', zIndex: 52, animation: 'bkmk-fade .15s ease-out' }} />
      <div className="theme-graphite gr-modal" style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(440px, calc(100% - 20px))', background: 'var(--panel)',
        border: '1px solid var(--border-2)', borderRadius: 14,
        boxShadow: '0 30px 70px -20px rgba(18,19,17,0.60), 0 2px 6px rgba(18,19,17,0.22), inset 0 1px 0 var(--hair)',
        zIndex: 53, color: 'var(--fg)', fontFamily: 'var(--font)', fontSize: 12.5, overflow: 'hidden',
        animation: 'bkmk-pop .18s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div className="gr-cmd">
          <span style={{ letterSpacing: '0.14em', fontWeight: 600, color: 'var(--accent-2)', fontSize: 12 }}>DELETE</span>
          <span className="gr-lab">record {B.id}</span>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: 10 }}>
          <div style={{ color: 'var(--fg-2)', fontSize: 13, lineHeight: 1.45 }}>{B.title}</div>
          <div style={{ color: 'var(--fg-3)', fontSize: 11 }}>{B.url.replace(/^https?:\/\//, '')}</div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>note, tags, screenshot and alarm go with it. the entry is removed from the index — this cannot be undone.</div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--panel-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="gr-btn danger solid" data-clickable onClick={() => ctx.go('list')}>delete record</button>
          <button className="gr-btn" data-clickable onClick={ctx.cancelDelete}>cancel</button>
          <span className="gr-lab" style={{ marginLeft: 'auto' }}>esc cancels</span>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { List_Graphite, Detail_Graphite, Create_Graphite, Reminders_Graphite, Login_Graphite, Signup_Graphite, About_Graphite, Upload_Graphite, FilterModal_Graphite, EditModal_Graphite, ConfirmDelete_Graphite });
