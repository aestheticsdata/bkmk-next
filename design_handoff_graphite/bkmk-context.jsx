// bkmk-context.jsx — shared routing/state context for interactive prototype

const BkmkCtx = React.createContext({
  variant: 'phosphor',
  view: 'list',
  selected: null,
  filtersOpen: false,
  go: () => {},
  open: () => {},
  toggleFilters: () => {},
  closeFilters: () => {},
});

window.BkmkCtx = BkmkCtx;

function BkmkApp({ variant, start }) {
  const [view, setView]               = React.useState(start || 'list');
  const [selected, setSelected]       = React.useState(window.BKMK_DATA.bookmarks[0]);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [editing, setEditing]         = React.useState(null);   // bookmark being edited (modal)
  const [deleting, setDeleting]       = React.useState(null);   // bookmark pending delete confirm
  // visual transition for the route swap
  const [tick, setTick] = React.useState(0);

  const value = React.useMemo(() => ({
    variant,
    view, selected, filtersOpen, editing, deleting,
    go: (v) => { setFiltersOpen(false); setEditing(null); setDeleting(null); setView(v); setTick(t => t + 1); },
    open: (b) => { setFiltersOpen(false); setSelected(b); setView('detail'); setTick(t => t + 1); },
    toggleFilters: () => setFiltersOpen(o => !o),
    closeFilters: () => setFiltersOpen(false),
    openEdit: (b) => { setFiltersOpen(false); setEditing(b); },
    closeEdit: () => setEditing(null),
    askDelete: (b) => { setEditing(null); setDeleting(b); },
    cancelDelete: () => setDeleting(null),
  }), [variant, view, selected, filtersOpen, editing, deleting]);

  const screens = {
    phosphor: {
      login:     window.Login_Phosphor,
      list:      window.List_Phosphor,
      detail:    window.Detail_Phosphor,
      create:    window.Create_Phosphor,
      reminders: window.Reminders_Phosphor,
    },
    paperwhite: {
      login:     window.Login_Paperwhite,
      list:      window.List_Paperwhite,
      detail:    window.Detail_Paperwhite,
      create:    window.Create_Paperwhite,
      reminders: window.Reminders_Paperwhite,
    },
    neon: {
      login:     window.Login_Neon,
      list:      window.List_Neon,
      detail:    window.Detail_Neon,
      create:    window.Create_Neon,
      reminders: window.Reminders_Neon,
    },
    dusk: {
      login:     window.Login_Dusk,
      list:      window.List_Dusk,
      detail:    window.Detail_Dusk,
      create:    window.Create_Dusk,
      reminders: window.Reminders_Dusk,
    },
  };
  screens.graphite = {
    login:     window.Login_Graphite,
    signup:    window.Signup_Graphite,
    about:     window.About_Graphite,
    upload:    window.Upload_Graphite,
    list:      window.List_Graphite,
    detail:    window.Detail_Graphite,
    create:    window.Create_Graphite,
    reminders: window.Reminders_Graphite,
  };
  const filterModals = {
    phosphor:   window.FilterModal_Phosphor,
    paperwhite: window.FilterModal_Paperwhite,
    neon:       window.FilterModal_Neon,
    dusk:       window.FilterModal_Dusk,
    graphite:   window.FilterModal_Graphite,
  };
  const wrapClass = variant === 'dusk' ? 'dusk-override' : '';

  const Screen = screens[variant][view] || screens[variant].list;
  const Modal  = filterModals[variant];
  const EditModal    = variant === 'graphite' ? window.EditModal_Graphite : null;
  const ConfirmModal = variant === 'graphite' ? window.ConfirmDelete_Graphite : null;

  return (
    <BkmkCtx.Provider value={value}>
      <div key={tick}
           className={wrapClass}
           style={{ width: '100%', height: '100%', position: 'relative', animation: 'bkmk-fade .22s ease-out' }}>
        <Screen />
      </div>
      {filtersOpen && Modal && (
        <div className={wrapClass}
             style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
          <Modal />
        </div>
      )}
      {editing && EditModal && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}><EditModal /></div>
      )}
      {deleting && ConfirmModal && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}><ConfirmModal /></div>
      )}
    </BkmkCtx.Provider>
  );
}

// route fade keyframes (one-time injection)
if (!document.getElementById('bkmk-anim')) {
  const s = document.createElement('style');
  s.id = 'bkmk-anim';
  s.textContent = `
    @keyframes bkmk-fade { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
    @keyframes bkmk-pop  { from { opacity: 0; transform: translate(-50%, -8px) scale(.98); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
    .bkmk-screen [data-clickable]{cursor:pointer; transition: background .12s, color .12s, border-color .12s, box-shadow .12s, transform .12s;}
    .bkmk-screen [data-clickable]:hover{filter:brightness(1.12)}
  `;
  document.head.appendChild(s);
}

window.BkmkApp = BkmkApp;
