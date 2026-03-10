import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, EmailButtons, FooterText } from './EmailTemplate';

const EVENT = {
  image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
  date: 'Monday, 16 February',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  orderNumber: 'ALL-2026-06442',
  drawDate: 'Wednesday, June 25, 2026',
  status: 'Not selected',
};

export default function PrizeDrawLoserEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Better luck next time!">
        <p>
          Unfortunately, you were not selected as the winner of the prize draw for <span className="email__bold">[Event name]</span>.
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="info">
        <strong>Your entry fee has been refunded</strong> to your reward points balance.
      </MessageBar>

      <DetailsCard
        title="Prize draw summary"
        rows={[
          { label: 'Order number', value: DETAILS.orderNumber },
          { label: 'Draw date', value: DETAILS.drawDate },
          { label: 'Status', value: DETAILS.status, valueClass: 'danger' },
        ]}
      >
        <EmailButtons>
          <EmailButton label="Browse more experiences" />
          <EmailButton label="View upcoming prize draws" variant="tertiary" />
        </EmailButtons>
      </DetailsCard>

      <FooterText>
        There are plenty more experiences waiting for you. Keep entering prize draws for your chance to win!
      </FooterText>
    </EmailTemplate>
  );
}
