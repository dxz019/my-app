import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';  // PrimeReact autocomplete with built-in dropdown
import { Avatar } from 'primereact/avatar';               // PrimeReact avatar
import { usersAPI } from '../services/api';               // User API

// SearchBar component - user search with PrimeReact AutoComplete
const SearchBar = ({ onSelectUser, token }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    // Debounced search - AutoComplete handles this via suggestions prop
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Search users by username/full name
    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        try {
            const response = await usersAPI.searchUsers(query);
            setResults(response);
        } catch (error) {
            console.error('Error searching user:', error);
            setResults([]);
        }
    };

    // Handle user selection from dropdown
    const handleSelectUser = (e) => {
        const user = e.value;
        setQuery('');
        if (onSelectUser) {
            onSelectUser(user);
        }
    };

    // Custom item template for dropdown
    const itemTemplate = (user) => {
        return (
            <div className="flex align-items-center gap-3 p-2">
                <Avatar
                    label={user.username.charAt(0).toUpperCase()}
                    shape="circle"
                    size="small"
                    style={{ backgroundColor: '#8b7355' }}
                />
                <div className="flex flex-column">
                    <span className="font-semibold text-gray-800">
                        {user.full_name || user.username}
                    </span>
                    <span className="text-gray-500 text-sm">
                        @{user.username}
                    </span>
                </div>
            </div>
        );
    };

    // Don't render if no token (not logged in)
    if (!token) return null;

    return (
        // PrimeReact AutoComplete - handles input + dropdown natively
        <div className="w-full">
            <AutoComplete
                value={query}
                suggestions={results}
                completeMethod={handleSearch}
                onChange={(e) => setQuery(e.value)}
                onSelect={handleSelectUser}
                placeholder="Search"
                itemTemplate={itemTemplate}
                field="username"
                className="w-full"
                inputClassName="w-full p-3 border-1 border-gray-200 border-round-3xl surface-0"
                style={{
                    borderRadius: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            />
        </div>
    );
};

export default SearchBar;
