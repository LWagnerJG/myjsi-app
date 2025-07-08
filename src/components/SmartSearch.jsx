import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, ChevronRight } from 'lucide-react';
import SmartSearch from './SmartSearch';

const allApps = [
    { name: 'Samples', route: 'samples' },
    { name: 'Request Replacement', route: 'replacements' },
    { name: 'Community', route: 'community' },
    { name: 'Lead Times', route: 'lead-times' },
    { name: 'Products', route: 'products' },
    { name: 'Orders', route: 'orders' },
    { name: 'Sales', route: 'sales' },
    { name: 'Projects', route: 'projects' },
    { name: 'Resources', route: 'resources' },
    { name: 'Dealer Directory', route: 'resources/dealer_directory' },
    { name: 'Commission Rates', route: 'resources/commission_rates' },
    { name: 'Contracts', route: 'resources/contracts' },
    { name: 'Loaner Pool', route: 'resources/loaner_pool' },
    { name: 'Discontinued Finishes', route: 'resources/discontinued_finishes' },
    { name: 'Sample Discounts', route: 'resources/sample_discounts' },
    { name: 'Social Media', route: 'resources/social_media' },
    { name: 'Customer Ranking', route: 'customer-rank' },
    { name: 'Commissions', route: 'commissions' },
    { name: 'Members', route: 'members' },
    { name: 'Settings', route: 'settings' },
    { name: 'Help', route: 'help' },
    { name: 'Feedback', route: 'feedback' },
];

const SmartSearch = ({ theme, onNavigate, onAskAI, showAlert }) => {
    const [query, setQuery] = useState('');
    const [filteredApps, setFilteredApps] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        if (!isFocused) {
            setFilteredApps([]);
            return;
        }
        const term = query.trim().toLowerCase();
        if (term.length >= 2) {
            const results = allApps
                .filter(app => app.name.toLowerCase().includes(term))
                .sort((a, b) => a.name.localeCompare(b.name));
            setFilteredApps(results);
        } else {
            setFilteredApps([]);
        }
    }, [query, isFocused]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (route) => {
        onNavigate(route);
        setQuery('');
        setFilteredApps([]);
        setIsFocused(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && filteredApps.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };


    return (
        <div ref={searchContainerRef} className="relative z-20">
            <form onSubmit={handleFormSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full pl-11 pr-12 py-3 rounded-full text-base border-2 shadow-md transition-colors focus:ring-2"
                    style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.textPrimary,
                        borderColor: theme.colors.border,
                        outline: 'none',
                    }}
                />
                <button
                    type="button"
                    onClick={() => showAlert('Voice search is not implemented.')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            </form>

            {isFocused && filteredApps.length > 0 && (
                <ul className="absolute top-full mt-2 w-full rounded-lg shadow-xl" style={{ backgroundColor: theme.colors.surface }}>
                    {filteredApps.map(app => (
                        <li
                            key={app.route}
                            onMouseDown={() => handleNavigation(app.route)}
                            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-black/5"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            <ChevronRight className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                            {app.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SmartSearch;