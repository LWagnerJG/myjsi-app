import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { SegmentedToggle } from '../../../components/common/GroupedToggle.jsx';
import { 
    Search, Package, ChevronUp, ChevronDown, Trash2, PlusCircle, CheckCircle, Home,
    ArrowRightLeft, User, Calendar, MessageSquare, Check, X, Bell, Clock, AlertCircle,
    Send, UserCheck, Users
} from 'lucide-react';
import { 
    LOANER_POOL_PRODUCTS, 
    AVAILABILITY_STATUS, 
    STATUS_LABELS, 
    STATUS_COLORS, 
    LOAN_DURATIONS,
    SALES_REPS,
    CURRENT_USER,
    TRANSFER_STATUS,
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_COLORS,
    INITIAL_TRANSFER_REQUESTS,
    INITIAL_NOTIFICATIONS,
    LOAN_EVENT_TYPES
} from './data.js';

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
};

// ============================================
// TRANSFER REQUEST MODAL
// ============================================
const TransferRequestModal = ({ 
    show, 
    onClose, 
    product, 
    theme, 
    myProjects = [],
    onSubmitTransfer 
}) => {
    const [formData, setFormData] = useState({
        desiredStartDate: '',
        desiredEndDate: '',
        projectName: '',
        message: ''
    });
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    const currentHolder = product?.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;

    const filteredProjects = useMemo(() => {
        const q = formData.projectName.trim().toLowerCase();
        if (!q) return (myProjects || []).slice(0, 6);
        return (myProjects || []).filter(p => 
            (p.name || p.projectName || '').toLowerCase().includes(q)
        ).slice(0, 6);
    }, [formData.projectName, myProjects]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.desiredStartDate || !formData.message.trim()) return;
        
        onSubmitTransfer({
            itemId: product.id,
            fromRepId: product.currentHolderRepId,
            toRepId: CURRENT_USER.id,
            ...formData
        });
        
        setFormData({ desiredStartDate: '', desiredEndDate: '', projectName: '', message: '' });
        onClose();
    };

    if (!product) return null;

    return (
        <Modal show={show} onClose={onClose} title="Request Transfer" theme={theme}>
            <div className="space-y-4">
                {/* Item being requested */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: theme.colors.subtle }}>
                    <img src={product.img} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                        <h4 className="font-bold" style={{ color: theme.colors.textPrimary }}>{product.name}</h4>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Model: {product.model}</p>
                    </div>
                </div>

                {/* Current holder info */}
                {currentHolder && (
                    <div className="p-3 rounded-xl border" style={{ borderColor: theme.colors.border }}>
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" style={{ color: theme.colors.accent }} />
                            <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Currently with</span>
                        </div>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{currentHolder.name}</p>
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{currentHolder.region} Region</p>
                        {product.returnDate && (
                            <div className="flex items-center gap-1 mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                                <Calendar className="w-3 h-3" />
                                <span>Expected available: {formatDate(product.returnDate)}</span>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Desired dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                Desired Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.desiredStartDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, desiredStartDate: e.target.value }))}
                                min={product.returnDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                Desired End Date
                            </label>
                            <input
                                type="date"
                                value={formData.desiredEndDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, desiredEndDate: e.target.value }))}
                                min={formData.desiredStartDate || product.returnDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary
                                }}
                            />
                        </div>
                    </div>

                    {/* Project association */}
                    <div className="relative">
                        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                            Associated Project
                        </label>
                        <input
                            value={formData.projectName}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, projectName: e.target.value }));
                                setShowProjectDropdown(true);
                            }}
                            onFocus={() => setShowProjectDropdown(true)}
                            onBlur={() => setTimeout(() => setShowProjectDropdown(false), 200)}
                            placeholder="Search or enter project name..."
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary
                            }}
                        />
                        {showProjectDropdown && filteredProjects.length > 0 && (
                            <div
                                className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-lg shadow-lg"
                                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                            >
                                {filteredProjects.map(p => {
                                    const name = p.name || p.projectName;
                                    return (
                                        <button
                                            type="button"
                                            key={p.id || name}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, projectName: name }));
                                                setShowProjectDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                                            style={{ color: theme.colors.textPrimary }}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                            Message to {currentHolder?.name?.split(' ')[0] || 'rep'} *
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            rows="3"
                            placeholder="Explain why you need this item and any flexibility on dates..."
                            className="w-full px-3 py-2 rounded-lg border text-sm"
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                color: theme.colors.textPrimary,
                                resize: 'none'
                            }}
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!formData.desiredStartDate || !formData.message.trim()}
                        className="w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                    >
                        <Send className="w-4 h-4" />
                        Send Transfer Request
                    </button>
                </form>
            </div>
        </Modal>
    );
};

