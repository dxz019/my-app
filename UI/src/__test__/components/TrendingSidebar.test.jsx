import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TrendingSidebar from '../../components/TrendingSidebar';

describe('TrendingSidebar', () => {
    it('renders trending heading and topics', () => {
        render(<TrendingSidebar />);

        expect(screen.getByText('Trending Thoughts')).toBeInTheDocument();
        expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
        expect(screen.getByText('#CodeLife')).toBeInTheDocument();
    });

    it('navigates to an explore tag when a trend is clicked', () => {
        render(<TrendingSidebar />);

        fireEvent.click(screen.getByText('#FutureAI'));

        expect(window.location.href).toBe('/explore?tag=FutureAI');
    });
});
