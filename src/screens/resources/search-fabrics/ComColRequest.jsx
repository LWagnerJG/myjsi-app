import React, { useState, useCallback } from 'react';
import { AppScreenLayout } from '../../../components/common/AppScreenLayout.jsx';
import { FloatingSubmitCTA } from '../../../components/common/FloatingSubmitCTA.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { ExternalLink, CheckCircle } from 'lucide-react';

/* COM / COL Pattern Submission Form
  Lightweight in-app version of the PDF. Captures core details needed to start an evaluation.
*/
export const ComColRequest = ({ theme, showAlert }) => {
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

  const canSubmit =
    form.customer.trim() &&
    form.dealerProject.trim() &&
    form.fabricMill.trim() &&
    form.fabricPattern.trim() &&
    form.modelNumbers.trim();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // For now just log; could be wired to flow similar to Yardage request.
    if (import.meta.env.DEV) console.log('COM/COL Pattern Submission', form);
    setSubmitted(true);
    showAlert && showAlert('COM / COL Pattern request submitted');
    setTimeout(() => setSubmitted(false), 2500);
    setForm(f => ({ ...f, notes: '' }));
    setSubmitting(false);
  }, [form, canSubmit, showAlert]);

  const sectionLabel = (txt) => (
    <div className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: theme.colors.textSecondary }}>{txt}</div>
  );

  const inputBase = "w-full rounded-xl px-4 py-3 text-sm outline-none border transition";
  const inputStyle = {
    background: theme.colors.surface,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary
  };

  return (
    <AppScreenLayout
      theme={theme}
      asForm
      onSubmit={handleSubmit}
      title="COM / COL Pattern Submission"
      subtitle="Submit material details for testing and approval. Fields marked with * are required."
      maxWidthClass="max-w-content"
      horizontalPaddingClass="px-4"
      contentPaddingBottomClass="pb-28"
      contentClassName="pt-1 space-y-5"
      footer={(
        <FloatingSubmitCTA
          theme={theme}
          type="submit"
          label={submitting ? 'Submitting...' : 'Submit COM / COL Pattern'}
          disabled={!canSubmit || submitting}
          visible
        />
      )}
    >
          <GlassCard theme={theme} className="rounded-2xl">
            <div className="p-6 space-y-7">
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
                      <PillButton
                        key={opt}
                        isSelected={active}
                        onClick={() => update('application', opt)}
                        theme={theme}
                        size="compact"
                      >
                        {labels[opt]}
                      </PillButton>
                    );
                  })}
                </div>
              </div>
              <div>
                {sectionLabel('Notes / Special Instructions')}
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Fire code requirements, backing, finish treatments, testing needs, etc." rows={3} className={inputBase} style={inputStyle} />
              </div>
              {submitted && (
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.colors.accent }}>
                  <CheckCircle className="w-4 h-4" /> Submitted!
                </div>
              )}
            </div>
          </GlassCard>

          {/* Helpful Links */}
          <GlassCard theme={theme} className="rounded-2xl">
            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>Helpful References</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://webresources.jsifurniture.com/production/uploads/documents/JSI-BrandDoc-COMCOLOrderForm-0321.pdf" target="_blank" rel="noreferrer" title="Open the COM/COL Order Form PDF in a new tab">COM/COL Order Form<ExternalLink className="w-4 h-4 opacity-70" /></a>
                <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://jasperwebsites.blob.core.windows.net/production/uploads/documents/jsi_COMCOL_approval_3.pdf" target="_blank" rel="noreferrer">Approval Process Guide<ExternalLink className="w-4 h-4 opacity-70" /></a>
                <a className="px-4 py-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }} href="https://www.jsifurniture.com/resources/textile-partner-info/col-com/" target="_blank" rel="noreferrer">Textile Partner Info<ExternalLink className="w-4 h-4 opacity-70" /></a>
              </div>
            </div>
          </GlassCard>
    </AppScreenLayout>
  );
};