import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/theme.css';
import './index.css';
import './utils/navigationHistory';
import { PrototypePreviewProvider } from './context/PrototypePreviewContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrototypePreviewProvider>
      <App />
    </PrototypePreviewProvider>
  </StrictMode>
);
