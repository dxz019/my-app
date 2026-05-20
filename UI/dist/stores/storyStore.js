import { create } from 'zustand';
import axios from 'axios';
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
export const useStoryStore = create((set, get) => ({
    stories: [],
    currentStory: null,
    loading: false,
    fetchMyStories: async () => {
        set({ loading: true });
        try {
            const { data } = await axios.get('/stories', getAuthHeader());
            set({ stories: data, loading: false });
        }
        catch (error) {
            set({ stories: [], loading: false });
        }
    },
    fetchStory: async (id) => {
        set({ loading: true });
        try {
            const { data } = await axios.get(`/stories/${id}`);
            set({ currentStory: data, loading: false });
            return data;
        }
        catch (error) {
            set({ currentStory: null, loading: false });
            return null;
        }
    },
    createStory: async (title) => {
        try {
            const { data } = await axios.post('/stories', { title }, getAuthHeader());
            set(s => ({ stories: [data, ...s.stories] }));
            return data;
        }
        catch (error) {
            return null;
        }
    },
    updateGraph: async (id, nodes, edges) => {
        try {
            const { data } = await axios.put(`/stories/${id}`, { nodes, edges }, getAuthHeader());
            set({ currentStory: data });
            return data;
        }
        catch (error) {
            return null;
        }
    },
    updateMeta: async (id, meta) => {
        try {
            const { data } = await axios.put(`/stories/${id}`, meta, getAuthHeader());
            set({ currentStory: data });
            return data;
        }
        catch (error) {
            return null;
        }
    },
    publishStory: async (id) => {
        try {
            const { data } = await axios.post(`/stories/${id}/publish`, { isPublic: true }, getAuthHeader());
            set({ currentStory: data });
            return data;
        }
        catch (error) {
            return null;
        }
    },
    deleteStory: async (id) => {
        try {
            await axios.delete(`/stories/${id}`, getAuthHeader());
            set(s => ({ stories: s.stories.filter(st => st._id !== id) }));
        }
        catch (error) {
            // Handle error silently
        }
    },
    clearCurrentStory: () => set({ currentStory: null })
}));
