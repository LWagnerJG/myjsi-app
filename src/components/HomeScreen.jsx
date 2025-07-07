import React, { useCallback } from 'react';
import { MessageSquare, Hourglass } from 'lucide-react';

// You will need to move these two components into their own files as well eventually,
// but for now, we can define them here to get it working.

const GlassCard = React.memo(React.forwardRef(({ children, className = '', theme, ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-[1.75rem] border shadow-lg transition-all duration-300 ${className}`}
        style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: `0 4px 30px ${theme.colors.shadow}`,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
        }}
        {...props}
    >
        {children}
    </div>
)));

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

    const handleVoiceClick = () => {
        showAlert('Voice search activated.');
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
                    onClick={handleVoiceClick}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                    <Mic className="h-5 w-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            </form>

            {isFocused && filteredApps.length > 0 && (
                <ul className="absolute top-full mt-2 w-full rounded-lg shadow-xl bg-[color:theme(colors.background)] z-50">
                    {filteredApps.map(app => (
                        <li
                            key={app.route}
                            onMouseDown={() => handleNavigation(app.route)}
                            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-[color:theme(colors.hover)]"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            <ChevronRight className="w-4 h-4 text-[color:theme(colors.textSecondary)]" />
                            {app.name}
                        </li>
                    ))}
                </ul>
            )}


        </div>
    );
};




// The HomeScreen component you cut from App.jsx
const HomeScreen = ({ onNavigate, theme, onAskAI, searchTerm, onSearchTermChange, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, showAlert }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-full rounded-t-[40px] -mt-8 pt-8" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-2 relative z-10">
                <SmartSearch
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    showAlert={showAlert}
                />
                {showAIDropdown && (
                    <GlassCard theme={theme} className="absolute top-full w-full mt-2 p-4">
                        {isAILoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Hourglass className="w-6 h-6 animate-spin" style={{ color: theme.colors.accent }} />
                                <p className="ml-3" style={{ color: theme.colors.textPrimary }}>Thinking...</p>
                            </div>
                        ) : (
                            <p style={{ color: theme.colors.textPrimary }}>{aiResponse}</p>
                        )}
                    </GlassCard>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                    {MENU_ITEMS.map((item) => (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="
                                group relative p-4 h-32 flex flex-col justify-between 
                                cursor-pointer transition-all duration-300 hover:border-white/20
                            "
                            onClick={() => onNavigate(item.id)}
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-full rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `radial-gradient(circle at 20% 25%, ${theme.colors.subtle}00 0%, ${theme.colors.subtle} 100%)` }}
                            ></div>

                            <div className="relative">
                                <item.icon className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                            </div>

                            <div className="relative">
                                <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard theme={theme} className="p-1">
                    <button onClick={handleFeedbackClick} className="w-full h-20 p-3 rounded-xl flex items-center justify-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                    </button>
                </GlassCard>
            </div>

            {showAIDropdown && (<div className="absolute inset-0 bg-transparent z-0" onClick={onCloseAIDropdown} />)}
        </div>
    );
};

export default HomeScreen;