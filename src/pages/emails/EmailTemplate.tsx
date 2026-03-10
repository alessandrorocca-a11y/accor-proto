import type { ReactNode } from 'react';
import allAccorLogo from '@/assets/all-accor-logo.svg';
import './EmailTemplate.css';

/* ── Shared sub-components for all email pages ────────────────────────── */

interface EmailTemplateProps {
  children: ReactNode;
}

export default function EmailTemplate({ children }: EmailTemplateProps) {
  return (
    <div className="email-page">
      <div className="email">
        <header className="email__header">
          <img src={allAccorLogo} alt="ALL — Accor Live Limitless" className="email__logo" />
        </header>
        <div className="email__body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Text block: greeting + heading + body ────────────────────────────── */

interface TextBlockProps {
  name: string;
  heading: string;
  children: ReactNode;
}

export function TextBlock({ name, heading, children }: TextBlockProps) {
  return (
    <div className="email__text-block">
      <p>Dear {name},</p>
      <div className="email__spacer" />
      <p className="email__heading">{heading}</p>
      <div className="email__spacer" />
      {children}
    </div>
  );
}

/* ── Event card: horizontal thumbnail + info ──────────────────────────── */

function IconPin() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 14.5833C15.2887 14.5833 16.3333 13.5387 16.3333 12.25C16.3333 10.9613 15.2887 9.91667 14 9.91667C12.7113 9.91667 11.6667 10.9613 11.6667 12.25C11.6667 13.5387 12.7113 14.5833 14 14.5833Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3.5C11.6794 3.5 9.45376 4.42187 7.81282 6.06282C6.17187 7.70376 5.25 9.92936 5.25 12.25C5.25 14.3267 5.73667 15.645 7 17.1667L14 24.5L21 17.1667C22.2633 15.645 22.75 14.3267 22.75 12.25C22.75 9.92936 21.8281 7.70376 20.1872 6.06282C18.5462 4.42187 16.3206 3.5 14 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface EventCardData {
  image: string;
  date: string;
  title: string;
  location: string;
  badge?: string;
}

export function EventCard({ image, date, title, location, badge }: EventCardData) {
  return (
    <div className="email__event-card">
      <img src={image} alt={title} className="email__event-image" />
      <div className="email__event-info">
        <p className="email__event-date">{date}</p>
        <p className="email__event-title">{title}</p>
        <div className="email__event-location">
          <IconPin />
          <span>{location}</span>
        </div>
        {badge && <span className="email__event-badge">{badge}</span>}
      </div>
    </div>
  );
}

/* ── Message bar ──────────────────────────────────────────────────────── */

function IconCheckCircle({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWarningTriangle({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l9 16H3L12 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9v5M12 16v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface MessageBarProps {
  variant: 'success' | 'danger' | 'info';
  children: ReactNode;
}

export function MessageBar({ variant, children }: MessageBarProps) {
  const cls = `email__message email__message--${variant}`;
  const icon =
    variant === 'success' ? <IconCheckCircle color="#006a53" /> :
    variant === 'danger' ? <IconWarningTriangle color="#be003c" /> :
    <IconCheckCircle color="#232136" />;

  return (
    <div className={cls}>
      {icon}
      <p className="email__message-text">{children}</p>
    </div>
  );
}

/* ── Detail rows (inside DetailsCard) ─────────────────────────────────── */

export interface DetailRow {
  label: string;
  value: string;
  valueClass?: 'success' | 'danger';
}

interface DetailsCardProps {
  title: string;
  rows: DetailRow[];
  children?: ReactNode;
}

export function DetailsCard({ title, rows, children }: DetailsCardProps) {
  return (
    <div className="email__details-card">
      <h2 className="email__details-heading">{title}</h2>
      <div className="email__details-rows">
        {rows.map((row, i) => (
          <div key={i}>
            <hr className="email__details-line" />
            <div className="email__details-row" style={{ marginTop: 16 }}>
              <span className="email__details-label">{row.label}</span>
              <span className={`email__details-value${row.valueClass ? ` email__details-value--${row.valueClass}` : ''}`}>
                {row.value}
              </span>
            </div>
          </div>
        ))}
        <hr className="email__details-line" />
      </div>
      {children}
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'tertiary';
  href?: string;
}

export function EmailButton({ label, variant = 'primary', href = '#' }: ButtonProps) {
  return (
    <a href={href} className={`email__btn email__btn--${variant}`}>
      {label}
    </a>
  );
}

export function EmailButtons({ children }: { children: ReactNode }) {
  return <div className="email__buttons">{children}</div>;
}

/* ── Footer text ──────────────────────────────────────────────────────── */

export function FooterText({ children }: { children: ReactNode }) {
  return <p className="email__footer-text">{children}</p>;
}
