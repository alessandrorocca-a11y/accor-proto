import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, EmailButtons, FooterText } from './EmailTemplate';
import { getEmailPreviewEventDate } from './emailEventDate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  currentHighest: '27.000 Points',
  yourBid: '26.000 Points',
  status: 'Outbid',
  totalBidders: '12',
  timeRemaining: '2d 14h 24m',
  endsOn: 'Monday 14 April 2026 - 23:59',
};

export default function OutbidEmail() {
  const eventCard = { ...EVENT, date: getEmailPreviewEventDate() };
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="You've been outbid">
        <p>
          Another member has placed a higher bid on <span className="email__bold">[Event Name]</span>. Don't miss out — place a new bid now to get back in the lead.
        </p>
      </TextBlock>

      <EventCard {...eventCard} />

      <MessageBar variant="danger">
        <strong>Your bid of 12,000 points has been surpassed.</strong> The current highest bid is now 13,500 points.
      </MessageBar>

      <DetailsCard
        title="Auction details"
        rows={[
          { label: 'Current highest bid', value: DETAILS.currentHighest },
          { label: 'Your bid', value: DETAILS.yourBid },
          { label: 'Status', value: DETAILS.status, valueClass: 'danger' },
          { label: 'Total bidders', value: DETAILS.totalBidders },
          { label: 'Time remaining', value: DETAILS.timeRemaining },
          { label: 'Ends on', value: DETAILS.endsOn },
        ]}
      >
        <EmailButtons>
          <EmailButton label="Place a new bid" />
          <EmailButton label="View Auction" variant="tertiary" />
        </EmailButtons>
      </DetailsCard>

      <FooterText>
        At the end of the auction, the winner will be designated by a confirmation e-mail which will be sent to him. This email is the only one to claim the auction (the display on the site cannot serve as proof, insofar as a delay in updating the display is necessary).
      </FooterText>
    </EmailTemplate>
  );
}
