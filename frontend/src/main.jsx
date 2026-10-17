import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './details.css';
import './dna-extras.css';
import './common-room.css';
import './campus-features.css';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
