import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfilePage from '../../pages/ProfilePage';
vi.mock('../../hooks/useComments', () => ({
    default: () => ({
        comments: {},
        fetchCommentsForPosts: vi.fn()
    })
}));
vi.mock('../../components/PostCard', () => ({
    default: ({ post }) => <div data-testid="post-card">{post.content}</div>
}));
vi.mock('../../services/api', async () => {
    const actual = await vi.importActual('../../services/api');
    return {
        ...actual,
        usersAPI: {
            getUserById: vi.fn(),
            updateUser: vi.fn(),
            getUserActivity: vi.fn()
        },
        uploadAPI: {
            uploadImage: vi.fn()
        },
        getPublicUrl: (path) => path,
        getErrorMessage: (error, fallback) => error?.response?.data?.detail || fallback
    };
});
import { usersAPI, uploadAPI } from '../../services/api';
describe('ProfilePage', () => {
    const currentUser = {
        id: 1,
        username: 'ava_bites',
        email: 'ava@example.com',
        full_name: 'Ava Bennett',
        biography: 'Food writer',
        avatar_url: '/uploads/ava.png'
    };
    const posts = [
        { id: 1, content: 'My first thought', author_id: 1, author: { id: 1, username: 'ava_bites' } }
    ];
    beforeEach(() => {
        vi.clearAllMocks();
        usersAPI.getUserActivity.mockResolvedValue([
            { type: 'post', entity_id: 1, title: 'A post', summary: 'Shared a thing', created_at: '2024-01-01T00:00:00Z' }
        ]);
    });
    const renderPage = (route = '/profile') => render(<MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/profile" element={<ProfilePage posts={posts} token="token" currentUser={currentUser} showToast={vi.fn()} fetchPosts={vi.fn()} requireAuth={vi.fn(() => true)} refreshCurrentUser={vi.fn()}/>}/>
                <Route path="/profile/:userId" element={<ProfilePage posts={posts} token="token" currentUser={currentUser} showToast={vi.fn()} fetchPosts={vi.fn()} requireAuth={vi.fn(() => true)} refreshCurrentUser={vi.fn()}/>}/>
            </Routes>
        </MemoryRouter>);
    it('renders the recent activity section', async () => {
        renderPage();
        expect(await screen.findByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText('Shared a thought: A post')).toBeInTheDocument();
    });
    it('uploads a profile image while editing', async () => {
        uploadAPI.uploadImage.mockResolvedValue({ url: '/uploads/new-avatar.png' });
        renderPage('/profile?edit=true');
        const fileInput = document.querySelector('input[type="file"]');
        const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
        await waitFor(() => {
            expect(uploadAPI.uploadImage).toHaveBeenCalled();
        });
    });
    it('saves profile updates', async () => {
        usersAPI.updateUser.mockResolvedValue({
            ...currentUser,
            full_name: 'Updated Ava'
        });
        renderPage('/profile?edit=true');
        fireEvent.change(screen.getByPlaceholderText('Full Name'), {
            target: { value: 'Updated Ava' }
        });
        fireEvent.click(screen.getByRole('button', { name: /save profile/i }));
        await waitFor(() => {
            expect(usersAPI.updateUser).toHaveBeenCalled();
        });
    });
});
