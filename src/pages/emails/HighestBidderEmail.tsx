import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, FooterText } from './EmailTemplate';
import { getEmailPreviewEventDate } from './emailEventDate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable Experience',
};

const DETAILS = {
  yourBid: '26.000 Points',
  status: 'Winning',
  totalBidders: '12',
  timeRemaining: '2d 14h 24m',
  endsOn: 'Monday 14 April 2026 - 23:59',
};

export default function HighestBidderEmail() {
  const eventCard = { ...EVENT, date: getEmailPreviewEventDate() };
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="You are the highest bidder!">
        <p>
          Great news, your bid on <span className="email__bold">[Event name]</span> has been confirmed and is currently in the lead. Keep an eye on this auction to make sure you stay on top, there is always the possibility that someone will outbid you. It is not possible to bid on your own auction.
        </p>
      </TextBlock>

      <EventCard {...eventCard} />

      <MessageBar variant="success">
        <strong>You are currently the highest bidder.</strong> The auction ends on Monday, April 14, 2026 — 11:59 PM.
      </MessageBar>

      <DetailsCard
        title="Auction details"
        rows={[
          { label: 'Your bid', value: DETAILS.yourBid },
          { label: 'Status', value: DETAILS.status, valueClass: 'success' },
          { label: 'Total bidders', value: DETAILS.totalBidders },
          { label: 'Time remaining', value: DETAILS.timeRemaining },
          { label: 'Ends on', value: DETAILS.endsOn },
        ]}
      >
        <EmailButton label="View Auction" />
      </DetailsCard>

      <FooterText>
        At the end of the auction, the winner will be designated by a confirmation e-mail which will be sent to him. This email is the only one to claim the auction (the display on the site cannot serve as proof, insofar as a delay in updating the display is necessary).
      </FooterText>
    </EmailTemplate>
  );
}
