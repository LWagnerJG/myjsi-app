import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { FormInput, PortalNativeSelect } from '../../components/common/FormComponents.jsx';
import { Search, MapPin, Phone, Mail, Building2, ExternalLink, Filter, MoreVertical, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import * as Data from '../../data.jsx';

export const DealerDirectoryScreen = ({ theme, showAlert, setSuccessMessage, dealerDirectory }) => {
    // Use dealerDirectory prop or fallback to data
    const dealers = dealerDirectory || Data.DEALER_DIRECTORY_DATA || [];
    
    const [localDealers, setLocalDealers] = useState(dealers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name' });
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);
    const [pendingDiscountChange, setPendingDiscountChange] = useState(null);
    const [showAddPersonModal, setShowAddPersonModal] = useState(false);
    const [newPerson, setNewPerson] = useState({ firstName: '', lastName: '', email: '', role: 'Sales' });
    const [menuState, setMenuState] = useState({ open: false, person: null, top: 0, left: 0 });
    const modalContentRef = useRef(null);

    useEffect(() => {
        setLocalDealers(dealers);
    }, [dealers]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedAndFilteredDealers = useMemo(() => {
        return localDealers
            .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))
            .sort((a, b) => {
                if (sortConfig.key === 'name') return a.name.localeCompare(b.name);
                return (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
            });
    }, [localDealers, searchTerm, sortConfig]);

    const confirmDiscountChange = () => {
        if (!pendingDiscountChange) return;
        const { dealerId, newDiscount } = pendingDiscountChange;
        setLocalDealers(curr => curr.map(d => d.id === dealerId ? { ...d, dailyDiscount: newDiscount } : d));
        setSelectedDealer(prev => prev && prev.id === dealerId ? { ...prev, dailyDiscount: newDiscount } : prev);
        setPendingDiscountChange(null);
        if (setSuccessMessage) {
            setSuccessMessage("Saved!");
            setTimeout(() => setSuccessMessage(""), 1000);
        }
    };

    const handleSort = (key) => {
        setSortConfig({ key });
        setShowFilterMenu(false);
    };

    const handleAddPerson = (e) => {
        e.preventDefault();
        if (!selectedDealer) return;
        const { firstName, lastName, email, role } = newPerson;
        if (!firstName || !lastName || !email) return;

        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const targetRoleKey = roleKeyMap[role] || 'salespeople';
        const person = { name: `${firstName} ${lastName}`, email: email, status: 'pending', roleLabel: role };
        const updatedDealer = { ...selectedDealer, [targetRoleKey]: [...(selectedDealer[targetRoleKey] || []), person] };
        setLocalDealers(curr => curr.map(d => d.id === selectedDealer.id ? updatedDealer : d));
        setSelectedDealer(updatedDealer);
        setShowAddPersonModal(false);
        setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' });
        if (setSuccessMessage) {
            setSuccessMessage(`Invitation sent to ${email}`);
            setTimeout(() => setSuccessMessage(""), 2000);
        }
    };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => {
        if (!selectedDealer) return;
        const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' };
        const newCategoryKey = roleKeyMap[newRoleLabel];
        let personFound = false;
        const tempDealer = JSON.parse(JSON.stringify(selectedDealer));

        for (const category of ['salespeople', 'designers', 'administration', 'installers']) {
            const personIndex = (tempDealer[category] || []).findIndex(p => p.name === personToUpdate.name);
            if (personIndex > -1) {
                const person = tempDealer[category][personIndex];
                person.roleLabel = newRoleLabel;
                if (category !== newCategoryKey) {
                    tempDealer[category].splice(personIndex, 1);
                    if (!tempDealer[newCategoryKey]) tempDealer[newCategoryKey] = [];
                    tempDealer[newCategoryKey].push(person);
                }
                personFound = true;
                break;
            }
        }

        if (personFound) {
            setLocalDealers(prev => prev.map(d => d.id === tempDealer.id ? tempDealer : d));
            setSelectedDealer(tempDealer);
            if (setSuccessMessage) {
                setSuccessMessage("Role Updated!");
                setTimeout(() => setSuccessMessage(""), 1000);
            }
        }
        setMenuState({ open: false, person: null, top: 0, left: 0 });
    }, [selectedDealer, setLocalDealers, setSuccessMessage]);

    const handleRemovePerson = useCallback((personName) => {
        if (!selectedDealer) return;
        const updatedDealer = { ...selectedDealer };
        ['salespeople', 'designers', 'administration', 'installers'].forEach(category => {
            if (updatedDealer[category]) {
                updatedDealer[category] = updatedDealer[category].filter(p => p.name !== personName);
            }
        });
        setLocalDealers(prev => prev.map(d => d.id === updatedDealer.id ? updatedDealer : d));
        setSelectedDealer(updatedDealer);
        setMenuState({ open: false, person: null, top: 0, left: 0 });
        if (setSuccessMessage) {
            setSuccessMessage("Person Removed!");
            setTimeout(() => setSuccessMessage(""), 1000);
        }
    }, [selectedDealer, setLocalDealers, setSuccessMessage]);

    const handleMenuOpen = (event, person) => {
        event.stopPropagation();
        const button = event.currentTarget;
        const container = modalContentRef.current;
        if (!container) return;
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const top = buttonRect.top - containerRect.top + button.offsetHeight;
        const left = buttonRect.left - containerRect.left + button.offsetWidth - 224;
        setMenuState({ open: true, person: person, top, left });
    };

    const handleMenuClose = () => setMenuState({ open: false, person: null, top: 0, left: 0 });
    
    const ModalSectionHeader = ({ title }) => <p className="font-bold text-lg pt-4 pb-2" style={{ color: theme.colors.textPrimary }}>{title}</p>;
    
    const roleOptions = useMemo(() => [
        { label: 'Administrator', value: 'Administrator' }, { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
        { label: 'Sales', value: 'Sales' }, { label: 'Designer', value: 'Designer' },
        { label: 'Sales/Designer', value: 'Sales/Designer' }, { label: 'Installer', value: 'Installer' }
    ], []);

    const StaffSection = ({ title, members }) => (
        <div>
            <ModalSectionHeader title={title} />
            {members && members.length > 0 ? (
                <div className="border-t" style={{ borderColor: theme.colors.subtle }}>
                    {members.map(m => (
                        <div key={m.name} className="flex justify-between items-center py-2 px-2 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <div>
                                <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{m.name}</p>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                    {m.status === 'pending' ? <span className="font-semibold text-amber-500">Pending Invitation</span> : m.email}
                                </p>
                            </div>
                            <button onClick={(e) => handleMenuOpen(e, m)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                <MoreVertical className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm px-2 py-1" style={{ color: theme.colors.textSecondary }}>None listed.</p>}
        </div>
    );

    return (
        // FIX: Restructured to a flex column layout to enable a sticky header.
        <div className="flex flex-col h-full">
            {/* This container holds the title and search bar, and will stick to the top. */}
            <div className="sticky top-0 z-10" style={{ backgroundColor: `${theme.colors.background}e6`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                <PageTitle title="Dealer Directory" theme={theme} />
                <div className="px-4 pb-4 flex items-center space-x-2">
                    <SearchInput className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or city..." theme={theme} />
                    <div className="relative">
                        <button onClick={() => setShowFilterMenu(f => !f)} className="p-3.5 rounded-full shadow-lg" style={{ backgroundColor: theme.colors.surface }}>
                            <Filter className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                        </button>
                        {showFilterMenu && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-40 p-2">
                                <button onClick={() => handleSort('name')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'name' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'name' ? theme.colors.subtle : 'transparent' }}> A-Z </button>
                                <button onClick={() => handleSort('sales')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'sales' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'sales' ? theme.colors.subtle : 'transparent' }}> By Sales </button>
                                <button onClick={() => handleSort('bookings')} className={`w-full text-left px-2 py-1.5 text-sm rounded-md ${sortConfig.key === 'bookings' ? 'font-bold' : ''}`} style={{ color: theme.colors.textPrimary, backgroundColor: sortConfig.key === 'bookings' ? theme.colors.subtle : 'transparent' }}> By Bookings </button>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>

            {/* This container holds the list of dealers and will scroll. */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3 pb-4">
                {sortedAndFilteredDealers.map(dealer => (
                    <GlassCard key={dealer.id} theme={theme} className="p-4 cursor-pointer hover:border-gray-400/50" onClick={() => { setSelectedDealer(dealer); }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{dealer.name}</h3>
                                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{dealer.address}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.textSecondary }}>{sortConfig.key}</p>
                                <p className="font-bold" style={{ color: theme.colors.textPrimary }}>${(dealer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key] || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Modals remain unchanged */}
            <Modal show={!!selectedDealer} onClose={() => setSelectedDealer(null)} title={selectedDealer?.name || ''} theme={theme}>
                {selectedDealer && (
                    <div ref={modalContentRef} className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{selectedDealer.address}</p>
                            <button onClick={() => setShowAddPersonModal(true)} className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><UserPlus className="w-5 h-5" style={{ color: theme.colors.accent }} /></button>
                        </div>
                        <div className="space-y-2">
                            <ModalSectionHeader title="Daily Discount" />
                            <PortalNativeSelect label="" theme={theme} value={selectedDealer.dailyDiscount} onChange={e => setPendingDiscountChange({ dealerId: selectedDealer.id, newDiscount: e.target.value })} options={Data.DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))} />
                        </div>
                        <div className="space-y-4">
                            <StaffSection title="Salespeople" members={selectedDealer.salespeople} />
                            <StaffSection title="Designers" members={selectedDealer.designers} />
                            <StaffSection title="Administration" members={selectedDealer.administration} />
                            <StaffSection title="Installers" members={selectedDealer.installers} />
                        </div>
                        {menuState.open && (
                            <>
                                <div className="absolute inset-0 z-10 -m-6" onClick={handleMenuClose} />
                                <div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: menuState.left }}>
                                    <GlassCard theme={theme} className="p-1 w-56">
                                        <div className="px-2 py-1 text-xs font-bold uppercase" style={{ color: theme.colors.textSecondary }}>Change Role</div>
                                        {roleOptions.map(opt => (
                                            <button key={opt.value} onClick={() => handleUpdatePersonRole(menuState.person, opt.value)} className="w-full flex justify-between items-center text-left py-2 px-2 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                                <span style={{ color: menuState.person.roleLabel === opt.value ? theme.colors.accent : theme.colors.textPrimary }}>{opt.label}</span>
                                                {menuState.person.roleLabel === opt.value && <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accent }} />}
                                            </button>
                                        ))}
                                        <div className="border-t my-1 mx-2" style={{ borderColor: theme.colors.subtle }} />
                                        <button onClick={() => handleRemovePerson(menuState.person.name)} className="w-full flex items-center text-left py-2 px-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove Person
                                        </button>
                                    </GlassCard>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}>
                <p style={{ color: theme.colors.textPrimary }}>Are you sure you want to change the daily discount to <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?</p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={() => setPendingDiscountChange(null)} className="font-bold py-2 px-5 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>Cancel</button>
                    <button onClick={confirmDiscountChange} className="font-bold py-2 px-5 rounded-lg text-white" style={{ backgroundColor: theme.colors.accent }}>Save</button>
                </div>
            </Modal>
            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={roleOptions} />
                    <div className="pt-2 text-center">
                        <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>This will send an invitation to the user to join the MyJSI app.</p>
                        <button type="submit" className="w-full font-bold py-3 px-6 rounded-full text-white" style={{ backgroundColor: theme.colors.accent }} > Send Invite </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};