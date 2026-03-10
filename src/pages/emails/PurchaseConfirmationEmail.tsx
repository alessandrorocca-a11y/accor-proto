import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, EmailButtons, FooterText } from './EmailTemplate';

const EVENT = {
  image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
  date: 'Monday, 16 February',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  orderNumber: 'ALL-2026-05231',
  quantity: '2',
  guests: '2 adults',
  price: '4.500 Points',
  balance: '38.000 Points',
};

export default function PurchaseConfirmationEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Your purchase is confirmed!">
        <p>
          Thank you for your purchase. Your booking for <span className="email__bold">[Event name]</span> has been successfully processed and confirmed.
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="success">
        <strong>Booking confirmed!</strong> Your e-ticket is attached to this email.
      </MessageBar>

      <DetailsCard
        title="Order summary"
        rows={[
          { label: 'Order number', value: DETAILS.orderNumber },
          { label: 'Quantity', value: DETAILS.quantity },
          { label: 'Guests', value: DETAILS.guests },
          { label: 'Price', value: DETAILS.price },
          { label: 'Balance', value: DETAILS.balance },
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
