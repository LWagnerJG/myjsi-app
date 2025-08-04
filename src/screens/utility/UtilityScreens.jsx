import React, { 
    useState, 
    useMemo, 
    useCallback, 
    useRef,
    useEffect,
    useLayoutEffect 
} from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { 
    Package, 
    CheckCircle, 
    Users, 
    Home, 
    Trash2, 
    Minus, 
    Plus,
    ArrowRight,
    Star,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    Camera,
    FileText,
    ChevronRight,
    Clock,
    X,
    ImageIcon,
    PlusCircle,
    Paperclip,
    Settings,
    HelpCircle,
    LogOut,
    User,
    Mail,
    Phone,
    Bell,
    Shield,
    Palette,
    Database,
    Download,
    Smartphone,
    MessageSquare,
    BookOpen,
    ExternalLink,
    AlertCircle,
    Hourglass,
    ChevronDown
} from 'lucide-react';
import * as Data from '../../data.jsx';
import { AddressBookModal } from '../../components/common/AddressBookModal.jsx';
import { FormInput } from '../../components/common/FormComponents.jsx';

// Custom Select Component for the Members Screen
const CustomSelect = ({ label, value, onChange, options, theme, placeholder, required, onOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setIsOpen(false);
    };

    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (onOpen && newIsOpen) onOpen();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Calculate dynamic height based on number of options
    const dropdownStyle = useMemo(() => {
        if (!options || options.length === 0) return {};
        
        const optionHeight = 32; // py-2 + text height ? 32px per option  
        const maxVisibleOptions = 8; // Show max 8 options before scrolling
        const calculatedHeight = Math.min(options.length, maxVisibleOptions) * optionHeight;
        const needsScrolling = options.length > maxVisibleOptions;
        
        return {
            height: needsScrolling ? `${calculatedHeight}px` : 'auto',
            maxHeight: needsScrolling ? `${calculatedHeight}px` : 'none',
            overflowY: needsScrolling ? 'auto' : 'visible'
        };
    }, [options]);

    return (
        <div className={`relative ${isOpen ? 'z-20' : ''}`} ref={buttonRef}>
            {label && (
                <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={handleToggle}
                className="w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary
                }}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div 
                    className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg opacity-100 transform scale-100 transition-all duration-150" 
                    style={{ 
                        backgroundColor: theme.colors.surface, 
                        borderColor: theme.colors.border,
                        transformOrigin: 'top center',
                        boxShadow: `0 4px 30px ${theme.colors.shadow || 'rgba(0, 0, 0, 0.1)'}`,
                        // Explicitly remove backdrop filters for solid appearance
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        ...dropdownStyle
                    }}
                >
                    <div className={dropdownStyle.overflowY === 'auto' ? 'scrollbar-hide' : ''} style={{ height: '100%' }}>
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Permission Toggle Component
const PermissionToggle = ({ label, isEnabled, disabled, onToggle, theme }) => (
    <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
        <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{label}</span>
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`w-12 h-6 rounded-full transition-colors ${
                isEnabled ? 'bg-blue-500' : 'bg-gray-300'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
        </button>
    </div>
);

// Member Card Component
const MemberCard = React.memo(({ user, theme, isCurrentUser, onConfirmPromotion, onConfirmRemove, onUpdateUser, onTogglePermission, onUpdateRole, isExpanded, onToggleExpand, isLast }) => {
    const handleRoleChange = (e) => {
        onUpdateUser(user.id, 'title', e.target.value);
    };

    const handleActionClick = () => {
        if (user.role === 'Admin') {
            onUpdateRole(user.id, 'User');
        } else {
            onConfirmPromotion(user);
        }
    };

    const userPermissions = user.permissions || Data.EMPTY_USER.permissions;

    const cardContent = (
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {user.firstName} {user.lastName}
                </p>
                {user.status === 'pending' && <Hourglass className="w-4 h-4 text-amber-500" />}
                {isCurrentUser && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent, color: 'white' }}>
                        You
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {user.role === 'User' ? (
                    <div className="w-40">
                        <CustomSelect
                            value={user.title}
                            onChange={handleRoleChange}
                            options={Data.USER_TITLES.map(t => ({ value: t, label: t }))}
                            theme={theme}
                            onOpen={onToggleExpand}
                        />
                    </div>
                ) : !isCurrentUser && (
                    <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: theme.colors.secondary }} />
                )}
            </div>
        </div>
    );

    return (
        <div className={`transition-all duration-300 ${!isExpanded && !isLast ? 'border-b' : ''}`} style={{ borderColor: theme.colors.subtle }}>
            <button className="w-full text-left disabled:opacity-70 disabled:cursor-not-allowed" onClick={onToggleExpand} disabled={isCurrentUser}>
                {cardContent}
            </button>

            {isExpanded && !isCurrentUser && (
                <div className="bg-black/5 dark:bg-white/5 px-4 pb-4 animate-fade-in">
                    <div className="pt-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        {user.role === 'User' && (
                            <div className="space-y-3 mb-4">
                                <h4 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Permissions</h4>
                                {Object.entries(Data.PERMISSION_LABELS).map(([key, label]) => {
                                    const isDisabled = !userPermissions.salesData && ['commissions', 'dealerRewards', 'customerRanking'].includes(key);
                                    return (
                                        <PermissionToggle 
                                            key={key} 
                                            label={label} 
                                            isEnabled={userPermissions[key]} 
                                            disabled={isDisabled} 
                                            onToggle={() => onTogglePermission(user.id, key)} 
                                            theme={theme} 
                                        />
                                    );
                                })}
                            </div>
                        )}
                        <div className={`space-y-3 ${user.role === 'User' ? 'pt-4 border-t' : ''}`} style={{ borderColor: theme.colors.subtle }}>
                            <button onClick={handleActionClick} className="w-full text-center p-2.5 rounded-full font-semibold text-white" style={{ backgroundColor: theme.colors.accent }}>
                                {user.role === 'Admin' ? 'Move to User' : 'Make Admin'}
                            </button>
                            <button onClick={() => onConfirmRemove(user)} className="w-full text-center p-2.5 rounded-full font-semibold bg-red-500/10 text-red-500">
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

MemberCard.displayName = 'MemberCard';

// Add User Modal Component
const AddUserModal = ({ show, onClose, onAddUser, theme, roleToAdd }) => {
    const [newUser, setNewUser] = useState(Data.EMPTY_USER);

    useEffect(() => {
        if (show) {
            setNewUser({ ...Data.EMPTY_USER, role: roleToAdd });
        }
    }, [show, roleToAdd]);

    const handleNewUserChange = useCallback((field, value) => {
        setNewUser(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddUser = (e) => {
        e.preventDefault();
        if (newUser.firstName && newUser.lastName && newUser.email) {
            onAddUser(newUser);
            onClose();
        } else {
            alert("Please fill out all required fields.");
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={`Add New ${roleToAdd}`} theme={theme}>
            <form onSubmit={handleAddUser} className="space-y-4">
                <FormInput required label="First Name" value={newUser.firstName} onChange={e => handleNewUserChange('firstName', e.target.value)} placeholder="First Name" theme={theme} />
                <FormInput required label="Last Name" value={newUser.lastName} onChange={e => handleNewUserChange('lastName', e.target.value)} placeholder="Last Name" theme={theme} />
                <FormInput required type="email" label="Email" value={newUser.email} onChange={e => handleNewUserChange('email', e.target.value)} placeholder="Email" theme={theme} />

                {roleToAdd === 'User' && (
                    <CustomSelect required label="User Title" options={Data.USER_TITLES.map(t => ({ value: t, label: t }))} value={newUser.title} onChange={e => handleNewUserChange('title', e.target.value)} theme={theme} placeholder="Select a Title" />
                )}

                <div className="pt-2 text-center">
                    <p className="text-xs mb-3" style={{ color: theme.colors.textSecondary }}>
                        This will send an invitation to the user to join the MyJSI app.
                    </p>
                    <button
                        type="submit"
                        className="w-full font-bold py-3 px-6 rounded-full text-white"
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Send Invite
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// Enhanced Members screen with comprehensive user management
export const MembersScreen = ({ theme, members, setMembers, currentUserId, onNavigate }) => {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);
    const [userToPromote, setUserToPromote] = useState(null);
    const [roleToAdd, setRoleToAdd] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);

    const admins = useMemo(() => members.filter(m => m.role === 'Admin'), [members]);
    const users = useMemo(() => members.filter(m => m.role === 'User'), [members]);

    const handleUpdateUser = useCallback((userId, field, value) => { 
        setMembers(prev => prev.map(m => m.id === userId ? { ...m, [field]: value } : m)); 
    }, [setMembers]);

    const handleUpdateRole = useCallback((userId, newRole) => { 
        setMembers(prev => prev.map(m => (m.id === userId ? { ...m, role: newRole } : m))); 
    }, [setMembers]);

    const handleConfirmRemove = useCallback((user) => { 
        setUserToRemove(user); 
    }, []);

    const executeRemoveUser = useCallback(() => { 
        if (userToRemove) { 
            setMembers(prev => prev.filter(m => m.id !== userToRemove.id)); 
            setUserToRemove(null); 
        } 
    }, [userToRemove, setMembers]);

    const handleTogglePermission = useCallback((userId, permissionKey) => {
        setMembers(prevMembers =>
            prevMembers.map(member => {
                if (member.id === userId) {
                    const newPermissions = { ...member.permissions, [permissionKey]: !member.permissions[permissionKey] };
                    if (permissionKey === 'salesData' && !newPermissions.salesData) {
                        newPermissions.commissions = false; 
                        newPermissions.dealerRewards = false; 
                        newPermissions.customerRanking = false;
                    }
                    return { ...member, permissions: newPermissions };
                }
                return member;
            })
        );
    }, [setMembers]);

    const handleConfirmPromotion = useCallback((user) => { 
        setUserToPromote(user); 
    }, []);

    const executePromotion = useCallback(() => {
        if (userToPromote) {
            handleUpdateRole(userToPromote.id, 'Admin');
            setUserToPromote(null);
        }
    }, [userToPromote, handleUpdateRole]);

    const handleAddUser = (newUser) => {
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        setMembers(prev => [...prev, { ...newUser, id: newId, role: roleToAdd, status: 'pending' }]);
        setShowAddUserModal(false);
    };

    const handleToggleExpand = (userId) => {
        setExpandedUserId(prevId => (prevId === userId ? null : userId));
    };

    return (
        <>
            <div className="px-4 pt-6 pb-4">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>App Users</h1>
            </div>

            <div className="px-4 space-y-6 pb-4">
                <GlassCard theme={theme} className="p-0">
                    <h2 className="font-bold text-2xl p-4" style={{ color: theme.colors.textPrimary }}>Administrators</h2>
                    <div>
                        {admins.map((member, index) => (
                            <MemberCard 
                                key={member.id} 
                                user={member} 
                                theme={theme} 
                                isCurrentUser={member.id === currentUserId} 
                                onConfirmPromotion={handleConfirmPromotion} 
                                onConfirmRemove={handleConfirmRemove} 
                                onUpdateRole={handleUpdateRole} 
                                isExpanded={expandedUserId === member.id} 
                                onToggleExpand={() => handleToggleExpand(member.id)} 
                                isLast={index === admins.length - 1} 
                            />
                        ))}
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <button onClick={() => { setRoleToAdd('Admin'); setShowAddUserModal(true); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.accent }}>
                            <Plus className="w-4 h-4" />
                            <span>Add Administrator</span>
                        </button>
                    </div>
                </GlassCard>

                <GlassCard theme={theme} className="p-0">
                    <h2 className="font-bold text-2xl p-4" style={{ color: theme.colors.textPrimary }}>Users</h2>
                    <div>
                        {users.map((member, index) => (
                            <MemberCard 
                                key={member.id} 
                                user={member} 
                                theme={theme} 
                                isCurrentUser={member.id === currentUserId} 
                                onConfirmPromotion={handleConfirmPromotion} 
                                onConfirmRemove={handleConfirmRemove} 
                                onUpdateUser={handleUpdateUser} 
                                onTogglePermission={handleTogglePermission} 
                                onUpdateRole={handleUpdateRole} 
                                isExpanded={expandedUserId === member.id} 
                                onToggleExpand={() => handleToggleExpand(member.id)} 
                                isLast={index === users.length - 1} 
                            />
                        ))}
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: theme.colors.subtle }}>
                        <button onClick={() => { setRoleToAdd('User'); setShowAddUserModal(true); }} className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: theme.colors.accent }}>
                            <Plus className="w-4 h-4" />
                            <span>Add User</span>
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* All Modals */}
            <AddUserModal show={!!roleToAdd} onClose={() => setRoleToAdd(null)} onAddUser={handleAddUser} theme={theme} roleToAdd={roleToAdd} />
            <Modal show={!!userToRemove} onClose={() => setUserToRemove(null)} title="Delete User" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to delete <span className="font-bold">{userToRemove?.firstName} {userToRemove?.lastName}</span>?</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>This action is permanent.</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setUserToRemove(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={executeRemoveUser} className="font-bold py-2 px-5 rounded-lg bg-red-600 text-white">Delete</button>
                </div>
            </Modal>
            <Modal show={!!userToPromote} onClose={() => setUserToPromote(null)} title="Confirm Role Change" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to make <span className="font-bold">{userToPromote?.firstName} {userToPromote?.lastName}</span> an Admin?</p>
                <p className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>This action gives the user full permissions.</p>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t" style={{ borderColor: theme.colors.border }}>
                    <button onClick={() => setUserToPromote(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={executePromotion} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: '#10B981' }}>Make Admin</button>
                </div>
            </Modal>
        </>
    );
};

export const AddNewInstallScreen = ({ theme, setSuccessMessage, onAddInstall, onBack }) => {
    const [projectName, setProjectName] = useState('');
    const [location, setLocation] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const autocompleteService = useRef(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, []);

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);
        if (autocompleteService.current && value) {
            autocompleteService.current.getPlacePredictions({
                input: value,
                types: ['(cities)']
            }, (preds) => {
                setPredictions(preds || []);
                setShowPredictions(true);
            });
        } else {
            setPredictions([]);
            setShowPredictions(false);
        }
    };

    const handleSelectPrediction = (prediction) => {
        setLocation(prediction.description);
        setPredictions([]);
        setShowPredictions(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setPhotos(p => [...p, ...Array.from(e.target.files)]);
        }
    };

    const removePhoto = (photoIndex) => {
        setPhotos(p => p.filter((_, idx) => idx !== photoIndex));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectName && location && photos.length > 0) {
            const newInstall = {
                name: projectName,
                location: location,
                image: URL.createObjectURL(photos[0])
            };
            onAddInstall(newInstall);
        } else {
            alert('Please fill out all fields and add at least one photo.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <PageTitle title="Add New Install" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4 space-y-4">
                    <FormInput
                        label="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., Acme Corp HQ"
                        theme={theme}
                        required
                    />
                    <div className="relative">
                        <FormInput
                            label="Location"
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="e.g., Jasper, IN" // Updated placeholder
                            theme={theme}
                            required
                        />
                        {showPredictions && predictions.length > 0 && (
                            <GlassCard theme={theme} className="absolute w-full mt-1 z-10 p-1">
                                {predictions.map(p => (
                                    <button
                                        key={p.place_id}
                                        type="button"
                                        onClick={() => handleSelectPrediction(p)}
                                        className="block w-full text-left p-2 rounded-md hover:bg-black/5"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {p.description}
                                    </button>
                                ))}
                            </GlassCard>
                        )}
                    </div>
                    {/* Redesigned Photo Upload Section */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            {photos.map((file, idx) => (
                                <div key={idx} className="relative aspect-square">
                                    <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl shadow-md" />
                                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center space-x-2 py-3 rounded-full" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-semibold">Add Photo</span>
                        </button>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                </GlassCard>
                <div className="pt-2">
                    <button type="submit" className="w-full font-bold py-3.5 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }}>
                        Submit Install
                    </button>
                </div>
            </div>
        </form>
    );
};

// Product selection tabs component - enhanced for better visual design
const ProductTabs = React.memo(({ 
    products, 
    activeProduct, 
    onProductSelect, 
    theme 
}) => (
    <GlassCard theme={theme} className="p-4">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
            {products.map(product => (
                <button
                    key={product.id}
                    onClick={() => onProductSelect(product)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all duration-150 p-1 overflow-hidden ${
                        activeProduct.id === product.id 
                            ? 'border-blue-500' 
                            : 'border-transparent opacity-70'
                    } hover:opacity-100`}
                    style={{ backgroundColor: theme.colors.surface }}
                >
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-xl scale-150" 
                    />
                </button>
            ))}
        </div>
    </GlassCard>
));

