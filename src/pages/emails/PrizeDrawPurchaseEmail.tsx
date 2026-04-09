import EmailTemplate, { TextBlock, EventCard, MessageBar, DetailsCard, EmailButton, EmailButtons, FooterText } from './EmailTemplate';
import { getEmailPreviewEventDate } from './emailEventDate';

const EVENT = {
  image: 'https://limitlessexperiences.accor.com/media/catalog/product/A/n/Andrea_Bocelli_2026_affiche_aa_0727.jpg',
  title: 'Rio de Janeiro Carnival 2026 - ALL Accor Lounge at the Alma Rio Box - 2 tickets',
  location: 'Rio de Janeiro, Brasil',
  badge: 'Sustainable experience',
};

const DETAILS = {
  orderNumber: 'ALL-2026-05231',
  quantity: '2',
  guests: '2 adults',
  price: '1.500 Points',
  balance: '41.000 Points',
};

export default function PrizeDrawPurchaseEmail() {
  const eventCard = { ...EVENT, date: getEmailPreviewEventDate() };
  return (
    <EmailTemplate>
      <TextBlock name="[Name]" heading="Your purchase is confirmed!">
        <p>
          Thank you for your purchase. Your prize draw ticket for <span className="email__bold">[Event name]</span> has been successfully processed and confirmed.
        </p>
      </TextBlock>

      <EventCard {...eventCard} />

      <MessageBar variant="success">
        <strong>Entry confirmed!</strong> You are now in the prize draw. Good luck!
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
