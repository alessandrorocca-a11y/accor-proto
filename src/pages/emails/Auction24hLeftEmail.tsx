import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, FooterText } from './EmailTemplate';

const EVENT = {
  image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
  date: 'Monday, 16 February',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  currentHighest: '27.000 Points',
  bidders: '12',
  auctionEnds: 'Tuesday 11 March 2026 - 23:59',
  timeRemaining: 'Less than 24 hours',
};

export default function Auction24hLeftEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Last 24 hours, don't miss out!">
        <p>
          The auction for <span className="email__bold">[Event name]</span> closes tomorrow. This is your last chance to place a winning bid!
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="danger">
        <strong>Less than 24 hours remaining.</strong> The current bid is {DETAILS.currentHighest}. Act now!
      </MessageBar>

      <DetailsCard
        title="Auction status"
        rows={[
          { label: 'Current highest bid', value: DETAILS.currentHighest },
          { label: 'Bidders', value: DETAILS.bidders },
          { label: 'Auction ends', value: DETAILS.auctionEnds },
          { label: 'Time remaining', value: DETAILS.timeRemaining },
        ]}
      >
        <EmailButton label="Place a new bid" />
      </DetailsCard>

      <FooterText>
        Final reminder: Once entries close, no more participants can join. The winner will be selected at random from all valid entries.
      </FooterText>
    </EmailTemplate>
  );
}