ProductTabs.displayName = 'ProductTabs';

// Enhanced product hero section with large product image and pricing table
const ProductHero = React.memo(({ 
    product, 
    categoryData,
    theme, 
    categoryId, 
    onNavigate 
}) => {
    const handleCompetitionClick = useCallback(() => {
        onNavigate(`products/category/${categoryId}/competition`);
    }, [categoryId, onNavigate]);

    return (
        <div className="space-y-4">
            {/* Large product image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                {/* Product name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                    <p className="text-xl font-semibold text-white">
                        ${product.price?.toLocaleString() || 'TBD'}
                    </p>
                    <button
                        onClick={handleCompetitionClick}
                        className="flex items-center space-x-2 mt-3 px-4 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                    >
                        <span>Competition</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* JSI Products pricing table */}
            <GlassCard theme={theme} className="px-6 py-4 space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-2 gap-4 pb-2 text-sm font-semibold border-b" style={{ borderColor: theme.colors.border }}>
                    <div style={{ color: theme.colors.textSecondary }}>Series</div>
                    <div className="text-right" style={{ color: theme.colors.textSecondary }}>List $</div>
                </div>

                {/* Main product row (highlighted) */}
                <div className="grid grid-cols-2 gap-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                    <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                        {product.name}
                    </div>
                    <div className="font-bold text-lg text-right" style={{ color: theme.colors.accent }}>
                        ${product.price?.toLocaleString() || 'TBD'}
                    </div>
                </div>

                {/* Other products in category */}
                {categoryData.products
                    .filter(p => p.id !== product.id)
                    .map(otherProduct => (
                        <div key={otherProduct.id} className="grid grid-cols-2 gap-4 py-3 border-t" style={{ borderColor: theme.colors.border }}>
                            <div className="font-medium" style={{ color: theme.colors.textSecondary }}>
                                {otherProduct.name}
                            </div>
                            <div className="font-medium text-right" style={{ color: theme.colors.textSecondary }}>
                                ${otherProduct.price?.toLocaleString() || 'TBD'}
                            </div>
                        </div>
                    ))}
            </GlassCard>
        </div>
    );
});

