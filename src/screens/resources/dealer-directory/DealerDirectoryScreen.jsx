import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { FormInput, PortalNativeSelect } from '../../../components/common/FormComponents.jsx';
import { PillButton, PrimaryButton, SecondaryButton } from '../../../components/common/JSIButtons.jsx';
import { Filter, MoreVertical, UserPlus, CheckCircle, Trash2, Plus } from 'lucide-react';
import { DEALER_DIRECTORY_DATA, ROLE_OPTIONS, DAILY_DISCOUNT_OPTIONS } from './data.js';

export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
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

    useEffect(() => { setLocalDealers(dealers); }, [dealers]);
    useEffect(() => { const handleClickOutside = (e) => { if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);

    const sortedAndFilteredDealers = useMemo(() => localDealers
        .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.address && d.address.toLowerCase().includes(searchTerm.toLowerCase())))
        .sort((a, b) => sortConfig.key === 'name' ? a.name.localeCompare(b.name) : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0)), [localDealers, searchTerm, sortConfig]);

    const confirmDiscountChange = () => { if (!pendingDiscountChange) return; const { dealerId, newDiscount } = pendingDiscountChange; setLocalDealers(curr => curr.map(d => d.id === dealerId ? { ...d, dailyDiscount: newDiscount } : d)); setSelectedDealer(prev => prev && prev.id === dealerId ? { ...prev, dailyDiscount: newDiscount } : prev); setPendingDiscountChange(null); if (setSuccessMessage) { setSuccessMessage('Saved!'); setTimeout(() => setSuccessMessage(''), 1000); } };
    const handleSort = (key) => { setSortConfig({ key }); setShowFilterMenu(false); };

    const handleAddPerson = (e) => { e.preventDefault(); if (!selectedDealer) return; const { firstName, lastName, email, role } = newPerson; if (!firstName || !lastName || !email) return; const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' }; const targetRoleKey = roleKeyMap[role] || 'salespeople'; const person = { name: `${firstName} ${lastName}`, email: email, status: 'pending', roleLabel: role }; const updatedDealer = { ...selectedDealer, [targetRoleKey]: [...(selectedDealer[targetRoleKey] || []), person] }; setLocalDealers(curr => curr.map(d => d.id === selectedDealer.id ? updatedDealer : d)); setSelectedDealer(updatedDealer); setShowAddPersonModal(false); setNewPerson({ firstName: '', lastName: '', email: '', role: 'Sales' }); if (setSuccessMessage) { setSuccessMessage(`Invitation sent to ${email}`); setTimeout(() => setSuccessMessage(''), 2000); } };

    const handleUpdatePersonRole = useCallback((personToUpdate, newRoleLabel) => { if (!selectedDealer) return; const roleKeyMap = { 'Administrator': 'administration', 'Admin/Sales Support': 'administration', 'Sales': 'salespeople', 'Designer': 'designers', 'Sales/Designer': 'salespeople', 'Installer': 'installers' }; const newCategoryKey = roleKeyMap[newRoleLabel]; let personFound = false; const tempDealer = JSON.parse(JSON.stringify(selectedDealer)); for (const category of ['salespeople', 'designers', 'administration', 'installers']) { const personIndex = (tempDealer[category] || []).findIndex(p => p.name === personToUpdate.name); if (personIndex > -1) { const person = tempDealer[category][personIndex]; person.roleLabel = newRoleLabel; if (category !== newCategoryKey) { tempDealer[category].splice(personIndex, 1); if (!tempDealer[newCategoryKey]) tempDealer[newCategoryKey] = []; tempDealer[newCategoryKey].push(person); } personFound = true; break; } } if (personFound) { setLocalDealers(prev => prev.map(d => d.id === tempDealer.id ? tempDealer : d)); setSelectedDealer(tempDealer); if (setSuccessMessage) { setSuccessMessage('Role Updated!'); setTimeout(() => setSuccessMessage(''), 1000); } } setMenuState({ open: false, person: null, top: 0, left: 0 }); }, [selectedDealer, setLocalDealers, setSuccessMessage]);

    const handleRemovePerson = useCallback((personName) => { if (!selectedDealer) return; const updatedDealer = { ...selectedDealer }; ['salespeople', 'designers', 'administration', 'installers'].forEach(category => { if (updatedDealer[category]) { updatedDealer[category] = updatedDealer[category].filter(p => p.name !== personName); } }); setLocalDealers(prev => prev.map(d => d.id === updatedDealer.id ? updatedDealer : d)); setSelectedDealer(updatedDealer); setMenuState({ open: false, person: null, top: 0, left: 0 }); if (setSuccessMessage) { setSuccessMessage('Person Removed!'); setTimeout(() => setSuccessMessage(''), 1000); } }, [selectedDealer, setLocalDealers, setSuccessMessage]);

    const handleMenuOpen = (event, person) => { event.stopPropagation(); const button = event.currentTarget; const container = modalContentRef.current; if (!container) return; const buttonRect = button.getBoundingClientRect(); const containerRect = container.getBoundingClientRect(); const top = buttonRect.top - containerRect.top + button.offsetHeight; const left = buttonRect.left - containerRect.left + button.offsetWidth - 224; setMenuState({ open: true, person: person, top, left }); };
    const handleMenuClose = () => setMenuState({ open: false, person: null, top: 0, left: 0 });

    const roleOptions = useMemo(() => ROLE_OPTIONS, []);
    const primarySoft = theme.colors.textPrimary || '#1F1F1F';
    const primaryDisplay = 'hsla(0,0%,12%,0.92)'; // softer main text

    const StaffSection = ({ title, members }) => (
        <div>
            <p className="font-bold text-lg pt-4 pb-2" style={{ color: primarySoft }}>{title}</p>
            {members && members.length > 0 ? (
                <div className="border-t" style={{ borderColor: theme.colors.subtle }}>
                    {members.map(m => (
                        <div key={m.name} className="flex justify-between items-center py-2 px-2 border-b" style={{ borderColor: theme.colors.subtle }}>
                            <div>
                                <p className="font-semibold" style={{ color: primarySoft }}>{m.name}</p>
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
        <div className="flex flex-col h-full app-header-offset">
            {/* Header controls - fixed below app header */}
            <div className="flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
                <div className="flex items-center justify-between pr-4">
                    <PageTitle title="Dealer Directory" theme={theme} />
                    <PillButton onClick={() => onNavigate && onNavigate('new-dealer-signup')} theme={theme} size="compact">
                        <Plus className="w-4 h-4 mr-1" /> Add Dealer
                    </PillButton>
                </div>
                <div className="px-4 pb-3 flex items-center space-x-2">
                    <StandardSearchBar className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or city..." theme={theme} />
                    <div className="relative">
                        <PillButton onClick={() => setShowFilterMenu(f => !f)} theme={theme} size="compact">
                            <Filter className="w-5 h-5" />
                        </PillButton>
                        {showFilterMenu && (
                            <GlassCard ref={filterMenuRef} theme={theme} className="absolute top-14 right-0 z-20 w-48 p-2 space-y-2">
                                <PillButton onClick={() => handleSort('name')} theme={theme} size="compact" isSelected={sortConfig.key === 'name'} className="w-full text-center">
                                    A-Z
                                </PillButton>
                                <PillButton onClick={() => handleSort('sales')} theme={theme} size="compact" isSelected={sortConfig.key === 'sales'} className="w-full text-center">
                                    By Sales
                                </PillButton>
                                <PillButton onClick={() => handleSort('bookings')} theme={theme} size="compact" isSelected={sortConfig.key === 'bookings'} className="w-full text-center">
                                    By Bookings
                                </PillButton>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
                {sortedAndFilteredDealers.map(dealer => (
                    <GlassCard key={dealer.id} theme={theme} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedDealer(dealer); }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-base mb-1 tracking-tight" style={{ color: primaryDisplay }}>{dealer.name}</h3>
                                <p className="text-xs leading-snug" style={{ color: theme.colors.textSecondary }}>{dealer.address}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: theme.colors.textSecondary }}>{sortConfig.key}</p>
                                <p className="font-bold text-sm" style={{ color: primaryDisplay }}>${(dealer[sortConfig.key === 'name' ? 'bookings' : sortConfig.key] || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {sortedAndFilteredDealers.length === 0 && (
                    <GlassCard theme={theme} className="p-8 flex flex-col items-center justify-center text-center gap-2">
                        <p className="text-sm font-medium" style={{ color: primaryDisplay }}>No dealers found.</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Adjust search or add a new dealer.</p>
                    </GlassCard>
                )}
            </div>

            <Modal show={!!selectedDealer} onClose={() => setSelectedDealer(null)} title={selectedDealer?.name || ''} theme={theme}>
                {selectedDealer && (
                    <div ref={modalContentRef} className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{selectedDealer.address}</p>
                            <button onClick={() => setShowAddPersonModal(true)} aria-label="Add person" className="p-2 -mr-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><UserPlus className="w-5 h-5" style={{ color: theme.colors.accent }} /></button>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-lg pt-4 pb-2" style={{ color: primarySoft }}>Daily Discount</p>
                            <PortalNativeSelect label="" theme={theme} value={selectedDealer.dailyDiscount} onChange={e => setPendingDiscountChange({ dealerId: selectedDealer.id, newDiscount: e.target.value })} options={DAILY_DISCOUNT_OPTIONS.map(opt => ({ label: opt, value: opt }))} />
                        </div>
                        <div className="space-y-4">
                            <StaffSection title="Salespeople" members={selectedDealer.salespeople} />
                            <StaffSection title="Designers" members={selectedDealer.designers} />
                            <StaffSection title="Administration" members={selectedDealer.administration} />
                            <StaffSection title="Installers" members={selectedDealer.installers} />
                        </div>
                        {menuState.open && (<><div className="absolute inset-0 z-10 -m-6" onClick={handleMenuClose} /><div className="absolute z-20 animate-fade-in" style={{ top: menuState.top, left: menuState.left }}><GlassCard theme={theme} className="p-1 w-56"><div className="px-2 py-1 text-xs font-bold uppercase" style={{ color: theme.colors.textSecondary }}>Change Role</div>{roleOptions.map(opt => (<button key={opt.value} onClick={() => handleUpdatePersonRole(menuState.person, opt.value)} className="w-full flex justify-between items-center text-left py-2 px-2 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span style={{ color: menuState.person.roleLabel === opt.value ? theme.colors.accent : primarySoft }}>{opt.label}</span>{menuState.person.roleLabel === opt.value && <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accent }} />}</button>))}<div className="border-t my-1 mx-2" style={{ borderColor: theme.colors.subtle }} /><button onClick={() => handleRemovePerson(menuState.person.name)} className="w-full flex items-center text-left py-2 px-2 text-sm font-semibold rounded-lg" style={{ color: '#B85C5C' }}><Trash2 className="w-4 h-4 mr-2" />Remove Person</button></GlassCard></div></>)}
                    </div>
                )}
            </Modal>
            <Modal show={!!pendingDiscountChange} onClose={() => setPendingDiscountChange(null)} title="Confirm Change" theme={theme}>
                <p style={{ color: primarySoft }}>Change daily discount to <span className="font-bold">{pendingDiscountChange?.newDiscount}</span>?</p>
                <div className="flex justify-end gap-3 pt-4">
                    <SecondaryButton onClick={() => setPendingDiscountChange(null)} theme={theme} size="default">
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={confirmDiscountChange} theme={theme} size="default">
                        Save
                    </PrimaryButton>
                </div>
            </Modal>
            <Modal show={showAddPersonModal} onClose={() => setShowAddPersonModal(false)} title="Add New Person" theme={theme}>
                <form onSubmit={handleAddPerson} className="space-y-4">
                    <FormInput label="First Name" value={newPerson.firstName} onChange={e => setNewPerson(p => ({ ...p, firstName: e.target.value }))} theme={theme} required />
                    <FormInput label="Last Name" value={newPerson.lastName} onChange={e => setNewPerson(p => ({ ...p, lastName: e.target.value }))} theme={theme} required />
                    <FormInput label="Email" type="email" value={newPerson.email} onChange={e => setNewPerson(p => ({ ...p, email: e.target.value }))} theme={theme} required />
                    <PortalNativeSelect label="Role" value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} theme={theme} options={roleOptions} />
                    <div className="pt-2 text-center"><p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>Invitation email will be sent.</p><PrimaryButton type="submit" theme={theme} size="default" fullWidth>Send Invite</PrimaryButton></div>
                </form>
            </Modal>
        </div>
    );
};