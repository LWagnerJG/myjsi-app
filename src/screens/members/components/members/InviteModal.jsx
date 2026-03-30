import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, X, Check, Send } from 'lucide-react';
import { hapticSuccess } from '../../../../utils/haptics.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

export const InviteModal = ({ open, onClose, onInvite, theme, roles }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(roles[roles.length - 1]?.value || 'rep_user');
    const [sent, setSent] = useState(false);
    const emailRef = useRef(null);

    useEffect(() => {
        if (open) {
            setEmail(''); setFirstName(''); setLastName(''); setPhone(''); setRole(roles[roles.length - 1]?.value || 'rep_user'); setSent(false);
            setTimeout(() => emailRef.current?.focus(), 100);
        }
    }, [open, roles]);

    if (!open) return null;

    const valid = email.trim() && email.includes('@') && firstName.trim() && lastName.trim();

    const handleSend = () => {
        if (!valid) return;
        hapticSuccess();
        onInvite({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), role });
        setSent(true);
        setTimeout(() => { setSent(false); onClose(); }, 1400);
    };

    const fieldStyle = {
        backgroundColor: theme.colors.subtle,
        color: theme.colors.textPrimary,
        border: `1.5px solid ${theme.colors.border}`,
    };

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: UNIFIED_MODAL_Z }}>
            <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl p-0 overflow-hidden"
                style={{ backgroundColor: theme.colors.surface, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: `1px solid ${theme.colors.border}` }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.colors.accent}10` }}>
                            <UserPlus className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        </div>
                        <h3 className="text-base font-semibold" style={{ color: theme.colors.textPrimary }}>Invite Team Member</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70" style={{ backgroundColor: theme.colors.subtle }}>
                        <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                    </button>
                </div>

                {sent ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: theme.colors.successLight }}>
                            <Check className="w-6 h-6" style={{ color: theme.colors.success }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>Invite sent!</p>
                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{email}</p>
                    </div>
                ) : (
                    <div className="px-5 py-4 space-y-3">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane"
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={fieldStyle}
                                    onFocus={e => e.target.style.borderColor = theme.colors.accent}
                                    onBlur={e => e.target.style.borderColor = theme.colors.border} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith"
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={fieldStyle}
                                    onFocus={e => e.target.style.borderColor = theme.colors.accent}
                                    onBlur={e => e.target.style.borderColor = theme.colors.border} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: theme.colors.textSecondary }}>Email</label>
                            <input ref={emailRef} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com"
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={fieldStyle}
                                onFocus={e => e.target.style.borderColor = theme.colors.accent}
                                onBlur={e => e.target.style.borderColor = theme.colors.border}
                                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} />
                        </div>

                        {/* Phone (optional) */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: theme.colors.textSecondary }}>
                                Phone <span className="normal-case tracking-normal font-normal" style={{ color: theme.colors.textSecondary }}>— optional</span>
                            </label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-123-4567"
                                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={fieldStyle}
                                onFocus={e => e.target.style.borderColor = theme.colors.accent}
                                onBlur={e => e.target.style.borderColor = theme.colors.border} />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: theme.colors.textSecondary }}>Role</label>
                            <div className="flex flex-wrap gap-1.5">
                                {roles.map(r => (
                                    <button key={r.value} onClick={() => setRole(r.value)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                                        style={{
                                            backgroundColor: role === r.value ? theme.colors.accent : 'transparent',
                                            color: role === r.value ? theme.colors.accentText : theme.colors.textSecondary,
                                            border: `1.5px solid ${role === r.value ? theme.colors.accent : theme.colors.border}`,
                                        }}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!sent && (
                    <div className="px-5 py-3.5 flex justify-end gap-2" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                        <button onClick={onClose}
                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ color: theme.colors.textSecondary, border: `1.5px solid ${theme.colors.border}` }}>
                            Cancel
                        </button>
                        <button onClick={handleSend}
                            className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${valid ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                            disabled={!valid}>
                            <Send className="w-3 h-3" /> Send Invite
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
