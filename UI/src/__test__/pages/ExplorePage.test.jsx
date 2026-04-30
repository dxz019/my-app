import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ExplorePage from '../../pages/ExplorePage';

vi.mock('../../components/PostCard', () => ({
    default: ({ post }) => <div data-testid="post-card">{post.content}</div>
}));

vi.mock('../../components/TrendingSidebar', () => ({
    default: () => <div data-testid="trending-sidebar" />
}));

vi.mock('../../hooks/useComments', () => ({
    default: () => ({
        comments: {},
        fetchCommentsForPosts: vi.fn()
    })
}));

describe('ExplorePage', () => {
    const posts = [
        { id: 1, content: 'Low score #FutureAI', likes_count: 1, comments_count: 1, author_id: 1 },
        { id: 2, content: 'High score #FutureAI', likes_count: 5, comments_count: 2, author_id: 2 },
        { id: 3, content: 'Travel note #Wanderlust', likes_count: 4, comments_count: 1, author_id: 3 }
    ];

    const renderPage = (route = '/explore') => render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route
                    path="/explore"
                    element={
                        <ExplorePage
                            posts={posts}
                            token="token"
                            currentUser={{ id: 1, username: 'ava' }}
                            showToast={vi.fn()}
                            fetchPosts={vi.fn()}
                            requireAuth={vi.fn(() => true)}
                        />
                    }
                />
            </Routes>
        </MemoryRouter>
    );

    it('sorts posts by trending score', () => {
        renderPage();

        const cards = screen.getAllByTestId('post-card');
        expect(cards[0]).toHaveTextContent('High score #FutureAI');
        expect(cards[1]).toHaveTextContent('Travel note #Wanderlust');
    });

    it('filters by tag from the URL', () => {
        renderPage('/explore?tag=FutureAI');

        expect(screen.getByText('Thoughts on #FutureAI')).toBeInTheDocument();
        expect(screen.getAllByTestId('post-card')).toHaveLength(2);
        expect(screen.queryByText('Travel note #Wanderlust')).not.toBeInTheDocument();
    });

    it('clears the active tag filter', () => {
        renderPage('/explore?tag=FutureAI');

        fireEvent.click(screen.getByRole('button', { name: /clear filter/i }));

        expect(screen.getByText('Explore Trending')).toBeInTheDocument();
    });
});
