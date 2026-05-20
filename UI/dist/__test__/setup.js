import { vi } from 'vitest';
import '@testing-library/jest-dom';
// Mock window.matchMedia - required by PrimeReact components in jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
// Mock ResizeObserver - required by PrimeReact Dialog, Dropdown components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
global.localStorage = localStorageMock;
// Mock window.location
delete window.location;
window.location = {
    href: '',
    reload: vi.fn(),
};
// Mock PrimeReact components that might cause issues
vi.mock('primereact/dialog', () => ({
    Dialog: ({ children, visible, onHide }) => {
        if (!visible)
            return null;
        return (<div data-testid="mock-dialog">
                {children}
                <button data-testid="close-dialog" onClick={onHide}>Close</button>
            </div>);
    },
}));
vi.mock('primereact/button', () => ({
    Button: ({ children, onClick, disabled, label, icon, className, style, type, link, tooltip, ...props }) => (<button onClick={onClick} disabled={disabled} className={className} style={style} type={type} title={tooltip} label={label} {...props}>
             {label || children}
         </button>),
}));
vi.mock('primereact/avatar', () => ({
    Avatar: ({ label, image, ...props }) => (<div data-testid="mock-avatar" {...props}>
            {image ? <img src={image} alt="avatar"/> : label}
        </div>),
}));
vi.mock('primereact/inputtext', () => ({
    InputText: ({ value, onChange, placeholder, ...props }) => (<input value={value || ''} onChange={onChange} placeholder={placeholder} {...props}/>),
}));
vi.mock('primereact/password', () => ({
    Password: ({ value, onChange, placeholder, toggleMask, ...props }) => (<div style={{ width: '100%' }}>
            <input type={toggleMask ? 'password' : 'text'} value={value || ''} onChange={onChange} placeholder={placeholder} {...props} style={{
            borderRadius: '24px',
            backgroundColor: '#f5f0e6',
            border: '1px solid #d4c4a8',
            padding: '14px 18px',
            width: '100%',
            fontSize: '16px'
        }}/>
            {toggleMask && (<button type="button" style={{ marginLeft: '8px' }}>
                    👁
                </button>)}
        </div>),
}));
vi.mock('primereact/toast', () => ({
    Toast: () => <div data-testid="mock-toast"/>,
}));
vi.mock('primereact/inputtextarea', () => ({
    InputTextarea: ({ value, onChange, placeholder, ...props }) => (<textarea value={value || ''} onChange={onChange} placeholder={placeholder} {...props}/>),
}));
// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
