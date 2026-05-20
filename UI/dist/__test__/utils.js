import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-amber/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
/**
 * Custom render function that wraps components with:
 * - PrimeReactProvider (required for PrimeReact components)
 * - BrowserRouter (required for react-router-dom hooks like useNavigate)
 *
 * Usage: Import render from this file instead of @testing-library/react
 * import { render, screen } from '../__test__/utils';
 */
function render(ui, { ...options } = {}) {
    const wrappedUI = (<PrimeReactProvider>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </PrimeReactProvider>);
    return rtlRender(wrappedUI, options);
}
// Re-export everything from @testing-library/react
export * from '@testing-library/react';
// Override the render function
export { render };
