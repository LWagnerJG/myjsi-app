import React, { useState, useMemo } from 'react';
import { Modal } from '../../../../components/common/Modal.jsx';
import { FormInput } from '../../../../components/common/FormComponents.jsx';
import { Send, User, Calendar, MessageSquare } from 'lucide-react';
import { CURRENT_USER, SALES_REPS } from '../data.js';
import { hapticSuccess } from '../../../../utils/haptics.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);

export const TransferRequestModal = ({ 
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
        hapticSuccess();
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
                        <div className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>{product.name}</div>
                        <div className="text-xs" style={{ color: theme.colors.textSecondary }}>{product.series}</div>
                    </div>
                </div>

                {/* Current Holder Info */}
                {currentHolder && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: theme.colors.border }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}15` }}>
                            <User className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <div>
                            <div className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Currently held by</div>
                            <div className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{currentHolder.name}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            label="Desired Start Date"
                            type="date"
                            value={formData.desiredStartDate}
                            onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
                            required
                            theme={theme}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                        <FormInput
                            label="Desired End Date"
                            type="date"
                            value={formData.desiredEndDate}
                            onChange={(e) => setFormData({ ...formData, desiredEndDate: e.target.value })}
                            theme={theme}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                    </div>

                    <div className="relative">
                        <FormInput
                            label="Project Name (Optional)"
                            value={formData.projectName}
                            onChange={(e) => {
                                setFormData({ ...formData, projectName: e.target.value });
                                setShowProjectDropdown(true);
                            }}
                            onFocus={() => setShowProjectDropdown(true)}
                            onBlur={() => setTimeout(() => setShowProjectDropdown(false), 200)}
                            placeholder="Search your projects..."
                            theme={theme}
                        />
                        {showProjectDropdown && filteredProjects.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                {filteredProjects.map((p, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors"
                                        style={{ color: theme.colors.textPrimary }}
                                        onMouseDown={() => {
                                            setFormData({ ...formData, projectName: p.name || p.projectName });
                                            setShowProjectDropdown(false);
                                        }}
                                    >
                                        {p.name || p.projectName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold ml-1" style={{ color: theme.colors.textSecondary }}>
                            Message to {currentHolder?.name.split(' ')[0] || 'Holder'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <MessageSquare className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                            </div>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                rows={3}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none resize-none"
                                style={{
                                    backgroundColor: theme.colors.subtle,
                                    color: theme.colors.textPrimary,
                                    border: `1px solid ${theme.colors.border}`,
                                }}
                                placeholder={`Hi ${currentHolder?.name.split(' ')[0] || 'there'}, I need this for a mockup next week...`}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                            style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.desiredStartDate || !formData.message.trim()}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                        >
                            <Send className="w-4 h-4" />
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
