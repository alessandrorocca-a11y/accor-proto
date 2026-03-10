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
  quantity: '2',
  guests: '2 adults',
  drawDate: 'Wednesday, June 25, 2026',
  status: 'Winner',
};

export default function PrizeDrawWinnerEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Congratulations — you won this prize draw!">
        <p>
          Incredible news, you've been selected as the winner of the prize draw for <span className="email__bold">[Event name]</span>. Your experience is confirmed and ready for you!
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="success">
        <strong>Prize draw won!</strong> You'll receive a separate email with all event details.
      </MessageBar>

      <DetailsCard
        title="Prize draw details"
        rows={[
          { label: 'Order number', value: DETAILS.orderNumber },
          { label: 'Quantity', value: DETAILS.quantity },
          { label: 'Guests', value: DETAILS.guests },
          { label: 'Draw date', value: DETAILS.drawDate },
          { label: 'Status', value: DETAILS.status, valueClass: 'success' },
        ]}
      >
        <EmailButtons>
          <EmailButton label="View your order" />
          <EmailButton label="Add to calendar" variant="tertiary" />
        </EmailButtons>
      </DetailsCard>

      <FooterText>
        Enjoy your experience! If you have any questions, please contact our support team.
      </FooterText>
    </EmailTemplate>
  );
}
