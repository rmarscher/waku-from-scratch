import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Root, Slot } from 'waku/minimal/client';
import { App } from './client/app';

const ssrRootElement = (
  <StrictMode>
    <Root>
      <Slot id="App" />
    </Root>
  </StrictMode>
);


if ((globalThis as any).__WAKU_HYDRATE__) {
  hydrateRoot(document, ssrRootElement);
} else {
  createRoot(document as any).render(ssrRootElement);
}

const clientOnlyRootElement = (
  <StrictMode>
    <App isSsr={false} isStatic={false} />
  </StrictMode>
);
const clientOnlyRoot = document.createElement('div');
document.body.appendChild(clientOnlyRoot);
createRoot(clientOnlyRoot as any).render(clientOnlyRootElement);
