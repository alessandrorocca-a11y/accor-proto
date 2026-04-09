import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, FooterText } from './EmailTemplate';
import { getEmailPreviewEventDate } from './emailEventDate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable experience',
};

const DETAILS = {
  currentHighest: '27.000 Points',
  bidders: '12',
  auctionEnds: 'Tuesday 11 March 2026 - 23:59',
  timeRemaining: 'Less than 24 hours',
};

export default function Auction24hLeftEmail() {
  const eventCard = { ...EVENT, date: getEmailPreviewEventDate() };
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Last 24 hours, don't miss out!">
        <p>
          The auction for <span className="email__bold">[Event name]</span> closes tomorrow. This is your last chance to place a winning bid!
        </p>
      </TextBlock>

      <EventCard {...eventCard} />

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
