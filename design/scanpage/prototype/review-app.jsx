/* PawnTrail — PGN review canvas composition */

const TWEAK_DEFAULTS_REVIEW = /*EDITMODE-BEGIN*/{
  "theme": "paper",
  "showScoresheet": true,
  "showEngine": true,
  "popoverOpen": true
}/*EDITMODE-END*/;

const ReviewApp = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS_REVIEW);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="desktop" title="Desktop · Review screen" subtitle="Board left, move list right. Inline correction popover on flagged moves.">
          <DCArtboard id="d-flagged" label="01 · Flagged move · popover open" width={1380} height={920}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="REVIEW · LOW-CONFIDENCE" url="pawntrail.com/games/anderssen-dufresne-1852/review" width={1240} height={820}>
                <ReviewScreenDesktop initialPly={12} popoverOpen={true} showScoresheet={tweaks.showScoresheet} showEngine={tweaks.showEngine} />
              </DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d-resting" label="02 · Resting · no popover" width={1380} height={920}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="REVIEW · CLEAN PLY" url="pawntrail.com/games/anderssen-dufresne-1852/review" width={1240} height={820}>
                <ReviewScreenDesktop initialPly={6} popoverOpen={false} showScoresheet={tweaks.showScoresheet} showEngine={tweaks.showEngine} />
              </DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d-noscore" label="03 · No scoresheet" width={1380} height={920}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="REVIEW · IMPORTED PGN" url="pawntrail.com/games/anderssen-dufresne-1852/review" width={1240} height={820}>
                <ReviewScreenDesktop initialPly={11} popoverOpen={false} showScoresheet={false} showEngine={tweaks.showEngine} />
              </DesktopFrame>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="Mobile · iOS" subtitle="Bottom sheet for corrections, swipeable move rail.">
          <DCArtboard id="m-flagged" label="01 · Flagged · sheet open" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="REVIEW · CORRECTING">
                <ReviewScreenMobile initialPly={12} sheetOpen={true} showEngine={tweaks.showEngine} />
              </PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m-resting" label="02 · Resting · move details" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="REVIEW · CLEAN">
                <ReviewScreenMobile initialPly={6} sheetOpen={false} showEngine={tweaks.showEngine} />
              </PhoneFrame>
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakSelect
            label="Palette"
            value={tweaks.theme}
            options={[
              { label: 'Light · paper', value: 'paper' },
              { label: 'Light · cream', value: 'light' },
              { label: 'Light · sage', value: 'sage' },
              { label: 'Light · mint', value: 'mint' },
              { label: 'Light · moss', value: 'moss' },
              { label: 'Dark · forest', value: 'dark' },
              { label: 'Dark · slate', value: 'slate' },
              { label: 'Dark · midnight', value: 'midnight' },
              { label: 'Dark · oxblood', value: 'oxblood' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
        </TweakSection>
        <TweakSection label="Surfaces">
          <TweakToggle label="Engine analysis" value={tweaks.showEngine}
            onChange={v => setTweak('showEngine', v)} />
          <TweakToggle label="Scoresheet thumbnail" value={tweaks.showScoresheet}
            onChange={v => setTweak('showScoresheet', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<ReviewApp />);
