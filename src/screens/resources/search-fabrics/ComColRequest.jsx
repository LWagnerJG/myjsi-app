import React, { useState, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ExternalLink, CheckCircle } from 'lucide-react';

/* COM / COL Pattern Submission Form
   Lightweight in–app version of the PDF. Captures core details needed to start an evaluation.
*/
export const ComColRequest = ({ theme, onBack, showAlert }) => {
  const [form, setForm] = useState({
    customer: '',
    dealerProject: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    modelNumbers: '',
    fabricMill: '',
    fabricPattern: '',
    fabricColor: '',
    application: 'up', // up | railroad | custom
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.customer && form.dealerProject && form.fabricMill && form.fabricPattern && form.modelNumbers;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // For now just log; could be wired to flow similar to Yardage request.
      console.log('COM/COL Pattern Submission', form);
      setSubmitted(true);
      showAlert && showAlert('COM / COL Pattern request submitted');
      setTimeout(() => setSubmitted(false), 2500);
      setForm(f => ({ ...f, notes: '' }));
    } catch (err) {
      console.error(err);
      showAlert && showAlert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [form, canSubmit, showAlert]);

  const sectionLabel = (txt) => (
    <div className="text-[11px] font-semibold uppercase tracking-wide px-1" style={{ color: theme.colors.textSecondary }}>{txt}</div>
  );

  const inputBase = "w-full rounded-xl px-4 py-3 text-sm outline-none border transition";
  const inputStyle = {
    background: theme.colors.surface,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-5">
        <GlassCard theme={theme} className="rounded-3xl">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>COM / COL Pattern Submission</h2>
              <p className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                Use this form to submit a Customer&apos;s Own Material / Leather pattern for testing and approval.
                Provide as much detail as possible. After submission you will receive next–step instructions
                (ship sample memo, performance requirements, fire code, etc.). Fields marked * are required.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Customer / Dealer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {sectionLabel('Customer *')}
                  <input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder="End customer name" className={inputBase} style={inputStyle} />
                </div>
                <div>
                  {sectionLabel('Dealer / Project *')}
                  <input value={form.dealerProject} onChange={e => update('dealerProject', e.target.value)} placeholder="Dealer or project reference" className={inputBase} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {sectionLabel('Contact')}
                  <input value={form.contact} onChange={e => update('contact', e.target.value)} placeholder="Contact person" className={inputBase} style={inputStyle} />
                </div>
                <div>
                  {sectionLabel('Email')}
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="name@example.com" className={inputBase} style={inputStyle} />
                </div>
                <div>
                  {sectionLabel('Phone')}
                  <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(###) ###-####" className={inputBase} style={inputStyle} />
                </div>
              </div>
              <div>
                {sectionLabel('Address')}
                <textarea value={form.address} onChange={e => update('address', e.target.value)} placeholder="Ship-to / reference address" rows={2} className={inputBase} style={inputStyle} />
              </div>
              {/* Fabric Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {sectionLabel('Fabric Mill *')}
                  <input value={form.fabricMill} onChange={e => update('fabricMill', e.target.value)} placeholder="Supplier / Mill" className={inputBase} style={inputStyle} />
                </div>
                <div>
                  {sectionLabel('Pattern *')}
                  <input value={form.fabricPattern} onChange={e => update('fabricPattern', e.target.value)} placeholder="Pattern name" className={inputBase} style={inputStyle} />
                </div>
                <div>
                  {sectionLabel('Color / Code')}
                  <input value={form.fabricColor} onChange={e => update('fabricColor', e.target.value)} placeholder="Color or color code" className={inputBase} style={inputStyle} />
                </div>
              </div>
              <div>
                {sectionLabel('Model Number(s) *')}
                <input value={form.modelNumbers} onChange={e => update('modelNumbers', e.target.value)} placeholder="Comma separated model numbers" className={inputBase} style={inputStyle} />
              </div>
              {/* Application */}
              <div>
                {sectionLabel('Bolt Application')}
                <div className="flex flex-wrap gap-2 pt-1">
                  {['up','railroad','custom'].map(opt => {
                    const labels = { up: 'Up the Roll', railroad: 'Railroad', custom: 'Custom / Other' };
                    const active = form.application === opt;
                    return (
                      <button key={opt} type="button" onClick={() => update('application', opt)} className="px-4 py-2 rounded-full text-xs font-semibold transition border" style={{ backgroundColor: active ? theme.colors.accent : theme.colors.surface, color: active ? theme.colors.surface : theme.colors.textPrimary, borderColor: active ? theme.colors.accent : theme.colors.border }}>
                        {labels[opt]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                {sectionLabel('Notes / Special Instructions')}
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Fire code requirements, backing, finish treatments, testing needs, etc." rows={3} className={inputBase} style={inputStyle} />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={!canSubmit || submitting} className="w-full rounded-full py-4 font-bold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: theme.colors.accent }}>
                  {submitting ? 'Submitting...' : 'Submit COM / COL Pattern'}
                </button>
                {submitted && (
                  <div className="flex items-center gap-2 mt-3 text-sm font-medium" style={{ color: theme.colors.accent }}>
                    <CheckCircle className="w-4 h-4" /> Submitted!
                  </div>
                )}
              </div>
            </form>
          </div>
        </GlassCard>
        {/* Helpful Links */}
        <GlassCard theme={theme} className="rounded-3xl">
          <div className="p-5 sm:p-6 space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>Helpful References</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://webresources.jsifurniture.com/production/uploads/documents/JSI-BrandDoc-COMCOLOrderForm-0321.pdf" target="_blank" rel="noreferrer" title="Open the COM/COL Order Form PDF in a new tab">COM/COL Order Form<ExternalLink className="w-4 h-4 opacity-70" /></a>
              <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://jasperwebsites.blob.core.windows.net/production/uploads/documents/jsi_COMCOL_approval_3.pdf" target="_blank" rel="noreferrer">Approval Process Guide<ExternalLink className="w-4 h-4 opacity-70" /></a>
              <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://www.jsifurniture.com/resources/textile-partner-info/col-com/" target="_blank" rel="noreferrer">Textile Partner Info<ExternalLink className="w-4 h-4 opacity-70" /></a>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};