// ============================================
// INCOMING TRANSFER REQUEST CARD (for approval)
// ============================================
const IncomingTransferCard = ({ request, products, theme, onApprove, onDecline }) => {
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    
    const product = products.find(p => p.id === request.itemId);
    const fromRep = getRepById(request.fromRepId);
    const toRep = getRepById(request.toRepId);

    const isOutgoing = request.fromRepId === CURRENT_USER.id; // I'm requesting from someone

    if (!product) return null;

    return (
        <div 
            className="p-4 rounded-xl border-2"
            style={{ 
                borderColor: request.status === TRANSFER_STATUS.PENDING ? theme.colors.accent : theme.colors.border,
                backgroundColor: theme.colors.surface 
            }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold" style={{ color: theme.colors.textPrimary }}>{product.name}</h4>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{product.model}</p>
                </div>
                <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ 
                        backgroundColor: TRANSFER_STATUS_COLORS[request.status] + '20',
                        color: TRANSFER_STATUS_COLORS[request.status]
                    }}
                >
                    {TRANSFER_STATUS_LABELS[request.status]}
                </span>
            </div>

            {/* Transfer direction */}
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                <div className="flex-1">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>From</p>
                    <p className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                        {fromRep?.id === CURRENT_USER.id ? 'You' : fromRep?.name}
                    </p>
                </div>
                <ArrowRightLeft className="w-4 h-4" style={{ color: theme.colors.accent }} />
                <div className="flex-1 text-right">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>To</p>
                    <p className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                        {toRep?.id === CURRENT_USER.id ? 'You' : toRep?.name}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    <span style={{ color: theme.colors.textSecondary }}>
                        {formatDate(request.desiredStartDate)}
                        {request.desiredEndDate && ` - ${formatDate(request.desiredEndDate)}`}
                    </span>
                </div>
                {request.projectName && (
                    <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                        <span style={{ color: theme.colors.textSecondary }}>{request.projectName}</span>
                    </div>
                )}
                {request.message && (
                    <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 mt-0.5" style={{ color: theme.colors.textSecondary }} />
                        <span style={{ color: theme.colors.textPrimary }}>{request.message}</span>
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <p className="text-xs mb-3" style={{ color: theme.colors.textSecondary }}>
                Requested {formatRelativeTime(request.createdAt)}
            </p>

            {/* Actions for pending incoming requests */}
            {request.status === TRANSFER_STATUS.PENDING && isOutgoing && (
                <div className="space-y-2">
                    {!showDeclineInput ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onApprove(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: '#10B981', color: 'white' }}
                            >
                                <Check className="w-4 h-4" />
                                Approve
                            </button>
                            <button
                                onClick={() => setShowDeclineInput(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: '#B85C5C', color: 'white' }}
                            >
                                <X className="w-4 h-4" />
                                Decline
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Reason for declining (optional)..."
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary
                                }}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        onDecline(request.id, declineReason);
                                        setDeclineReason('');
                                        setShowDeclineInput(false);
                                    }}
                                    className="flex-1 py-2 px-4 rounded-full font-semibold text-sm"
                                    style={{ backgroundColor: '#B85C5C', color: 'white' }}
                                >
                                    Confirm Decline
                                </button>
                                <button
                                    onClick={() => {
                                        setDeclineReason('');
                                        setShowDeclineInput(false);
                                    }}
                                    className="py-2 px-4 rounded-full font-semibold text-sm"
                                    style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Complete handoff button for approved transfers */}
            {request.status === TRANSFER_STATUS.APPROVED && (
                <button
                    onClick={() => onApprove(request.id, true)} // true = complete
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: 'white' }}
                >
                    <UserCheck className="w-4 h-4" />
                    {isOutgoing ? 'Mark as Handed Off' : 'Confirm Received'}
                </button>
            )}

            {/* Show decline reason if declined */}
            {request.status === TRANSFER_STATUS.DECLINED && request.decisionReason && (
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                    <p className="text-sm text-red-700">
                        <span className="font-medium">Reason:</span> {request.decisionReason}
                    </p>
                </div>
            )}
        </div>
    );
};

