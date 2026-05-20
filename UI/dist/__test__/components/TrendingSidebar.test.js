import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrendingSidebar from '../../components/TrendingSidebar';
describe('TrendingSidebar', () => {
    const renderWithRouter = (ui) => {
        return render(<MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>);
    };
    it('renders trending heading and topics', () => {
        renderWithRouter(<TrendingSidebar />);
        expect(screen.getByText('Trending Thoughts')).toBeInTheDocument();
        expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
        expect(screen.getByText('#CodeLife')).toBeInTheDocument();
    });
    it('navigates to an explore tag when a trend is clicked', () => {
        renderWithRouter(<TrendingSidebar />);
        fireEvent.click(screen.getByText('#FutureAI'));
        expect(window.location.href).toBe('/explore?tag=FutureAI');
    });
});
