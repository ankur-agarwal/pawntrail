/* PawnTrail — auth flow canvas composition */

const { useState: useStateAuthApp } = React;

const TWEAK_DEFAULTS_AUTH = /*EDITMODE-BEGIN*/{
  "theme": "paper"
}/*EDITMODE-END*/;

// Keyframes (loading dots, spinner, pulse)
if (!document.getElementById('pt-auth-anim')) {
  const s = document.createElement('style');
  s.id = 'pt-auth-anim';
  s.textContent = `
    @keyframes pt-dotpulse { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
    @keyframes pt-spin { to { transform: rotate(360deg); } }
    @keyframes pt-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } }
  `;
  document.head.appendChild(s);
}

const Row = ({ children, gap = 32 }) => (
  <div style={{ display: 'flex', gap, alignItems: 'flex-start', flexWrap: 'wrap' }}>{children}</div>
);

const AuthApp = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS_AUTH);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="mobile" title="Mobile · iOS" subtitle="Magic-link flow on a phone">
          <DCArtboard id="m1" label="01 · Enter email · empty" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="EMPTY"><SignInScreen state="empty" /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m1e" label="01 · Enter email · invalid" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="ERROR"><SignInScreen state="error" /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m1l" label="01 · Enter email · sending" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="LOADING"><SignInScreen state="loading" /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m2" label="02 · Check inbox" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="SENT"><InboxScreen state="sent" /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m2r" label="02 · Check inbox · resent" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="RESENT"><InboxScreen state="resent" /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m3" label="03 · Verifying link" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="LOADING"><VerifyingScreen /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m4" label="04 · Signed in" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="SUCCESS"><SignedInScreen /></PhoneFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="m5" label="05 · Link expired" width={380} height={760}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <PhoneFrame label="ERROR"><ExpiredScreen /></PhoneFrame>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="desktop" title="Desktop · Browser" subtitle="Same flow, wider surface">
          <DCArtboard id="d1" label="01 · Enter email · empty" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="EMPTY" url="pawntrail.com/sign-in"><SignInScreen state="empty" /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d1e" label="01 · Enter email · invalid" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="ERROR" url="pawntrail.com/sign-in"><SignInScreen state="error" /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d1l" label="01 · Enter email · sending" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="LOADING" url="pawntrail.com/sign-in"><SignInScreen state="loading" /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d2" label="02 · Check inbox" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="SENT" url="pawntrail.com/sign-in/sent"><InboxScreen state="sent" /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d2r" label="02 · Check inbox · resent" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="RESENT" url="pawntrail.com/sign-in/sent"><InboxScreen state="resent" /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d3" label="03 · Verifying link" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="LOADING" url="pawntrail.com/auth/verify?t=…"><VerifyingScreen /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d4" label="04 · Signed in" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="SUCCESS" url="pawntrail.com/auth/welcome"><SignedInScreen /></DesktopFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="d5" label="05 · Link expired" width={940} height={680}>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <DesktopFrame label="ERROR" url="pawntrail.com/auth/expired"><ExpiredScreen /></DesktopFrame>
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
              { label: 'Light · paper (this brief)', value: 'paper' },
              { label: 'Light · cream', value: 'light' },
              { label: 'Light · sage', value: 'sage' },
              { label: 'Light · mint', value: 'mint' },
            ]}
            onChange={v => setTweak('theme', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AuthApp />);
