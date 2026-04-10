import type { MarketingTagType } from '@/data/events/eventRegistry';
import './MarketingTag.css';

const LABEL: Record<MarketingTagType, string> = {
  presale: 'Pre-sale',
  exclusivity: 'Exclusive',
  signature: 'Exclusive',
  'sold-out': 'Sold out',
  discount: 'Discount',
};

interface MarketingTagProps {
  type: MarketingTagType;
  className?: string;
}

export function MarketingTag({ type, className = '' }: MarketingTagProps) {
  return (
    <span className={`marketing-tag marketing-tag--${type} ${className}`.trim()}>
      {LABEL[type]}
    </span>
  );
}