// ============================================
// TRANSFERS TAB CONTENT
// ============================================
const TransfersTab = ({ transferRequests, products, theme, onApprove, onDecline }) => {
    const [filter, setFilter] = useState('all'); // all, incoming, outgoing

    const filteredRequests = useMemo(() => {
        let filtered = transferRequests;
        if (filter === 'incoming') {
            // Requests where someone wants item from me
            filtered = transferRequests.filter(r => r.fromRepId === CURRENT_USER.id);
        } else if (filter === 'outgoing') {
            // Requests where I want item from someone
            filtered = transferRequests.filter(r => r.toRepId === CURRENT_USER.id);
        }
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [transferRequests, filter]);

    const pendingCount = transferRequests.filter(
        r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
    ).length;

    return (
        <div className="p-4 space-y-4">
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'incoming', label: `Requests for Me ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
                    { key: 'outgoing', label: 'My Requests' }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                        style={{
                            backgroundColor: filter === f.key ? theme.colors.accent : theme.colors.subtle,
                            color: filter === f.key ? 'white' : theme.colors.textPrimary
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Transfer cards */}
            {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                    <p className="font-medium" style={{ color: theme.colors.textSecondary }}>No transfer requests</p>
                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                        Request a transfer when you find an unavailable item you need
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <IncomingTransferCard
                            key={request.id}
                            request={request}
                            products={products}
                            theme={theme}
                            onApprove={onApprove}
                            onDecline={onDecline}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// REQUEST ITEM (in drawer)
// ============================================
const RequestItem = React.memo(({ item, onRemoveFromRequest, theme, isFirst = false }) => (
    <>
        {!isFirst && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
        <div className="flex items-center space-x-3 py-2 px-1">
            <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
            >
                <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>{item.model}</p>
            </div>
            <button
                onClick={() => onRemoveFromRequest(item.id)}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5"
            >
                <Trash2 className="w-3 h-3" style={{ color: '#B85C5C' }} />
            </button>
        </div>
    </>
));
RequestItem.displayName = 'RequestItem';

// ============================================
// REQUEST DRAWER
// ============================================
const RequestDrawer = ({
    requestItems,
    onRemoveFromRequest,
    onSubmitRequest,
    theme,
    userSettings,
    myProjects = [],
    setMyProjects
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [requestForm, setRequestForm] = useState({
        contactName: '',
        email: '',
        phone: '',
        duration: '',
        purpose: '',
        projectName: '',
        address: userSettings?.homeAddress || '',
    });

    const totalRequestItems = requestItems.length;

    const inputRef = useRef(null);
    const filteredProjects = useMemo(() => {
        const q = requestForm.projectName.trim().toLowerCase();
        if (!q) return (myProjects || []).slice(0, 6);
        return (myProjects || []).filter(p => (p.name || p.projectName || '').toLowerCase().includes(q)).slice(0, 6);
    }, [requestForm.projectName, myProjects]);

    const selectProject = useCallback((name) => {
        setRequestForm(prev => ({ ...prev, projectName: name }));
        inputRef.current?.blur();
    }, []);

    const ensureProjectExists = useCallback((nameRaw) => {
        const name = (nameRaw || '').trim();
        if (!name) return null;
        const exists = (myProjects || []).some(p => (p.name || p.projectName || '').toLowerCase() === name.toLowerCase());
        if (exists) return null;

        const newProject = {
            id: `proj_${Date.now()}`,
            name,
            stage: 'Discovery',
            status: 'Open',
            createdAt: Date.now()
        };

        if (typeof setMyProjects === 'function') {
            setMyProjects(prev => [newProject, ...(prev || [])]);
        }

        try {
            window.dispatchEvent(new CustomEvent('myjsi:create-project', { detail: newProject }));
            localStorage.setItem('myjsi:lastNewProject', JSON.stringify(newProject));
        } catch (_) { /* no-op */ }

        return newProject;
    }, [myProjects, setMyProjects]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (
            requestItems.length === 0 ||
            !requestForm.contactName.trim() ||
            !requestForm.email.trim() ||
            !requestForm.phone.trim() ||
            !requestForm.address.trim() ||
            !requestForm.duration.trim()
        ) return;

        ensureProjectExists(requestForm.projectName);
        onSubmitRequest(requestForm);

        setIsExpanded(false);
        setRequestForm({
            contactName: '',
            email: '',
            phone: '',
            duration: '',
            purpose: '',
            projectName: '',
            address: userSettings?.homeAddress || '',
        });
    }, [requestItems.length, requestForm, onSubmitRequest, userSettings?.homeAddress, ensureProjectExists]);

    const handleUseHomeAddress = useCallback(() => {
        setRequestForm(prev => ({ ...prev, address: userSettings?.homeAddress || '' }));
    }, [userSettings?.homeAddress]);

    if (totalRequestItems === 0) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-20 transition-all duration-300"
            style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderTop: `1px solid ${theme.colors.border}`,
                maxHeight: isExpanded ? '92vh' : '88px',
                transform: `translateY(${isExpanded ? '0' : 'calc(100% - 88px)'})`
            }}
        >
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Request ({totalRequestItems})</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {requestItems.length} item{requestItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    ) : (
                        <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <div className="mb-4">
                        {requestItems.map((item, idx) => (
                            <RequestItem
                                key={item.id}
                                item={item}
                                onRemoveFromRequest={onRemoveFromRequest}
                                theme={theme}
                                isFirst={idx === 0}
                            />
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Contact Name"
                                value={requestForm.contactName}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, contactName: e.target.value }))}
                                theme={theme}
                                required
                            />
                            <FormInput
                                label="Email"
                                type="email"
                                value={requestForm.email}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                                theme={theme}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Phone"
                                value={requestForm.phone}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))}
                                theme={theme}
                                required
                            />

                            <div className="relative">
                                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                    Project Name (optional)
                                </label>
                                <input
                                    ref={inputRef}
                                    value={requestForm.projectName}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, projectName: e.target.value }))}
                                    placeholder="Search or create a project…"
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.textPrimary
                                    }}
                                />
                                {filteredProjects.length > 0 && requestForm.projectName && (
                                    <div
                                        className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg shadow"
                                        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                                    >
                                        {filteredProjects.map(p => {
                                            const name = p.name || p.projectName;
                                            return (
                                                <button
                                                    type="button"
                                                    key={p.id || name}
                                                    onClick={() => selectProject(name)}
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                                                    style={{ color: theme.colors.textPrimary }}
                                                >
                                                    {name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                Expected Loan Duration
                            </label>
                            <div className="relative">
                                <select
                                    value={requestForm.duration}
                                    onChange={(e) => setRequestForm(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full appearance-none px-3 py-2 rounded-lg border text-sm pr-10"
                                    style={{
                                        backgroundColor: theme.colors.surface,
                                        borderColor: theme.colors.border,
                                        color: theme.colors.textPrimary
                                    }}
                                    required
                                >
                                    <option value="">Select duration...</option>
                                    {LOAN_DURATIONS.map(d => (
                                        <option key={d.value} value={d.label}>{d.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: theme.colors.textSecondary }}>
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.146l3.71-3.915a.75.75 0 011.08 1.04l-4.24 4.47a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textSecondary }}>
                                Purpose of Request
                            </label>
                            <textarea
                                value={requestForm.purpose}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                rows="2"
                                placeholder="Describe how you plan to use this loaner product..."
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary,
                                    resize: 'none'
                                }}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                    Ship To Address
                                </label>
                                <button
                                    type="button"
                                    onClick={handleUseHomeAddress}
                                    className="flex items-center space-x-1 text-xs font-semibold p-1 rounded-lg hover:bg-black/5 transition-all duration-200"
                                >
                                    <Home className="w-3 h-3" style={{ color: theme.colors.secondary }} />
                                    <span>Use Home</span>
                                </button>
                            </div>
                            <textarea
                                value={requestForm.address}
                                onChange={(e) => setRequestForm(prev => ({ ...prev, address: e.target.value }))}
                                rows="2"
                                placeholder="Enter shipping address..."
                                className="w-full p-2 border rounded-lg text-xs"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary,
                                    resize: 'none'
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={
                                requestItems.length === 0 ||
                                !requestForm.contactName.trim() ||
                                !requestForm.email.trim() ||
                                !requestForm.phone.trim() ||
                                !requestForm.address.trim() ||
                                !requestForm.duration.trim()
                            }
                            className="w-full font-bold py-3 px-6 rounded-full transition-all duration-200 transform active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                        >
                            Submit Request ({totalRequestItems} Items)
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ============================================
// PRODUCT CARD (extracted, memoized for perf)
// ============================================
const ProductCard = React.memo(({ product, theme, isInRequest, onView, onTransfer, onAdd, onRemove }) => {
    const isAvailable = product.status === AVAILABILITY_STATUS.AVAILABLE;
    const isOnLoan = product.status === AVAILABILITY_STATUS.OUT_FOR_LOAN;
    const currentHolder = product.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const canTransfer = isOnLoan && product.transferEligible && product.currentHolderRepId !== CURRENT_USER.id;

    return (
        <div
            onClick={() => onView(product)}
            className="text-left cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name} details`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(product); } }}
        >
            <div className="rounded-2xl shadow-md overflow-hidden h-full flex flex-col" style={{ backgroundColor: theme.colors.surface }}>
                <div className="w-full h-40 relative" style={{ backgroundColor: theme.colors.subtle || `${theme.colors.border}40` }}>
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2">
                            <span className="text-white font-bold text-sm text-center">{STATUS_LABELS[product.status]}</span>
                            {currentHolder && (
                                <span className="text-white/80 text-xs mt-1 text-center">
                                    with {currentHolder.name.split(' ')[0]}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <div className="flex-1 mb-3">
                        <h3 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{product.name}</h3>
                        <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>Model: {product.model}</p>
                        {product.returnDate && !isAvailable && (
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                Available: {formatDate(product.returnDate)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        {canTransfer && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onTransfer(product); }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95"
                                style={{ backgroundColor: '#5B7B8C', color: 'white' }}
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                Request Transfer
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isInRequest) onRemove(product.id);
                                else if (isAvailable) onAdd(e, product);
                            }}
                            disabled={!isAvailable && !isInRequest}
                            className="w-full flex items-center justify-center px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: isInRequest ? '#10b981' : (isAvailable ? theme.colors.accent : '#6b7280'), color: 'white' }}
                        >
                            {isInRequest ? (<><CheckCircle className="w-4 h-4 mr-1" />Added</>) :
                                isAvailable ? (<><PlusCircle className="w-4 h-4 mr-1" />Add to Request</>) :
                                    (<>Unavailable</>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ============================================
// PRODUCT DETAIL MODAL (extracted, theme-aware)
// ============================================
const ProductDetailModal = React.memo(({ product, theme, onClose, onTransfer }) => {
    const currentHolder = product?.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const canTransfer = product?.status === AVAILABILITY_STATUS.OUT_FOR_LOAN &&
                      product?.transferEligible &&
                      product?.currentHolderRepId !== CURRENT_USER.id;

    return (
        <Modal show={!!product} onClose={onClose} title="" theme={theme}>
            {product && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{product.name}</h3>
                        <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>Model: {product.model}</p>
                        <div className="mt-2">
                            <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: STATUS_COLORS[product.status] + '20', color: STATUS_COLORS[product.status] }}
                            >
                                {STATUS_LABELS[product.status]}
                            </span>
                        </div>
                    </div>
                    <img src={product.img} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    {currentHolder && (
                        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: theme.colors.subtle || `${theme.colors.border}20` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                    Currently with {currentHolder.name}
                                </span>
                            </div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                {currentHolder.region} Region &bull; {currentHolder.email}
                            </p>
                            {product.projectName && (
                                <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                    Project: {product.projectName}
                                </p>
                            )}
                            {product.returnDate && (
                                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: theme.colors.accent }}>
                                    <Calendar className="w-3 h-3" />
                                    <span>Expected available: {formatDate(product.returnDate)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <h4 className="font-bold mb-2" style={{ color: theme.colors.textPrimary }}>Specifications</h4>
                    <div className="space-y-1 text-sm">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="flex">
                                <span className="font-medium w-24 flex-shrink-0 capitalize" style={{ color: theme.colors.textSecondary }}>{key}:</span>
                                <span style={{ color: theme.colors.textPrimary }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-1 text-sm">
                        <div className="flex">
                            <span className="font-medium w-24 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>Location:</span>
                            <span style={{ color: theme.colors.textPrimary }}>{product.location}</span>
                        </div>
                        {product.estimatedReturn && (
                            <div className="flex">
                                <span className="font-medium w-24 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>Est. Return:</span>
                                <span style={{ color: theme.colors.textPrimary }}>{product.estimatedReturn}</span>
                            </div>
                        )}
                    </div>
                    {canTransfer && (
                        <button
                            onClick={() => { onClose(); onTransfer(product); }}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold transition-all active:scale-95"
                            style={{ backgroundColor: '#5B7B8C', color: 'white' }}
                        >
                            <ArrowRightLeft className="w-5 h-5" />
                            Request Transfer from {currentHolder?.name?.split(' ')[0]}
                        </button>
                    )}
                </div>
            )}
        </Modal>
    );
});

// ============================================
// MAIN LOANER POOL SCREEN
// ============================================
export const LoanerPoolScreen = ({ theme, setSuccessMessage, userSettings, myProjects = [], setMyProjects }) => {
    const [activeTab, setActiveTab] = useState('browse'); // browse, transfers
    const [requestItems, setRequestItems] = useState([]);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [transferModalProduct, setTransferModalProduct] = useState(null);
    
    // State for products (to track ownership changes)
    const [products, setProducts] = useState(LOANER_POOL_PRODUCTS);
    
    // State for transfer requests
    const [transferRequests, setTransferRequests] = useState(INITIAL_TRANSFER_REQUESTS);
    
    // State for loan events (audit trail) - collected for future use
    const [, setLoanEvents] = useState([]);

    const requestItemIds = useMemo(() => new Set(requestItems.map(item => item.id)), [requestItems]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const totalRequestItems = requestItems.length;

    // Count pending transfers needing action
    const pendingTransferCount = useMemo(() => {
        return transferRequests.filter(
            r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
        ).length;
    }, [transferRequests]);

    const handleAddToRequest = useCallback((e, productToAdd) => {
        e.stopPropagation();
        setRequestItems(prev => [...prev, productToAdd]);
    }, []);

    const handleRemoveFromRequest = useCallback((productId) => {
        setRequestItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        setSuccessMessage?.(`Request for ${requestItems.length} item(s) submitted!`);
        setTimeout(() => setSuccessMessage?.(''), 3000);
        setRequestItems([]);
    }, [requestItems.length, setSuccessMessage]);

    // Transfer request handlers
    const handleSubmitTransfer = useCallback((transferData) => {
        const newRequest = {
            id: `tr-${Date.now()}`,
            ...transferData,
            status: TRANSFER_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            decidedAt: null,
            decisionReason: null
        };
        
        setTransferRequests(prev => [newRequest, ...prev]);
        
        // Log event
        setLoanEvents(prev => [...prev, {
            id: `evt-${Date.now()}`,
            itemId: transferData.itemId,
            eventType: LOAN_EVENT_TYPES.TRANSFER_REQUESTED,
            repId: CURRENT_USER.id,
            timestamp: new Date().toISOString(),
            notes: `Transfer requested from ${getRepById(transferData.fromRepId)?.name} to ${CURRENT_USER.name}`
        }]);
        
        setSuccessMessage?.('Transfer request sent!');
        setTimeout(() => setSuccessMessage?.(''), 3000);
    }, [setSuccessMessage]);

    const handleApproveTransfer = useCallback((requestId, isComplete = false) => {
        setTransferRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;
            
            if (isComplete || r.status === TRANSFER_STATUS.APPROVED) {
                // Complete the transfer - change ownership
                setProducts(prods => prods.map(p => {
                    if (p.id === r.itemId) {
                        return {
                            ...p,
                            currentHolderRepId: r.toRepId,
                            location: `In field with ${getRepById(r.toRepId)?.name}`,
                            status: AVAILABILITY_STATUS.OUT_FOR_LOAN
                        };
                    }
                    return p;
                }));
                
                // Log completion event
                setLoanEvents(evts => [...evts, {
                    id: `evt-${Date.now()}`,
                    itemId: r.itemId,
                    eventType: LOAN_EVENT_TYPES.TRANSFER_COMPLETED,
                    repId: r.toRepId,
                    timestamp: new Date().toISOString(),
                    notes: `Transfer completed: ${getRepById(r.fromRepId)?.name} → ${getRepById(r.toRepId)?.name}`
                }]);
                
                setSuccessMessage?.('Transfer completed! Ownership updated.');
                setTimeout(() => setSuccessMessage?.(''), 3000);
                
                return { ...r, status: TRANSFER_STATUS.COMPLETED, decidedAt: new Date().toISOString() };
            }
            
            // Just approve (not complete yet)
            setLoanEvents(evts => [...evts, {
                id: `evt-${Date.now()}`,
                itemId: r.itemId,
                eventType: LOAN_EVENT_TYPES.TRANSFER_APPROVED,
                repId: CURRENT_USER.id,
                timestamp: new Date().toISOString(),
                notes: `Transfer approved by ${CURRENT_USER.name}`
            }]);
            
            setSuccessMessage?.('Transfer approved! Awaiting handoff confirmation.');
            setTimeout(() => setSuccessMessage?.(''), 3000);
            
            return { ...r, status: TRANSFER_STATUS.APPROVED, decidedAt: new Date().toISOString() };
        }));
    }, [setSuccessMessage]);

    const handleDeclineTransfer = useCallback((requestId, reason) => {
        setTransferRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;
            
            setLoanEvents(evts => [...evts, {
                id: `evt-${Date.now()}`,
                itemId: r.itemId,
                eventType: LOAN_EVENT_TYPES.TRANSFER_DECLINED,
                repId: CURRENT_USER.id,
                timestamp: new Date().toISOString(),
                notes: `Transfer declined by ${CURRENT_USER.name}${reason ? `: ${reason}` : ''}`
            }]);
            
            setSuccessMessage?.('Transfer request declined.');
            setTimeout(() => setSuccessMessage?.(''), 3000);
            
            return { 
                ...r, 
                status: TRANSFER_STATUS.DECLINED, 
                decidedAt: new Date().toISOString(),
                decisionReason: reason || null
            };
        }));
    }, [setSuccessMessage]);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ paddingBottom: totalRequestItems > 0 ? '88px' : '0' }}>
            {/* Tab bar - using standardized SegmentedToggle */}
            <div className="px-4 pt-3 pb-3">
                <SegmentedToggle
                    value={activeTab}
                    onChange={setActiveTab}
                    options={[
                        { value: 'browse', label: 'Browse', icon: Package },
                        { value: 'transfers', label: 'Transfers', icon: ArrowRightLeft, badge: pendingTransferCount }
                    ]}
                    size="md"
                    fullWidth
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'browse' ? (
                    <>
                        {/* Search bar */}
                        <div className="p-4 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                <input
                                    type="text"
                                    placeholder="Search by name or model..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border py-3 pl-11 pr-4 rounded-full text-sm"
                                    style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                    aria-label="Search loaner pool products"
                                />
                            </div>
                        </div>

                        {/* Info banner about transfers */}
                        <div className="mx-4 mb-4 p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: 'rgba(91,123,140,0.13)' }}>
                            <ArrowRightLeft className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#5B7B8C' }} />
                            <div>
                                <p className="text-sm font-medium" style={{ color: '#5B7B8C' }}>
                                    Intra-Rep Transfers Now Available
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                    Items on loan can now be transferred directly between reps without returning to warehouse.
                                </p>
                            </div>
                        </div>

                        {/* Product grid */}
                        <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    theme={theme}
                                    isInRequest={requestItemIds.has(product.id)}
                                    onView={setViewingProduct}
                                    onTransfer={setTransferModalProduct}
                                    onAdd={handleAddToRequest}
                                    onRemove={handleRemoveFromRequest}
                                />
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-2 mt-8 text-center">
                                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: theme.colors.textSecondary }} />
                                    <p style={{ color: theme.colors.textSecondary }}>
                                        {searchQuery ? `No products found for "${searchQuery}"` : 'No loaner pool products available.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <TransfersTab
                        transferRequests={transferRequests}
                        products={products}
                        theme={theme}
                        onApprove={handleApproveTransfer}
                        onDecline={handleDeclineTransfer}
                    />
                )}
            </div>

            {/* Request drawer */}
            <RequestDrawer
                requestItems={requestItems}
                onRemoveFromRequest={handleRemoveFromRequest}
                onSubmitRequest={handleSubmitRequest}
                theme={theme}
                userSettings={userSettings}
                myProjects={myProjects}
                setMyProjects={setMyProjects}
            />

            {/* Modals */}
            <ProductDetailModal
                product={viewingProduct}
                theme={theme}
                onClose={() => setViewingProduct(null)}
                onTransfer={setTransferModalProduct}
            />
            <TransferRequestModal
                show={!!transferModalProduct}
                onClose={() => setTransferModalProduct(null)}
                product={transferModalProduct}
                theme={theme}
                myProjects={myProjects}
                onSubmitTransfer={handleSubmitTransfer}
            />
        </div>
    );
};
