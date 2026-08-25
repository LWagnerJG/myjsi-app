import React, { useEffect, useMemo, useState } from 'react';
import { Camera, CloudOff, ImagePlus } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import {
    ISSUE_OWNERS,
    ISSUE_SEVERITIES,
    ISSUE_TYPES,
    formatDateTime,
} from '../receivingLogic.js';
import {
    BigButton,
    BottomSheet,
    Caption,
    ChoiceRow,
    FieldLabel,
    InfoRow,
    QuietButton,
    StatusPill,
} from './ScanPrimitives.jsx';

const DISPOSITIONS = [
    { value: 'hold', label: 'Hold carton' },
    { value: 'accept', label: 'Accept anyway' },
];

const emptyDraft = { type: 'damaged', severity: 'medium', disposition: 'hold', notes: '', owner: ISSUE_OWNERS[0], photos: [] };

export const IssueSheet = ({ theme, open, onClose, shipment, receiving, request, issue }) => {
    const [form, setForm] = useState(emptyDraft);
    const [resolution, setResolution] = useState('');

    const carton = request?.carton || null;

    useEffect(() => {
        if (!open) return;
        setResolution('');
        if (issue) {
            setForm({
                type: issue.type,
                severity: issue.severity,
                disposition: issue.disposition,
                notes: issue.notes,
                owner: issue.owner,
                photos: issue.photos || [],
            });
        } else {
            setForm({ ...emptyDraft, type: request?.type || 'damaged' });
        }
    }, [issue, open, request?.type]);

    const patch = (updates) => setForm((prev) => ({ ...prev, ...updates }));

    const addPhotos = (files) => {
        const names = Array.from(files || []).map((file) => file.name);
        if (names.length) patch({ photos: [...form.photos, ...names] });
    };

    const title = issue ? 'Issue detail' : 'Open an issue';
    const subtitle = carton
        ? `Carton ${carton.cartonNumber} of ${carton.cartonCount} · ${carton.model}`
        : request?.barcode
            ? `Barcode ${request.barcode}`
            : shipment.projectName;

    const canSave = useMemo(() => !!form.type, [form.type]);

    const handleSave = () => {
        if (issue) {
            receiving.updateIssue(issue.id, {
                type: form.type,
                severity: form.severity,
                disposition: form.disposition,
                notes: form.notes,
                owner: form.owner,
                photos: form.photos,
            }, 'Issue updated');
        } else {
            receiving.openIssue(shipment, {
                carton,
                type: form.type,
                severity: form.severity,
                disposition: form.disposition,
                notes: form.notes,
                owner: form.owner,
                photos: form.photos,
            });
        }
        onClose();
    };

    return (
        <BottomSheet
            theme={theme}
            open={open}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            footer={(
                <div className="flex flex-col gap-2">
                    {issue && issue.status === 'open' ? (
                        <BigButton theme={theme} tone="success" onClick={() => { receiving.closeIssue(issue.id, resolution || 'Resolved in warehouse'); onClose(); }}>
                            Close issue
                        </BigButton>
                    ) : null}
                    <BigButton theme={theme} onClick={handleSave} disabled={!canSave}>
                        {issue ? 'Save changes' : receiving.isOffline ? 'Save offline' : 'Save issue'}
                    </BigButton>
                </div>
            )}
        >
            <div className="space-y-4">
                {receiving.isOffline ? (
                    <div
                        className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
                        style={{ backgroundColor: theme.colors.warningLight }}
                    >
                        <CloudOff className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.warning }} aria-hidden="true" />
                        <p className="text-[0.75rem]" style={{ color: theme.colors.textPrimary }}>
                            You are offline. This is saved on the device and sent when service returns.
                        </p>
                    </div>
                ) : null}

                <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Project" value={shipment.projectName} />
                    <InfoRow theme={theme} label="Dealer PO" value={shipment.dealerPo} mono />
                    <InfoRow theme={theme} label="Sales order" value={shipment.salesOrder} mono />
                    {carton ? <InfoRow theme={theme} label="PO line" value={carton.poLine} mono /> : null}
                    {carton ? <InfoRow theme={theme} label="Barcode" value={carton.barcode} mono /> : null}
                    {carton ? <InfoRow theme={theme} label="Pallet" value={carton.pallet} /> : null}
                </div>

                <div>
                    <FieldLabel theme={theme}>What is wrong</FieldLabel>
                    <ChoiceRow
                        theme={theme}
                        ariaLabel="Issue type"
                        options={ISSUE_TYPES}
                        value={form.type}
                        onChange={(value) => patch({ type: value })}
                    />
                </div>

                <div>
                    <FieldLabel theme={theme}>Severity</FieldLabel>
                    <ChoiceRow
                        theme={theme}
                        ariaLabel="Severity"
                        options={ISSUE_SEVERITIES}
                        value={form.severity}
                        onChange={(value) => patch({ severity: value })}
                    />
                </div>

                <div>
                    <FieldLabel theme={theme}>Carton handling</FieldLabel>
                    <ChoiceRow
                        theme={theme}
                        ariaLabel="Carton handling"
                        options={DISPOSITIONS}
                        value={form.disposition}
                        onChange={(value) => patch({ disposition: value })}
                    />
                    <Caption theme={theme} className="mt-1.5">
                        Held cartons arrive but do not become available inventory.
                    </Caption>
                </div>

                <div>
                    <FieldLabel theme={theme} htmlFor="issue-owner">Who owns it</FieldLabel>
                    <select
                        id="issue-owner"
                        value={form.owner}
                        onChange={(e) => patch({ owner: e.target.value })}
                        className="w-full min-h-[48px] px-4 rounded-full text-[0.875rem] font-semibold focus-ring"
                        style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                    >
                        {ISSUE_OWNERS.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                    </select>
                </div>

                <div>
                    <FieldLabel theme={theme} htmlFor="issue-notes">Notes</FieldLabel>
                    <textarea
                        id="issue-notes"
                        value={form.notes}
                        onChange={(e) => patch({ notes: e.target.value })}
                        rows={3}
                        placeholder="Crushed corner on the left arm, carton opened to check frame."
                        className="w-full rounded-3xl px-4 py-3 text-[0.875rem] focus-ring"
                        style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                    />
                </div>

                <div>
                    <FieldLabel theme={theme}>Photos</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        <label
                            className="min-h-[44px] px-4 rounded-full inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold cursor-pointer focus-within:ring-2"
                            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                        >
                            <Camera className="w-4 h-4" aria-hidden="true" />
                            Add photo
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={(e) => addPhotos(e.target.files)}
                            />
                        </label>
                        <QuietButton
                            theme={theme}
                            icon={ImagePlus}
                            onClick={() => patch({ photos: [...form.photos, `damage-photo-${form.photos.length + 1}.jpg`] })}
                        >
                            Add placeholder
                        </QuietButton>
                    </div>
                    {form.photos.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {form.photos.map((photo, index) => (
                                <div
                                    key={`${photo}-${index}`}
                                    className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center px-1 text-center"
                                    style={{ backgroundColor: subtleBg(theme, 1.6), border: subtleBorder(theme) }}
                                >
                                    <ImagePlus className="w-4 h-4 mb-1 opacity-50" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                                    <span className="text-[0.5625rem] leading-tight break-all" style={{ color: theme.colors.textSecondary }}>
                                        {photo}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Caption theme={theme} className="mt-1.5">No photos yet.</Caption>
                    )}
                </div>

                {issue ? (
                    <div>
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <FieldLabel theme={theme}>History</FieldLabel>
                            <StatusPill
                                theme={theme}
                                tone={issue.status === 'open' ? 'warning' : 'success'}
                                label={issue.status === 'open' ? 'Open' : 'Closed'}
                            />
                        </div>
                        <ul className="space-y-1.5">
                            {(issue.history || []).map((entry, index) => (
                                <li key={`${entry.at}-${index}`} className="flex items-start justify-between gap-3">
                                    <span className="text-[0.8125rem]" style={{ color: theme.colors.textPrimary }}>{entry.label}</span>
                                    <span className="text-[0.6875rem] flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                                        {formatDateTime(entry.at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {issue.status === 'open' ? (
                            <div className="mt-3">
                                <FieldLabel theme={theme} htmlFor="issue-resolution">How was it resolved</FieldLabel>
                                <input
                                    id="issue-resolution"
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Carrier credit approved, carton released"
                                    className="w-full min-h-[48px] px-4 rounded-full text-[0.875rem] focus-ring"
                                    style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </BottomSheet>
    );
};
