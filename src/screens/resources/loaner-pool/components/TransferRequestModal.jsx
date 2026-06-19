import React, { useState, useMemo } from 'react';
import { Modal } from '../../../../components/common/Modal.jsx';
import { PrimaryButton, SecondaryButton } from '../../../../components/common/JSIButtons.jsx';
import { Send, User } from 'lucide-react';
import { isDarkTheme, fieldTileSurface } from '../../../../design-system/tokens.js';
import { CURRENT_USER, SALES_REPS } from '../data.js';
import { hapticSuccess } from '../../../../utils/haptics.js';
import { getProjectDisplayName } from '../../../../utils/projectHelpers.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const FIELD_CLASS = 'w-full min-h-[44px] px-3.5 rounded-2xl text-[0.8125rem] outline-none focus-ring';

export const TransferRequestModal = ({
    show,
    onClose,
    product,
    theme,
    myProjects = [],
    onSubmitTransfer,
}) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const tile = fieldTileSurface(theme);

    const [formData, setFormData] = useState({
        desiredStartDate: '',
        desiredEndDate: '',
        projectName: '',
        message: '',
    });
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    const currentHolder = product?.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;

    const filteredProjects = useMemo(() => {
        const q = formData.projectName.trim().toLowerCase();
        if (!q) return (myProjects || []).slice(0, 5);
        return (myProjects || []).filter(p =>
            getProjectDisplayName(p).toLowerCase().includes(q)
        ).slice(0, 5);
    }, [formData.projectName, myProjects]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.desiredStartDate || !formData.message.trim()) return;
        hapticSuccess();
        onSubmitTransfer({
            itemId: product.id,
            fromRepId: product.currentHolderRepId,
            toRepId: CURRENT_USER.id,
            ...formData,
        });

        setFormData({ desiredStartDate: '', desiredEndDate: '', projectName: '', message: '' });
        onClose();
    };

    if (!product) return null;

    const fieldStyle = { ...tile, color: c.textPrimary };
    const holderFirst = currentHolder?.name?.split(' ')[0] || 'holder';

    return (
        <Modal show={show} onClose={onClose} title="Request Transfer" theme={theme} maxWidth="max-w-md">
            <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl p-3" style={tile}>
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.8)' }}>
                        <img src={product.img} alt="" className="w-full h-full object-contain p-1.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[0.875rem] font-semibold truncate" style={{ color: c.textPrimary }}>{product.name}</p>
                        <p className="text-[0.6875rem] font-mono mt-0.5" style={{ color: c.textSecondary }}>{product.model}</p>
                    </div>
                </div>

                {currentHolder ? (
                    <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={tile}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.accent}14` }}>
                            <User className="w-4 h-4" style={{ color: c.accent }} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[0.625rem] font-semibold uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.7 }}>Currently held by</p>
                            <p className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>{currentHolder.name}</p>
                        </div>
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="text-[0.625rem] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: c.textSecondary, opacity: 0.75 }}>
                                Start date
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.desiredStartDate}
                                onChange={(e) => setFormData({ ...formData, desiredStartDate: e.target.value })}
                                className={FIELD_CLASS}
                                style={{ ...fieldStyle, colorScheme: isDark ? 'dark' : 'light' }}
                            />
                        </div>
                        <div>
                            <label className="text-[0.625rem] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: c.textSecondary, opacity: 0.75 }}>
                                End date
                            </label>
                            <input
                                type="date"
                                value={formData.desiredEndDate}
                                onChange={(e) => setFormData({ ...formData, desiredEndDate: e.target.value })}
                                className={FIELD_CLASS}
                                style={{ ...fieldStyle, colorScheme: isDark ? 'dark' : 'light' }}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-[0.625rem] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: c.textSecondary, opacity: 0.75 }}>
                            Project (optional)
                        </label>
                        <input
                            value={formData.projectName}
                            onChange={(e) => {
                                setFormData({ ...formData, projectName: e.target.value });
                                setShowProjectDropdown(true);
                            }}
                            onFocus={() => setShowProjectDropdown(true)}
                            onBlur={() => setTimeout(() => setShowProjectDropdown(false), 150)}
                            placeholder="Search your projects"
                            className={FIELD_CLASS}
                            style={fieldStyle}
                        />
                        {showProjectDropdown && filteredProjects.length > 0 ? (
                            <div className="absolute z-10 w-full mt-1 rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: c.surface, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)'}` }}>
                                {filteredProjects.map((p, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="w-full text-left px-3.5 py-2.5 text-[0.8125rem]"
                                        style={{ color: c.textPrimary }}
                                        onMouseDown={() => {
                                            setFormData({ ...formData, projectName: getProjectDisplayName(p) });
                                            setShowProjectDropdown(false);
                                        }}
                                    >
                                        {getProjectDisplayName(p)}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <label className="text-[0.625rem] font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: c.textSecondary, opacity: 0.75 }}>
                            Message to {holderFirst}
                        </label>
                        <textarea
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            placeholder={`Hi ${holderFirst}, I need this for a mockup next week...`}
                            className={`${FIELD_CLASS} resize-none py-2.5`}
                            style={fieldStyle}
                        />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                        <SecondaryButton
                            type="button"
                            onClick={onClose}
                            theme={theme}
                            className="flex-1 h-11 !py-0 px-4 text-[0.8125rem]"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!formData.desiredStartDate || !formData.message.trim()}
                            theme={theme}
                            icon={<Send className="w-4 h-4" />}
                            className="flex-1 h-11 !py-0 px-4 text-[0.8125rem] disabled:cursor-not-allowed"
                        >
                            Send
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
