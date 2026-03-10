import { useState } from 'react';
import {
  Avatar,
  Badge,
  Banner,
  Breadcrumb,
  Button,
  Checkbox,
  Chip,
  Drawer,
  Icon,
  Input,
  Link,
  Loading,
  MarketplaceHeader,
  Message,
  Modal,
  Pagination,
  RadioGroup,
  Rating,
  RangeSlider,
  SegmentedControl,
  Select,
  Skeleton,
  SkipLink,
  SnackBar,
  Stepper,
  Tabs,
  Textarea,
  Toggle,
  Tooltip,
  Accordion,
} from '@/components';

const tabItems = [
  { id: 'one', label: 'Tab One', panel: <p>Content for tab one.</p> },
  { id: 'two', label: 'Tab Two', panel: <p>Content for tab two.</p> },
  { id: 'three', label: 'Tab Three', panel: <p>Content for tab three.</p> },
];

const accordionItems = [
  { id: 'a1', title: 'Section 1', content: <p>Accordion content one.</p> },
  { id: 'a2', title: 'Section 2', content: <p>Accordion content two.</p> },
];

const selectOptions = [
  { value: '', label: 'Choose…' },
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

const segmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export default function Demo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [tabId, setTabId] = useState('one');
  const [segment, setSegment] = useState('center');
  const [page, setPage] = useState(1);
  const [radioValue, setRadioValue] = useState('a');
  const [headerFav, setHeaderFav] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '56rem', margin: '0 auto' }}>
      <SkipLink href="#main">Skip to main content</SkipLink>

      <h1 style={{ font: 'var(--wel-typography-display-04)', marginBottom: '1rem' }}>
        Accor Design System — React
      </h1>
      <p style={{ font: 'var(--wel-typography-body-default-01)', marginBottom: '2rem' }}>
        Components built with design tokens. Reference:{' '}
        <Link href="https://ads-components-dev.netlify.app/" external>
          ADS Storybook
        </Link>
        .
      </p>

      <main id="main">
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ font: 'var(--wel-typography-title-01)', marginBottom: '0.75rem' }}>
            Marketplace Header (mobile)
          </h2>
          <p style={{ font: 'var(--wel-typography-body-default-02)', marginBottom: '1rem' }}>
            From All Accor Marketplace Figma — variables: theme, isLoggedIn, points, loyaltyTier, paymentLabel, eventLabel, favourite.
          </p>
          <div style={{ maxWidth: '393px', marginBottom: '1rem' }}>
            <MarketplaceHeader
              theme="light"
              isLoggedIn={false}
              onAccount={() => {}}
            />
          </div>
          <div style={{ maxWidth: '393px', marginBottom: '1rem' }}>
            <MarketplaceHeader
              theme="light"
              isLoggedIn
              points={3000}
              loyaltyTier="gold"
              avatarSrc={null}
              paymentLabel="Redeem now"
              eventLabel="Sustainable Experience"
              isFavourite={headerFav}
              onFavouriteToggle={() => setHeaderFav(!headerFav)}
              onMenu={() => {}}
            />
          </div>
          <div style={{ maxWidth: '393px', marginBottom: '1rem' }}>
            <MarketplaceHeader
              theme="dark"
              isLoggedIn
              points={1000}
              loyaltyTier="classic"
              eventLabel="Fever Original"
              onMenu={() => {}}
            />
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ font: 'var(--wel-typography-title-01)', marginBottom: '0.75rem' }}>Atoms</h2>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Button</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="eco">Eco</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Input</h3>
          <div style={{ marginBottom: '1rem', maxWidth: '20rem' }}>
            <Input label="Label" placeholder="Placeholder" />
            <Input label="With hint" hint="Helper text" placeholder="…" style={{ marginTop: '0.5rem' }} />
            <Input label="Error" error="Required field" defaultValue="invalid" style={{ marginTop: '0.5rem' }} />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Badge & Chip</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <Badge>Default</Badge>
            <Badge variant="eco">Eco</Badge>
            <Badge variant="family">Family</Badge>
            <Chip onRemove={() => {}}>Removable chip</Chip>
            <Chip variant="eco">Eco chip</Chip>
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Checkbox & Radio</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <Checkbox label="Checkbox option" />
            <RadioGroup
              name="demo"
              label="Radio group"
              value={radioValue}
              onChange={setRadioValue}
              options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
              ]}
            />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Avatar, Icon, Loading, Rating</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Avatar initials="AB" />
            <Avatar src="" initials="CD" size="lg" />
            <Icon name="search" />
            <Loading />
            <Rating value={3} max={5} />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Skeleton, Stepper, RangeSlider</h3>
          <div style={{ marginBottom: '1rem' }}>
            <Skeleton width={200} height={24} style={{ marginBottom: '0.5rem' }} />
            <Stepper steps={['Step 1', 'Step 2', 'Step 3']} currentStep={2} />
            <div style={{ marginTop: '0.5rem', maxWidth: '16rem' }}>
              <RangeSlider label="Volume" defaultValue={50} />
            </div>
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>SegmentedControl & Tooltip</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <SegmentedControl options={segmentOptions} value={segment} onChange={setSegment} />
            <Tooltip content="Tooltip text">
              <Button variant="ghost" size="sm">Hover me</Button>
            </Tooltip>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ font: 'var(--wel-typography-title-01)', marginBottom: '0.75rem' }}>Molecules</h2>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Tabs</h3>
          <div style={{ marginBottom: '1rem' }}>
            <Tabs tabs={tabItems} activeId={tabId} onChange={setTabId} />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Accordion</h3>
          <div style={{ marginBottom: '1rem' }}>
            <Accordion items={accordionItems} defaultOpenIds={['a1']} />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Select & Textarea & Toggle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '20rem', marginBottom: '1rem' }}>
            <Select options={selectOptions} label="Select" fullWidth />
            <Textarea label="Textarea" placeholder="Type here…" fullWidth rows={3} />
            <Toggle label="Toggle option" />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Message, Banner, Breadcrumb</h3>
          <div style={{ marginBottom: '1rem' }}>
            <Message variant="success" title="Success">Operation completed.</Message>
            <Banner title="Banner" onClose={() => {}}>Banner message content.</Banner>
            <Breadcrumb
              items={[
                { href: '#', label: 'Home' },
                { href: '#', label: 'Section' },
                { label: 'Current' },
              ]}
            />
          </div>

          <h3 style={{ font: 'var(--wel-typography-title-03)', marginTop: '1rem' }}>Modal, Drawer, SnackBar, Pagination</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            <Button variant="ghost" onClick={() => setSnackOpen(true)}>Show snackbar</Button>
            <Pagination page={page} totalPages={5} onPageChange={setPage} />
          </div>
        </section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal title"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>Modal body content.</p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer" side="right">
        <p>Drawer content.</p>
      </Drawer>

      <SnackBar
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
        message="Snackbar message"
        action={<Button variant="link" size="sm" onClick={() => setSnackOpen(false)}>Undo</Button>}
      />
    </div>
  );
}
