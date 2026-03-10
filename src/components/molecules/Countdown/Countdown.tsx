import { useState, useEffect } from 'react';

export interface CountdownProps {
  /** End date (e.g. auction ends at this time) */
  endDate: Date;
  /** Called when countdown reaches zero */
  onEnd?: () => void;
  className?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function Countdown({ endDate, onEnd, className = '' }: CountdownProps) {
  const [left, setLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = endDate.getTime();
      if (end <= now) {
        setLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setEnded(true);
        onEnd?.();
        return;
      }
      const diff = Math.floor((end - now) / 1000);
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setLeft({ days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, onEnd]);

  if (ended) {
    return (
      <div className={`countdown countdown--ended ${className}`.trim()}>
        <span className="countdown__ended">Auction ended</span>
      </div>
    );
  }

  return (
    <div className={`countdown ${className}`.trim()} role="timer" aria-live="polite">
      <div className="countdown__blocks">
        <div className="countdown__block">
          <span className="countdown__value">{pad(left.days)}</span>
          <span className="countdown__label">Days</span>
        </div>
        <span className="countdown__sep" aria-hidden />
        <div className="countdown__block">
          <span className="countdown__value">{pad(left.hours)}</span>
          <span className="countdown__label">Hours</span>
        </div>
        <span className="countdown__sep" aria-hidden />
        <div className="countdown__block">
          <span className="countdown__value">{pad(left.minutes)}</span>
          <span className="countdown__label">Minutes</span>
        </div>
        <span className="countdown__sep" aria-hidden />
        <div className="countdown__block">
          <span className="countdown__value">{pad(left.seconds)}</span>
          <span className="countdown__label">Seconds</span>
        </div>
      </div>
    </div>
  );
}
