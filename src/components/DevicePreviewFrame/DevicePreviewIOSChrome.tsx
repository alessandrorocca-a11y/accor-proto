import { useEffect, useState } from 'react';

function formatStatusTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function DevicePreviewIOSChrome() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="device-preview-frame__ios-chrome" aria-hidden>
      <div className="device-preview-frame__dynamic-island" />
      <div className="device-preview-frame__status-row">
        <span className="device-preview-frame__status-time">{formatStatusTime(now)}</span>
        <span className="device-preview-frame__status-spacer" />
        <span className="device-preview-frame__status-icons">
          <svg className="device-preview-frame__cell" width="19" height="12" viewBox="0 0 19 12" aria-hidden>
            <rect x="1" y="8" width="3" height="3" rx="0.6" fill="currentColor" />
            <rect x="5.5" y="5.5" width="3" height="5.5" rx="0.6" fill="currentColor" />
            <rect x="10" y="3" width="3" height="8" rx="0.6" fill="currentColor" />
            <rect x="14.5" y="1" width="3" height="10" rx="0.6" fill="currentColor" />
          </svg>
          <svg className="device-preview-frame__wifi" width="17" height="12" viewBox="0 0 17 12" aria-hidden>
            <path
              fill="currentColor"
              d="M8.5 11a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm-3.4-3.1a4.9 4.9 0 0 1 6.8 0l.9-1a6.1 6.1 0 0 0-8.6 0l.9 1zm-2.5-2.5a8.3 8.3 0 0 1 11.8 0l.9-1a9.6 9.6 0 0 0-13.6 0l.9 1zm-2.5-2.5c4.2-4.2 11-4.2 15.2 0l.9-1c-4.8-4.8-12.6-4.8-17.4 0l.9 1z"
            />
          </svg>
          <svg className="device-preview-frame__battery" width="27" height="13" viewBox="0 0 27 13" aria-hidden>
            <rect x="1" y="2.5" width="21" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <path fill="currentColor" d="M23.5 5v3a1.5 1.5 0 0 0 1.5 1.5h0A1.5 1.5 0 0 0 26.5 8V5A1.5 1.5 0 0 0 25 3.5h0A1.5 1.5 0 0 0 23.5 5z" opacity="0.4" />
            <rect x="2.5" y="4" width="17" height="5" rx="1" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>
  );
}
