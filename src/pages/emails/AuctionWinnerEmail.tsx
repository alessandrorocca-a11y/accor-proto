import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, EmailButtons, FooterText } from './EmailTemplate';

const EVENT = {
  image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
  date: 'Monday, 16 February',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  orderNumber: 'ALL-2026-04817',
  yourBid: '32.000 Points',
  status: 'Winner',
  totalBidders: '21',
};

export default function AuctionWinnerEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Congratulations — you won this auction!">
        <p>
          You are the winner of the auction for <span className="email__bold">[Event name]</span>. Your reward points have been deducted and the experience is now confirmed.
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="success">
        <strong>Auction won!</strong> You'll receive a separate email with all event details.
      </MessageBar>

      <DetailsCard
        title="Auction details"
        rows={[
          { label: 'Order number', value: DETAILS.orderNumber },
          { label: 'Your bid', value: DETAILS.yourBid },
          { label: 'Status', value: DETAILS.status, valueClass: 'success' },
          { label: 'Total bidders', value: DETAILS.totalBidders },
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
