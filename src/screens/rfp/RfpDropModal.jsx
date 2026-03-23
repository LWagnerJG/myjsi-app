/* ── RFP Drop Confirmation Modal ─────────────────────────────────── */
import React from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { FileText } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

const ELLIOTT_AVATAR_URL =
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Elliott&top=shortFlat&hairColor=e8e1e1' +
  '&accessories=round&accessoriesProbability=100&accessoriesColor=262e33' +
  '&eyebrows=defaultNatural&eyes=happy&mouth=smile' +
  '&clothing=blazerAndShirt&clothesColor=25557c' +
  '&skinColor=ffdbb4&facialHairProbability=0';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const RfpDropModal = ({ show, onClose, onAccept, file, theme }) => {
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};

  return (
    <Modal show={show} onClose={onClose} theme={theme} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center gap-4">
        {/* Elliott avatar */}
        <div
          className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)' }}
        >
          <img
            src={ELLIOTT_AVATAR_URL}
            alt="Elliott"
            width={56}
            height={56}
            className="w-full h-full"
            style={{ transform: 'scale(1.15) translateY(1px)' }}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: c.textPrimary }}>
            Looks like you have an RFP
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
            Want me to analyze it and build a response you can review and edit?
          </p>
        </div>

        {/* File preview chip */}
        {file && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl w-full"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${c.border}`,
            }}
          >
            <FileText className="w-5 h-5 flex-shrink-0" style={{ color: '#B85C5C' }} />
            <div className="text-left flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>
                {file.name}
              </div>
              <div className="text-xs" style={{ color: c.textSecondary }}>
                {formatFileSize(file.size)}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <PrimaryButton theme={theme} fullWidth onClick={onAccept}>
            Analyze RFP
          </PrimaryButton>
          <button
            onClick={onClose}
            className="text-sm font-medium py-2 transition-opacity hover:opacity-70"
            style={{ color: c.textSecondary }}
          >
            Not now
          </button>
        </div>
      </div>
    </Modal>
  );
};