ProductHero.displayName = 'ProductHero';

// Competitive analysis metrics with advantage display
const CompetitiveMetrics = React.memo(({ 
    jsiProduct,
    categoryData,
    theme 
}) => {
    if (!categoryData.competition || categoryData.competition.length === 0) {
        return (
            <GlassCard theme={theme} className="p-8 text-center">
                <p style={{ color: theme.colors.textSecondary }}>
                    No competitive data available for this category.
                </p>
            </GlassCard>
        );
    }

    const AdvantageChip = ({ value }) => (
        <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${
            value > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {value > 0 ? `+${value}%` : `${value}%`}
        </span>
    );

    return (
        <GlassCard theme={theme} className="px-6 py-4 space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 pb-2 text-sm font-semibold border-b" style={{ borderColor: theme.colors.border }}>
                <div style={{ color: theme.colors.textSecondary }}>Series</div>
                <div className="text-right" style={{ color: theme.colors.textSecondary }}>Laminate</div>
                <div className="text-right" style={{ color: theme.colors.textSecondary }}>Adv.</div>
            </div>

            {/* JSI Row (highlighted) */}
            <div className="grid grid-cols-3 gap-4 py-3 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                <div className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    {jsiProduct.name}
                </div>
                <div className="font-bold text-lg text-right" style={{ color: theme.colors.textPrimary }}>
                    ${jsiProduct.price?.toLocaleString() || 'TBD'}
                </div>
                <div />
            </div>

            {/* Competitor Rows */}
            {categoryData.competition.map(competitor => (
                <div key={competitor.id} className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="font-medium" style={{ color: theme.colors.textSecondary }}>
                        {competitor.name}
                    </div>
                    <div className="font-medium text-right" style={{ color: theme.colors.textSecondary }}>
                        {competitor.laminate}
                    </div>
                    <div className="text-right">
                        <AdvantageChip value={parseInt(competitor.adv?.replace(/[^-\d]/g, '') || 0)} />
                    </div>
                </div>
            ))}
        </GlassCard>
    );
});

CompetitiveMetrics.displayName = 'CompetitiveMetrics';

// Error boundary component
const ErrorState = React.memo(({ 
    title = "Not Found", 
    message = "The requested item does not exist.", 
    onBack, 
    theme 
}) => (
    <div className="p-4">
        <PageTitle title={title} theme={theme} onBack={onBack} />
        <GlassCard theme={theme} className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} />
            <p style={{ color: theme.colors.textPrimary }}>{message}</p>
        </GlassCard>
    </div>
));

