import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';

vi.mock('../../services/api', () => ({
    usersAPI: {
        searchUsers: vi.fn().mockResolvedValue([
            { id: 1, username: 'john', full_name: 'John Doe', type: 'user' }
        ])
    },
    postsAPI: {
        searchPosts: vi.fn().mockResolvedValue([
            { id: 1, content: 'Hello world', author: { username: 'john' }, type: 'post' }
        ])
    }
}));

describe('SearchBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders search input with placeholder', () => {
        render(
            <MemoryRouter>
                <SearchBar token="token" onSelectUser={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText('Search people or thoughts...')).toBeInTheDocument();
    });

    it('accepts input text', () => {
        render(
            <MemoryRouter>
                <SearchBar token="token" onSelectUser={vi.fn()} />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText('Search people or thoughts...');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(input.value).toBe('test');
    });
});