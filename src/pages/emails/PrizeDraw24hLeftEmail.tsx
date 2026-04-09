import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, FooterText } from './EmailTemplate';
import { getEmailPreviewEventDate } from './emailEventDate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable experience',
};

const DETAILS = {
  price: '1.500 Points',
  currentEntries: '934',
  drawDate: 'Wednesday, June 25, 2026',
  entriesClose: 'Wednesday 11 March 2026 - 12:00',
  timeRemaining: 'Less than 24 hours',
};

export default function PrizeDraw24hLeftEmail() {
  const eventCard = { ...EVENT, date: getEmailPreviewEventDate() };
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Last chance to enter the draw!">
        <p>
          The prize draw for <span className="email__bold">[Event name]</span> closes in less than 24 hours. Don't miss your chance to win this incredible experience, enter now before it's too late!
        </p>
      </TextBlock>

      <EventCard {...eventCard} />

      <MessageBar variant="danger">
        <strong>Entries close in less than 24 hours.</strong> Submit your entry before {DETAILS.entriesClose} to be in with a chance to win.
      </MessageBar>

      <DetailsCard
        title="Prize draw details"
        rows={[
          { label: 'Price', value: DETAILS.price },
          { label: 'Current entries', value: DETAILS.currentEntries },
          { label: 'Draw date', value: DETAILS.drawDate },
          { label: 'Time remaining', value: DETAILS.timeRemaining },
        ]}
      >
        <EmailButton label="Enter now" />
      </DetailsCard>

      <FooterText>
        Final reminder: Once entries close, no more participants can join. The winner will be selected at random from all valid entries.
      </FooterText>
    </EmailTemplate>
  );
}
