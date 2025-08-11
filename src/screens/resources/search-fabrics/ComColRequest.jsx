import React from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { ExternalLink, ArrowLeft } from 'lucide-react';

export const ComColRequest = ({ theme, onBack }) => {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <GlassCard theme={theme} className="rounded-3xl">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                COM / COL Pattern Submission
              </h2>
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-2xl flex items-center gap-2"
                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {/* Helpful links */}
            <div className="grid sm:grid-cols-3 gap-3">
              <a
                className="px-4 py-3 rounded-2xl border flex items-center justify-between"
                style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }}
                href="https://webresources.jsifurniture.com/production/uploads/documents/JSI-BrandDoc-COMCOLOrderForm-0321.pdf"
                target="_blank" rel="noreferrer"
                title="Open the COM/COL Order Form PDF in a new tab"
              >
                COM/COL Order Form
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
              <a
                className="px-4 py-3 rounded-2xl border flex items-center justify-between"
                style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }}
                href="https://jasperwebsites.blob.core.windows.net/production/uploads/documents/jsi_COMCOL_approval_3.pdf"
                target="_blank" rel="noreferrer"
              >
                Approval Process Guide
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
              <a
                className="px-4 py-3 rounded-2xl border flex items-center justify-between"
                style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary, background: theme.colors.surface }}
                href="https://www.jsifurniture.com/resources/textile-partner-info/col-com/"
                target="_blank" rel="noreferrer"
              >
                Textile Partner Info
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>

            {/* Embedded form (PDF in-frame for "stay in app") */}
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: theme.colors.border }}>
              <iframe
                title="JSI COM/COL Order Form"
                src="https://webresources.jsifurniture.com/production/uploads/documents/JSI-BrandDoc-COMCOLOrderForm-0321.pdf"
                className="w-full"
                style={{ height: '80vh', background: '#fff' }}
              />
            </div>

            <p className="text-sm opacity-75" style={{ color: theme.colors.textSecondary }}>
              Tip: If the embedded form viewer is slow, use the "COM/COL Order Form" link above to open it in a new tab.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};