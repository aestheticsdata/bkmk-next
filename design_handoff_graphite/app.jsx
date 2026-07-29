// app.jsx — interactive prototype, 3 directions side-by-side
const { DesignCanvas, DCSection, DCArtboard, BkmkApp } = window;

const W = 1280;
const H = 820;

function App() {
  return (
    <DesignCanvas
      title="bkmk — redesign 2026"
      subtitle="Three interactive directions. Click rows, nav, filters, create — each artboard is a working prototype. Pop fullscreen with the ↗ button for a real-size demo."
    >
      <DCSection
        id="phosphor"
        title="01 · PHOSPHOR"
        subtitle="Green-CRT terminal. Dense table with mini-screenshots, ASCII boxes, scanlines, blinking caret. Keyboard-shortcuts hinted in the status bar."
      >
        <DCArtboard id="ph-app" label="interactive · click anywhere" width={W} height={H}>
          <BkmkApp variant="phosphor" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="paperwhite"
        title="02 · PAPERWHITE"
        subtitle="Cream paper-terminal. Compact list with thumbs, editorial big-type, persistent category sidebar, mono body type."
      >
        <DCArtboard id="pw-app" label="interactive" width={W} height={H}>
          <BkmkApp variant="paperwhite" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="graphite"
        title="05 · GRAPHITE"
        subtitle="Instrument grey. Flat mid-grey desk, layered panels with soft elevation and hairline highlights, dense data table with column headers, command row, status line. Plex Mono, muted teal — technical, no glow."
      >
        <DCArtboard id="gr-app" label="desktop · 1280" width={W} height={H}>
          <BkmkApp variant="graphite" />
        </DCArtboard>
        <DCArtboard id="gr-login" label="desktop · login" width={W} height={H}>
          <BkmkApp variant="graphite" start="login" />
        </DCArtboard>
        <DCArtboard id="gr-signup" label="desktop · signup" width={W} height={H}>
          <BkmkApp variant="graphite" start="signup" />
        </DCArtboard>
        <DCArtboard id="gr-about" label="desktop · about" width={W} height={H}>
          <BkmkApp variant="graphite" start="about" />
        </DCArtboard>
        <DCArtboard id="gr-upload" label="desktop · import" width={W} height={H}>
          <BkmkApp variant="graphite" start="upload" />
        </DCArtboard>
        <DCArtboard id="gr-mob-login" label="phone · 390 · login" width={390} height={844}>
          <BkmkApp variant="graphite" start="login" />
        </DCArtboard>
        <DCArtboard id="gr-mob" label="phone · 390 · index" width={390} height={844}>
          <BkmkApp variant="graphite" />
        </DCArtboard>
        <DCArtboard id="gr-mob-rec" label="phone · 390 · record" width={390} height={844}>
          <BkmkApp variant="graphite" start="detail" />
        </DCArtboard>
        <DCArtboard id="gr-mob-new" label="phone · 390 · insert" width={390} height={844}>
          <BkmkApp variant="graphite" start="create" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="dusk"
        title="04 · DUSK"
        subtitle="Mix of Phosphor and Paperwhite. Warm-dark slate, ochre + sage accents, mono throughout, editorial type — no scanlines, no glow. The sober one."
      >
        <DCArtboard id="dk-app" label="interactive" width={W} height={H}>
          <BkmkApp variant="dusk" />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="neon"
        title="03 · NEON"
        subtitle="Synthwave HUD. Card grid with hero screenshots, magenta/cyan accents, animated grid floor, glowing pill tags."
      >
        <DCArtboard id="nn-app" label="interactive" width={W} height={H}>
          <BkmkApp variant="neon" />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