ErrorState.displayName = 'ErrorState';

// Main product comparison screen - enhanced to match reference design
export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
    const categoryData = Data.PRODUCT_DATA?.[categoryId];
    const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);

    // Memoized handlers
    const handleProductSelect = useCallback((product) => {
        setActiveProduct(product);
    }, []);

    const handleBackToProducts = useCallback(() => {
        onNavigate('products');
    }, [onNavigate]);

    // Early return for invalid data
    if (!categoryData) {
        return (
            <ErrorState
                title="Category Not Found"
                message="The requested product category does not exist."
                onBack={handleBackToProducts}
                theme={theme}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <PageTitle title={categoryData.name} theme={theme} onBack={handleBackToProducts} />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-4">
                    <ProductTabs
                        products={categoryData.products}
                        activeProduct={activeProduct}
                        onProductSelect={handleProductSelect}
                        theme={theme}
                    />

                    <ProductHero
                        product={activeProduct}
                        categoryData={categoryData}
                        theme={theme}
                        categoryId={categoryId}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
        </div>
    );
};

// Enhanced competitive analysis screen to match reference design
export const CompetitiveAnalysisScreen = ({ categoryId, onNavigate, theme }) => {
    const categoryData = Data.PRODUCT_DATA?.[categoryId];
    const [activeProduct, setActiveProduct] = useState(categoryData?.products?.[0]);

    // Memoized handlers
    const handleProductSelect = useCallback((product) => {
        setActiveProduct(product);
    }, []);

    const handleBackToCategory = useCallback(() => {
        onNavigate(`products/category/${categoryId}`);
    }, [categoryId, onNavigate]);

    // Early return for invalid data
    if (!categoryData) {
        return (
            <ErrorState
                title="No Competition Data"
                message="No competitive analysis data available for this category."
                onBack={handleBackToCategory}
                theme={theme}
            />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <PageTitle 
                title={`${categoryData.name} Analysis`} 
                theme={theme} 
                onBack={handleBackToCategory} 
            />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-4 space-y-4">
                    <ProductTabs
                        products={categoryData.products}
                        activeProduct={activeProduct}
                        onProductSelect={handleProductSelect}
                        theme={theme}
                    />

                    {/* Large product image */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
                        <img 
                            src={activeProduct.image} 
                            alt={activeProduct.name} 
                            loading="lazy"
                            className="absolute w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>

                    <CompetitiveMetrics
                        jsiProduct={activeProduct}
                        categoryData={categoryData}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
};

// Cart item component for better organization
const CartItem = React.memo(({ 
    item, 
    onUpdateCart, 
    theme,
    isLast = false 
}) => {
    const handleDecrease = useCallback(() => {
        onUpdateCart(item, -1);
    }, [item, onUpdateCart]);

    const handleIncrease = useCallback(() => {
        onUpdateCart(item, 1);
    }, [item, onUpdateCart]);

    return (
        <>
            {!isLast && (
                <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />
            )}
            <div className="flex items-center space-x-4 p-2">
                <div 
                    className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center" 
                    style={{ 
                        backgroundColor: item.isSet ? theme.colors.subtle : item.color, 
                        border: `1px solid ${theme.colors.border}` 
                    }}
                >
                    {item.isSet && (
                        <Package className="w-8 h-8" style={{ color: theme.colors.secondary }} />
                    )}
                    {item.image && !item.isSet && (
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-md" 
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                        {item.name}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleDecrease} 
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        {item.quantity === 1 ? (
                            <Trash2 className="w-5 h-5 text-red-500" />
                        ) : (
                            <Minus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        )}
                    </button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                        onClick={handleIncrease} 
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <Plus className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>
            </div>
        </>
    );
});

CartItem.displayName = 'CartItem';

// Success state for cart submission
const CartSuccess = React.memo(({ theme }) => (
    <div className="flex flex-col items-center justify-center h-full">
        <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 mb-4" style={{ color: theme.colors.accent }} />
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
                Ordered!
            </h2>
        </GlassCard>
    </div>
));

CartSuccess.displayName = 'CartSuccess';

// Cart screen with improved organization
export const CartScreen = ({ 
    theme, 
    onNavigate, 
    cart, 
    setCart, 
    onUpdateCart, 
    userSettings, 
    dealerDirectory 
}) => {
    const [address, setAddress] = useState(userSettings?.homeAddress || '');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Memoized cart processing
    const cartItems = useMemo(() => {
        if (!Data.SAMPLE_PRODUCTS || !Data.SAMPLE_CATEGORIES) return [];
        
        return Object.entries(cart).map(([id, quantity]) => {
            if (id === 'full-jsi-set') {
                return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
            }
            
            if (id.startsWith('set-')) {
                const categoryId = id.replace('set-', '');
                const categoryName = Data.SAMPLE_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
                return { id, name: `Complete ${categoryName} Set`, quantity, isSet: true };
            }
            
            const product = Data.SAMPLE_PRODUCTS.find(p => String(p.id) === id);
            return product ? { ...product, quantity, isSet: false } : null;
        }).filter(Boolean);
    }, [cart]);

    const totalCartItems = useMemo(() => 
        Object.values(cart).reduce((sum, qty) => sum + qty, 0), 
        [cart]
    );

    // Handlers
    const handleSelectAddress = useCallback((selectedAddress) => {
        setAddress(selectedAddress);
        setShowAddressModal(false);
    }, []);

    const handleSubmit = useCallback(() => {
        setIsSubmitted(true);
        setTimeout(() => {
            setCart({});
            onNavigate('home');
        }, 1200);
    }, [setCart, onNavigate]);

    const handleUseHomeAddress = useCallback(() => {
        setAddress(userSettings?.homeAddress || '');
    }, [userSettings?.homeAddress]);

    const handleShowAddressModal = useCallback(() => {
        setShowAddressModal(true);
    }, []);

    const handleCloseAddressModal = useCallback(() => {
        setShowAddressModal(false);
    }, []);

    const handleBackToSamples = useCallback(() => {
        onNavigate('samples');
    }, [onNavigate]);

    if (isSubmitted) {
        return <CartSuccess theme={theme} />;
    }

    return (
        <>
            <div className="flex flex-col h-full">
                {/* This spacer pushes content below the main AppHeader */}
                <div className="h-6" />
                
                <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                    <GlassCard theme={theme} className="p-2">
                        <h3 className="font-bold text-xl px-2 pt-2" style={{ color: theme.colors.textPrimary }}>
                            Selected Samples
                        </h3>
                        {cartItems.length > 0 ? (
                            <div className="mt-2">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateCart={onUpdateCart}
                                        theme={theme}
                                        isLast={index === 0}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                                Your cart is empty.
                            </p>
                        )}
                    </GlassCard>
                </div>

                <div 
                    className="px-4 space-y-3 pt-3 pb-4 border-t" 
                    style={{ 
                        backgroundColor: theme.colors.background, 
                        borderColor: theme.colors.border 
                    }}
                >
                    <GlassCard theme={theme} className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold px-1" style={{ color: theme.colors.textPrimary }}>
                                Ship To
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={handleShowAddressModal}
                                    className="flex items-center space-x-1.5 text-sm font-semibold p-2 rounded-lg hover:bg-black/5"
                                >
                                    <Users className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Directory</span>
                                </button>
                                <button 
                                    onClick={handleUseHomeAddress}
                                    className="flex items-center space-x-1.5 text-sm font-semibold p-2 rounded-lg hover:bg-black/5"
                                >
                                    <Home className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                                    <span>Use Home</span>
                                </button>
                            </div>
                        </div>
                        <textarea 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            rows="3" 
                            placeholder="Enter shipping address..." 
                            className="w-full p-2 border rounded-lg" 
                            style={{ 
                                backgroundColor: theme.colors.subtle, 
                                borderColor: theme.colors.border, 
                                color: theme.colors.textPrimary, 
                                resize: 'none' 
                            }}
                        />
                    </GlassCard>
                    
                    <button 
                        onClick={handleSubmit} 
                        disabled={Object.keys(cart).length === 0 || !(address || '').trim()} 
                        className="w-full font-bold py-3.5 px-6 rounded-full transition-colors disabled:opacity-50" 
                        style={{ 
                            backgroundColor: theme.colors.accent, 
                            color: '#FFFFFF' 
                        }}
                    >
                        Submit Order ({totalCartItems} Items)
                    </button>
                </div>
            </div>
            
            <AddressBookModal 
                show={showAddressModal} 
                onClose={handleCloseAddressModal} 
                addresses={dealerDirectory} 
                onSelectAddress={handleSelectAddress} 
                theme={theme} 
            />
        </>
    );
};

// Resource detail screen placeholder
export const ResourceDetailScreen = ({ theme, currentScreen }) => (
    <div className="p-4">
        <PageTitle title="Resource Detail" theme={theme} />
        <GlassCard theme={theme} className="p-8 text-center">
            <p style={{ color: theme.colors.textPrimary }}>
                Resource details for {currentScreen} coming soon.
            </p>
        </GlassCard>
    </div>
);

// Other utility screens
export const FeedbackScreen = ({ theme, setSuccessMessage, onNavigate }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        let attachmentBase64 = null;
        if (attachment) {
            try {
                attachmentBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(attachment);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = error => reject(error);
                });
            } catch (fileReadError) {
                console.error('Error reading file:', fileReadError);
                setSuccessMessage("Error reading attachment. Please try again.");
                setLoading(false);
                setTimeout(() => setSuccessMessage(""), 3000);
                return;
            }
        }

        const payload = {
            Subject: subject,
            Message: message,
            AttachmentContent: attachmentBase64,
            AttachmentFileName: attachment ? attachment.name : null
        };

        const powerAutomateUrl = import.meta.env.VITE_FEEDBACK_POWER_AUTOMATE_URL;

        if (!powerAutomateUrl) {
            console.error("Configuration Error: VITE_FEEDBACK_POWER_AUTOMATE_URL is not defined.");
            setSuccessMessage("Configuration error. Please contact support.");
            setLoading(false);
            setTimeout(() => setSuccessMessage(""), 3000);
            return;
        }

        try {
            const response = await fetch(powerAutomateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSuccessMessage("Feedback Submitted!");
                setSubject('');
                setMessage('');
                setAttachment(null);
                setTimeout(() => {
                    setSuccessMessage("");
                    onNavigate('home');
                }, 1200);
            } else {
                const errorText = await response.text();
                console.error('Error submitting feedback:', response.status, response.statusText, errorText);
                setSuccessMessage("Failed to submit feedback. Please try again.");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Network error submitting feedback:', error);
            setSuccessMessage("Network error. Please check your connection.");
            setTimeout(() => setSuccessMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageTitle title="Feedback" theme={theme} onBack={() => onNavigate('home')} showBack={false}/>
            <div className="px-4 pb-4 space-y-4">
                <FormInput
                    label="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Feature Request"
                    theme={theme}
                    required
                />
                <FormInput
                    label="Message"
                    type="textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Your detailed feedback..."
                    theme={theme}
                    required
                />
                <div>
                    <label className="text-sm font-medium px-1 mb-1" style={{ color: theme.colors.textSecondary }}>Photos</label>
                    <div className="mt-1 p-3 rounded-2xl min-h-[100px] flex flex-wrap gap-3" style={{ backgroundColor: theme.colors.subtle }}>
                        {attachment && (
                            <div className="relative w-20 h-20">
                                <img src={URL.createObjectURL(attachment)} alt="attachment-preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button onClick={() => setAttachment(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                        <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Add Photo</span>
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                <button
                    className="w-full font-bold py-3 px-6 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}
                    onClick={handleSubmit}
                    disabled={loading || !subject.trim() || !message.trim()}
                >
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </div>
        </>
    );
};

export const HelpScreen = ({ theme }) => {
    const helpSections = [
        {
            title: "Getting Started",
            icon: BookOpen,
            items: [
                "How to navigate the app",
                "Setting up your profile",
                "Understanding the dashboard"
            ]
        },
        {
            title: "Orders",
            icon: Package,
            items: [
                "Viewing order status",
                "Tracking shipments",
                "Order history"
            ]
        },
        {
            title: "Samples",
            icon: Star,
            items: [
                "Requesting samples",
                "Managing your cart",
                "Sample shipping options"
            ]
        },
        {
            title: "Projects",
            icon: Target,
            items: [
                "Creating new leads",
                "Managing project pipeline",
                "Adding project photos"
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4">
                    <div className="space-y-4">
                        {helpSections.map((section, index) => (
                            <div key={index} className="border rounded-lg p-4" style={{ borderColor: theme.colors.border }}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <section.icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                                    <h3 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                                        {section.title}
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {section.items.map((item, itemIndex) => (
                                        <button 
                                            key={itemIndex}
                                            className="w-full text-left p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                                {item}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                        <div className="flex items-center space-x-3 mb-2">
                            <MessageSquare className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                Need More Help?
                            </h3>
                        </div>
                        <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
                            Contact our support team for personalized assistance.
                        </p>
                        <div className="flex space-x-2">
                            <button 
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                            >
                                <Mail className="w-4 h-4" />
                                <span>Email Support</span>
                            </button>
                            <button 
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                style={{ 
                                    backgroundColor: theme.colors.surface, 
                                    color: theme.colors.textPrimary, 
                                    border: `1px solid ${theme.colors.border}` 
                                }}
                            >
                                <Phone className="w-4 h-4" />
                                <span>Call Support</span>
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export const LogoutScreen = ({ theme, onNavigate }) => {
    const handleLogout = () => {
        // In a real app, this would clear authentication tokens, etc.
        alert("Logout functionality would be implemented here.");
        onNavigate('home');
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 scrollbar-hide">
                <GlassCard theme={theme} className="p-6 text-center">
                    <div className="mb-6">
                        <LogOut className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.accent }} />
                        <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                            Log Out
                        </h1>
                        <p className="text-base" style={{ color: theme.colors.textSecondary }}>
                            Are you sure you want to log out of your account?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 px-6 rounded-full font-semibold transition-colors"
                            style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                        >
                            Yes, Log Out
                        </button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="w-full py-3 px-6 rounded-full font-semibold transition-colors"
                            style={{ 
                                backgroundColor: theme.colors.surface, 
                                color: theme.colors.textPrimary, 
                                border: `1px solid ${theme.colors.border}` 
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, theme }) => {
    const statusStyles = useMemo(() => {
        switch (status) {
            case 'Approved':
                return {
                    backgroundColor: theme.colors.accent + '20',
                    color: theme.colors.accent,
                    borderColor: theme.colors.accent + '80'
                };
            case 'Pending':
                return {
                    backgroundColor: '#FFD699' + '20',
                    color: '#FFD699',
                    borderColor: '#FFD699' + '80'
                };
            case 'Rejected':
                return {
                    backgroundColor: '#FF6B6B' + '20',
                    color: '#FF6B6B',
                    borderColor: '#FF6B6B' + '80'
                };
            default:
                return {
                    backgroundColor: theme.colors.subtle,
                    color: theme.colors.textSecondary,
                    borderColor: theme.colors.border
                };
        }
    }, [status, theme]);

    return (
        <span
            className="px-3 py-1 text-sm font-semibold rounded-full border"
            style={statusStyles}
        >
            {status}
        </span>
    );
};

export const ReplacementsScreen = ({ theme, onNavigate, setSuccessMessage }) => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [requests, setRequests] = useState(Data.REPLACEMENT_REQUESTS_DATA);
    const [formData, setFormData] = useState({ so: '', lineItem: '', notes: '' });
    const [attachments, setAttachments] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    const handleShowForm = (isScan = false) => {
        if (isScan) {
            setIsScanning(true);
            setTimeout(() => {
                setFormData({ so: 'SO-450080', lineItem: '001', notes: '' });
                setIsScanning(false);
                setView('form');
            }, 1500);
        } else {
            setFormData({ so: '', lineItem: '', notes: '' });
            setView('form');
        }
    };

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    }, []);

    const handleFileChange = e => e.target.files && setAttachments(p => [...p, ...Array.from(e.target.files)]);
    const removeAttachment = photoIndex => setAttachments(p => p.filter((_, idx) => idx !== photoIndex));

    const handleSubmit = () => {
        const newRequest = {
            id: `req${requests.length + 1}`,
            product: `SO: ${formData.so}, Line: ${formData.lineItem}`,
            reason: formData.notes,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
        };
        setRequests(prev => [newRequest, ...prev]);
        setSuccessMessage("Replacement Request Submitted!");
        setView('list');
        setTimeout(() => {
            setSuccessMessage("");
        }, 2200);
    };

    if (view === 'form') {
        return (
            <div className="flex flex-col h-full">
                 <PageTitle title="New Replacement" theme={theme} onBack={() => setView('list')} showBack={false} />
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <GlassCard theme={theme} className="p-4">
                        <div className="space-y-4">
                            <FormInput label="Sales Order" name="so" value={formData.so} onChange={handleFormChange} theme={theme} />
                            <FormInput label="Line Item" name="lineItem" value={formData.lineItem} onChange={handleFormChange} theme={theme} />
                            <FormInput type="textarea" label="Notes" name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Describe the issue or parts needed..." theme={theme} />

                            <div>
                                <label className="text-sm font-medium px-1 mb-1" style={{ color: theme.colors.textSecondary }}>Photos</label>
                                <div className="mt-1 p-3 rounded-2xl min-h-[100px] flex flex-wrap gap-3" style={{ backgroundColor: theme.colors.subtle }}>
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="relative w-20 h-20">
                                            <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                            <button onClick={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => fileInputRef.current.click()} className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
                                        <ImageIcon className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Add Photo</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button 
                                    onClick={() => setView('list')} 
                                    className="flex-1 font-semibold py-3 px-6 rounded-full transition-colors"
                                    style={{ 
                                        backgroundColor: theme.colors.subtle, 
                                        color: theme.colors.textPrimary 
                                    }}
                                >
                                    Back to Requests
                                </button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={!formData.so || !formData.lineItem}
                                    className="flex-1 font-bold py-3 px-6 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                                    style={{ backgroundColor: theme.colors.accent }}
                                >
                                    Submit Replacement
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full pt-6">
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                <GlassCard theme={theme} className="p-4">
                    <div className="text-center space-y-4">
                        <button onClick={() => handleShowForm(true)} disabled={isScanning} className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: theme.colors.accent, color: theme.colors.accent }}>
                            <Camera className={`w-12 h-12 mb-2 ${isScanning ? 'animate-pulse' : ''}`} />
                            <span className="font-semibold">{isScanning ? 'Scanning...' : 'Scan QR Code'}</span>
                        </button>
                        <div className="flex items-center my-4">
                            <div className="flex-grow border-t" style={{ borderColor: theme.colors.border }} />
                            <span className="mx-4 text-xs uppercase" style={{ color: theme.colors.textSecondary }}>Or</span>
                            <div className="flex-grow border-t" style={{ borderColor: theme.colors.border }} />
                        </div>
                        <button onClick={() => handleShowForm(false)} className="font-semibold py-2 px-4 hover:underline transition-colors" style={{ color: theme.colors.accent }}>
                            Enter Details Manually
                        </button>
                    </div>
                </GlassCard>

                <div>
                    <h2 className="text-xl font-bold px-2 pb-2" style={{ color: theme.colors.textPrimary }}>
                        Previous Requests
                    </h2>
                    <GlassCard theme={theme} className="p-2 space-y-2">
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{request.product}</p>
                                    <p className="text-sm flex items-center space-x-2" style={{ color: theme.colors.textSecondary }}>
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(request.date).toLocaleDateString()}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <StatusBadge status={request.status} theme={theme} />
                                    <ChevronRight className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                </div>
                            </div>
                        ))}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export const CreateContentModal = ({ close, theme, onAdd }) => {
    const [type, setType] = useState(null);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [optA, setOptA] = useState('');
    const [optB, setOptB] = useState('');
    const [optC, setOptC] = useState('');
    const [optD, setOptD] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = () => {
        if (type === 'post') {
            if (!text.trim()) {
                alert('Please enter some text for your post.');
                return;
            }
            const newPost = {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                timeAgo: 'just now',
                text: text.trim(),
                image: file ? URL.createObjectURL(file) : null,
                likes: 0,
                comments: [],
            };
            onAdd('post', newPost);
        }
        
        if (type === 'poll') {
            if (!question.trim() || !optA.trim() || !optB.trim()) {
                alert('Please fill out the question and at least two options.');
                return;
            }
            const options = [
                { id: 'a', text: optA.trim(), votes: 0 },
                { id: 'b', text: optB.trim(), votes: 0 },
            ];
            if (optC.trim()) options.push({ id: 'c', text: optC.trim(), votes: 0 });
            if (optD.trim()) options.push({ id: 'd', text: optD.trim(), votes: 0 });

            const newPoll = {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                timeAgo: 'just now',
                question: question.trim(),
                options,
            };
            onAdd('poll', newPoll);
        }
        
        // Reset form and close
        setText('');
        setFile(null);
        setQuestion('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        close();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const OptionButton = ({ icon: Icon, title, description, onClick }) => (
        <button 
            onClick={onClick} 
            className="w-full text-left p-4 rounded-2xl flex items-center space-x-4 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96]" 
            style={{ backgroundColor: theme.colors.subtle }}
        >
            <div className="p-3 rounded-full" style={{ backgroundColor: theme.colors.surface }}>
                <Icon className="w-6 h-6" style={{ color: theme.colors.accent }} />
            </div>
            <div>
                <p className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{title}</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{description}</p>
            </div>
        </button>
    );

    const renderForm = () => {
        switch (type) {
            case 'post':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 pb-2">
                            <MessageSquare className="w-6 h-6" style={{ color: theme.colors.accent }} />
                            <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>New Post</h3>
                        </div>
                        
                        <FormInput 
                            type="textarea" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder="Share an update, ask a question, or start a discussion..." 
                            theme={theme}
                            rows={4}
                        />
                        
                        {/* File Upload Section */}
                        <div className="space-y-3">
                            {file && (
                                <div className="relative inline-block">
                                    <div className="p-3 rounded-lg border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                        <div className="flex items-center space-x-3">
                                            <ImageIcon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                                            <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                                {file.name}
                                            </span>
                                            <button 
                                                onClick={removeFile}
                                                className="ml-auto p-1 rounded-full hover:bg-red-100 transition-colors"
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-black/5"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                <ImageIcon className="w-4 h-4" />
                                <span className="font-medium">{file ? 'Change Photo' : 'Add Photo'}</span>
                            </button>
                            
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*,video/*" 
                                hidden 
                                onChange={handleFileChange} 
                            />
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                            <button 
                                onClick={() => setType(null)} 
                                className="flex-1 font-semibold py-3 px-6 rounded-full transition-colors"
                                style={{ 
                                    backgroundColor: theme.colors.subtle, 
                                    color: theme.colors.textPrimary 
                                }}
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={!text.trim()}
                                className="flex-1 font-bold py-3 px-6 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                );
                
            case 'poll':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 pb-2">
                            <BarChart3 className="w-6 h-6" style={{ color: theme.colors.accent }} />
                            <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>Create Poll</h3>
                        </div>
                        
                        <FormInput 
                            value={question} 
                            onChange={(e) => setQuestion(e.target.value)} 
                            placeholder="What's your question?" 
                            theme={theme} 
                        />
                        
                        <div className="space-y-3">
                            <FormInput 
                                value={optA} 
                                onChange={(e) => setOptA(e.target.value)} 
                                placeholder="Option A" 
                                theme={theme} 
                            />
                            <FormInput 
                                value={optB} 
                                onChange={(e) => setOptB(e.target.value)} 
                                placeholder="Option B" 
                                theme={theme} 
                            />
                            <FormInput 
                                value={optC} 
                                onChange={(e) => setOptC(e.target.value)} 
                                placeholder="Option C (Optional)" 
                                theme={theme} 
                            />
                            <FormInput 
                                value={optD} 
                                onChange={(e) => setOptD(e.target.value)} 
                                placeholder="Option D (Optional)" 
                                theme={theme} 
                            />
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                            <button 
                                onClick={() => setType(null)} 
                                className="flex-1 font-semibold py-3 px-6 rounded-full transition-colors"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={!question.trim() || !optA.trim() || !optB.trim()}
                                className="flex-1 font-bold py-3 px-6 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                                style={{ backgroundColor: theme.colors.accent }}
                            >
                                Post Poll
                            </button>
                        </div>
                    </div>
                );
                
            default:
                return (
                    <div className="space-y-4">
                        <div className="text-center pb-2">
                            <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
                                Create Content
                            </h3>
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                Choose what you'd like to share with the community
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <OptionButton 
                                icon={MessageSquare} 
                                title="Post" 
                                description="Share an update, photo, or start a discussion" 
                                onClick={() => setType('post')} 
                            />
                            <OptionButton 
                                icon={BarChart3} 
                                title="Poll" 
                                description="Ask a question and get community feedback" 
                                onClick={() => setType('poll')} 
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <Modal show={true} onClose={close} title="" theme={theme}>
            <div className="p-4">
                {renderForm()}
            </div>
        </Modal>
    );
};

export const SettingsScreen = ({ theme, userSettings, onUpdateUserSettings, onNavigate }) => {
    const [localSettings, setLocalSettings] = useState(userSettings || {});
    const [isDirty, setIsDirty] = useState(false);

    const handleSettingChange = useCallback((key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const handleSave = useCallback(() => {
        onUpdateUserSettings(localSettings);
        setIsDirty(false);
        alert('Settings saved successfully!');
    }, [localSettings, onUpdateUserSettings]);

    const handleReset = useCallback(() => {
        setLocalSettings(userSettings || {});
        setIsDirty(false);
    }, [userSettings]);

    const settingsSections = [
        {
            title: "Account",
            icon: User,
            settings: [
                {
                    key: "firstName",
                    label: "First Name",
                    type: "text",
                    value: localSettings.firstName || "",
                    placeholder: "Enter your first name"
                },
                {
                    key: "lastName", 
                    label: "Last Name",
                    type: "text",
                    value: localSettings.lastName || "",
                    placeholder: "Enter your last name"
                },
                {
                    key: "email",
                    label: "Email",
                    type: "email",
                    value: localSettings.email || "",
                    placeholder: "Enter your email"
                }
            ]
        },
        {
            title: "Notifications",
            icon: Bell,
            settings: [
                {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    type: "toggle",
                    value: localSettings.emailNotifications ?? true,
                    description: "Receive email updates about orders and activities"
                },
                {
                    key: "pushNotifications",
                    label: "Push Notifications", 
                    type: "toggle",
                    value: localSettings.pushNotifications ?? true,
                    description: "Receive push notifications on your device"
                }
            ]
        },
        {
            title: "Privacy",
            icon: Shield,
            settings: [
                {
                    key: "profileVisibility",
                    label: "Profile Visibility",
                    type: "select",
                    value: localSettings.profileVisibility || "public",
                    options: [
                        { value: "public", label: "Public" },
                        { value: "private", label: "Private" },
                        { value: "contacts", label: "Contacts Only" }
                    ]
                }
            ]
        },
        {
            title: "Preferences",
            icon: Palette,
            settings: [
                {
                    key: "theme",
                    label: "App Theme",
                    type: "select", 
                    value: localSettings.theme || "auto",
                    options: [
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                        { value: "auto", label: "Auto" }
                    ]
                },
                {
                    key: "language",
                    label: "Language",
                    type: "select",
                    value: localSettings.language || "en",
                    options: [
                        { value: "en", label: "English" },
                        { value: "es", label: "Spanish" },
                        { value: "fr", label: "French" }
                    ]
                }
            ]
        }
    ];

    const renderSetting = (setting) => {
        switch (setting.type) {
            case 'text':
            case 'email':
                return (
                    <FormInput
                        label={setting.label}
                        type={setting.type}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.placeholder}
                        theme={theme}
                    />
                );
            case 'toggle':
                return (
                    <PermissionToggle
                        label={setting.label}
                        isEnabled={setting.value}
                        onToggle={() => handleSettingChange(setting.key, !setting.value)}
                        theme={theme}
                    />
                );
            case 'select':
                return (
                    <CustomSelect
                        label={setting.label}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        options={setting.options}
                        theme={theme}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="Settings" theme={theme} onBack={() => onNavigate('home')} showBack={false} />
            
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide">
                {settingsSections.map((section, index) => (
                    <GlassCard key={index} theme={theme} className="p-4">
                        <div className="flex items-center space-x-3 mb-4 pb-2 border-b" style={{ borderColor: theme.colors.border }}>
                            <section.icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                            <h2 className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                                {section.title}
                            </h2>
                        </div>
                        
                        <div className="space-y-4">
                            {section.settings.map((setting, settingIndex) => (
                                <div key={settingIndex}>
                                    {renderSetting(setting)}
                                    {setting.description && (
                                        <p className="text-xs mt-1 px-1" style={{ color: theme.colors.textSecondary }}>
                                            {setting.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                ))}

                {/* Save/Reset buttons */}
                {isDirty && (
                    <div className="sticky bottom-4 pt-4">
                        <GlassCard theme={theme} className="p-4">
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3 px-6 rounded-full font-semibold transition-colors"
                                    style={{ 
                                        backgroundColor: theme.colors.subtle, 
                                        color: theme.colors.textPrimary 
                                    }}
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 px-6 rounded-full font-bold text-white transition-colors"
                                    style={{ backgroundColor: theme.colors.accent }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};