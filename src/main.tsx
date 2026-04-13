import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/theme.css';
import './index.css';
import './utils/navigationHistory';
import App from './App';
import { DevicePreviewFrame } from './components/DevicePreviewFrame/DevicePreviewFrame';

function devicePreviewFrameEnabled(): boolean {
  const v = import.meta.env.VITE_DEVICE_PREVIEW_FRAME;
  if (v === 'false' || v === '0') return false;
  return true;
}

const root = createRoot(document.getElementById('root')!);
const app = <App />;
root.render(
  <StrictMode>
    {devicePreviewFrameEnabled() ? <DevicePreviewFrame>{app}</DevicePreviewFrame> : app}
  </StrictMode>
);
