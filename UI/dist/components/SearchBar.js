import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Avatar } from 'primereact/avatar';
import { getPublicUrl, usersAPI, postsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/searchbar.css';
const SearchBar = ({ token, onSelectUser }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        if (!query.trim()) {
            setSuggestions([]);
        }
    }, [query]);
    const handleSearch = async (event) => {
        const value = (event.query || '').trim();
        if (!value.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const [users, posts] = await Promise.all([
                usersAPI.searchUsers(value),
                postsAPI.searchPosts(value)
            ]);
            const combined = [
                ...users.map((user) => ({
                    ...user,
                    type: 'user',
                    label: `@${user.username}`,
                    searchText: `${user.username} ${user.full_name || ''}`.trim()
                })),
                ...posts.map((post) => ({
                    ...post,
                    type: 'post',
                    label: post.title && post.title !== 'Untitled'
                        ? post.title
                        : post.content.slice(0, 60),
                    searchText: `${post.title || ''} ${post.content || ''}`.trim()
                }))
            ];
            setSuggestions(combined);
        }
        catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        }
    };
    const handleSelect = (e) => {
        const item = e.value;
        if (item.type === 'user') {
            navigate(`/profile/${item.id}`);
        }
        else if (item.type === 'post') {
            navigate(`/explore?query=${encodeURIComponent(query.trim() || item.searchText || item.content)}`);
        }
        setQuery('');
    };
    const itemTemplate = (item) => {
        if (item.type === 'user') {
            return (<div className="flex align-items-center gap-3 p-2">
                    <Avatar image={getPublicUrl(item.avatar_url)} label={!item.avatar_url ? item.username.charAt(0).toUpperCase() : null} shape="circle" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}/>
                    <div className="flex flex-column">
                        <span className="font-bold text-color">@{item.username}</span>
                        <span className="text-sm text-500">{item.full_name || 'Member'}</span>
                    </div>
                    <span className="ml-auto text-xs font-bold text-600 uppercase">User</span>
                </div>);
        }
        return (<div className="flex align-items-center gap-3 p-2">
                <div className="flex align-items-center justify-content-center border-round-lg bg-gray-700" style={{ width: '32px', height: '32px' }}>
                    <i className="pi pi-comment text-400 text-sm"></i>
                </div>
                <div className="flex flex-column" style={{ maxWidth: '250px' }}>
                    <span className="text-sm text-color line-height-2 overflow-hidden text-overflow-ellipsis white-space-nowrap">
                        {item.content}
                    </span>
                    <span className="text-xs text-600">by @{item.author?.username || 'user'}</span>
                </div>
                <span className="ml-auto text-xs font-bold text-600 uppercase">Post</span>
            </div>);
    };
    return (<AutoComplete value={query} suggestions={suggestions} completeMethod={handleSearch} field="label" onChange={(e) => setQuery(typeof e.value === 'string' ? e.value : e.value?.label || '')} onSelect={handleSelect} placeholder="Search people or thoughts..." itemTemplate={itemTemplate} className="w-full"/>);
};
export default SearchBar;
