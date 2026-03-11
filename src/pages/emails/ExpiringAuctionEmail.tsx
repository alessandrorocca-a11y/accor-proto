import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, FooterText } from './EmailTemplate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  date: 'Monday, 16 February',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  currentHighest: '27.000 Points',
  bidders: '8',
  auctionEnds: 'Friday 13 March 2026 - 23:59',
  timeRemaining: '3 days',
  yourStatus: 'Outbid',
};

export default function ExpiringAuctionEmail() {
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Only 3 days left!">
        <p>
          The auction for <span className="email__bold">[Event name]</span> is ending soon. You've been outbid — place a new bid now before time runs out!
        </p>
      </TextBlock>

      <EventCard {...EVENT} />

      <MessageBar variant="danger">
        <strong>You've been outbid!</strong> The current bid is {DETAILS.currentHighest}. You have {DETAILS.timeRemaining} to bid again.
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
