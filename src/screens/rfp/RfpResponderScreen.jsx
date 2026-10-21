/* ── RFP Responder — extract → analyze → product workspace ── */
import React, { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { AnimatedScreenWrapper } from '../../components/common/AnimatedScreenWrapper.jsx';
import { UploadStage, ProcessingStage } from './RfpResponderStages.jsx';
import { RfpReviewStage } from './RfpReviewStage.jsx';
import { MOCK_RESPONSE, NON_JSI_ITEMS } from './rfpMockData.js';
import {
  CLIENT_MAX_FILE_BYTES,
  CLIENT_MAX_FILES,
  extractRfpPdfs,
  analyzeRfpPages,
  fetchRfpStatus,
  runSampleBid,
} from './rfpApi.js';
import { matchProducts, buildPricingWorksheet } from './rfpProductMatch.js';
import { buildGoNoGo } from './rfpGoNoGo.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';

const ResponseBuilder = React.lazy(() =>
  import('./RfpResponderComponents.jsx').then((m) => ({ default: m.ResponseBuilder }))
);

const EMPTY_SESSION = {
  meta: null,
  requirements: [],
  itemCodes: [],
  deadlines: [],
  submissionRules: [],
  answers: [],
  clarifyingQuestions: [],
  emptyPages: [],
  approvals: {},
  extractionMode: null,
  aiConfigured: null,
  aiMessage: null,
  fileName: '',
  libraryEntries: [],
  productMatch: null,
  pricing: null,
  goNoGo: null,
  dropped: [],
  steps: [],
};

function enrichSession(analyzed) {
  const gsaMode = /GSA|MAS/i.test(analyzed.meta?.contractVehicle || '')
    || /GSA|GS-28/i.test(String(analyzed.meta?.solicitation || ''));
  const productMatch = matchProducts({
    itemCodes: analyzed.itemCodes || [],
    requirements: analyzed.requirements || [],
  });
  const pricing = buildPricingWorksheet(productMatch.matches, {
    gsaMode,
    installFeePct: gsaMode ? 0.12 : 0.08,
  });
  const base = {
    meta: analyzed.meta || { projectName: analyzed.fileName || 'RFP' },
    requirements: analyzed.requirements || [],
    itemCodes: analyzed.itemCodes || [],
    deadlines: analyzed.deadlines || [],
    submissionRules: analyzed.submissionRules || [],
    answers: analyzed.answers || [],
    clarifyingQuestions: analyzed.clarifyingQuestions || [],
    emptyPages: analyzed.emptyPages || [],
    approvals: {},
    extractionMode: analyzed.extractionMode,
    aiConfigured: analyzed.aiConfigured,
    aiMessage: analyzed.aiMessage,
    fileName: analyzed.fileName || '',
    libraryEntries: analyzed.library || [],
    productMatch,
    pricing,
    dropped: analyzed.dropped || [],
    steps: analyzed.steps || [],
    sample: Boolean(analyzed.sample),
  };
  base.goNoGo = buildGoNoGo(base);
  return base;
}

const RfpResponderScreen = ({ theme, screenParams, setSuccessMessage }) => {
  const [stage, setStage] = useState(0);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({ pct: 0, text: '' });
  const [processError, setProcessError] = useState('');
  const [session, setSession, resetSession] = usePersistentState('rfpResponderSession', EMPTY_SESSION, { version: 3 });
  const [sampleData, setSampleData] = useState(null);
  const [partnerItems, setPartnerItems] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (session?.meta?.projectName && (session.requirements?.length || session.answers?.length || session.goNoGo)) {
      setStage(2);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRfpStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ aiConfigured: false, aiMessage: 'Could not reach /api/rfp/status' }));
  }, []);

  const runPipeline = useCallback(async (mode, fileList = files) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setProcessError('');
    setStage(1);
    setProgress({ pct: 8, text: mode === 'sample' ? 'Loading TAPS IFB sample…' : 'Reading your PDF…' });
    try {
      let analyzed;
      if (mode === 'sample') {
        analyzed = await runSampleBid({
          onProgress: (text) => setProgress((p) => ({ pct: Math.min(90, p.pct + 12), text })),
        });
      } else {
        const extracted = await extractRfpPdfs(fileList, {
          onProgress: (text) => setProgress((p) => ({ pct: Math.min(45, p.pct + 10), text })),
        });
        setProgress({ pct: 55, text: `Extracted ${extracted.pages?.length || 0} page(s)…` });
        analyzed = await analyzeRfpPages({
          pages: extracted.pages,
          emptyPages: extracted.emptyPages,
          fileName: fileList.map((f) => f.name).join(', '),
        }, {
          onProgress: (text) => setProgress({ pct: 80, text }),
        });
        analyzed.emptyPages = analyzed.emptyPages || extracted.emptyPages;
      }

      setProgress({ pct: 100, text: 'Preparing workspace…' });
      setSession(enrichSession(analyzed));
      setTimeout(() => setStage(2), 400);
    } catch (err) {
      setProcessError(err.message || 'Analysis failed');
      setProgress({ pct: 0, text: '' });
      setStage(0);
      setSuccessMessage?.(err.message || 'Analysis failed');
      setTimeout(() => setSuccessMessage?.(''), 4000);
    } finally {
      runningRef.current = false;
    }
  }, [files, setSession, setSuccessMessage]);

  useEffect(() => {
    if (screenParams?.preloadedFile) {
      const f = screenParams.preloadedFile;
      setFiles([f]);
      runPipeline('upload', [f]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = useCallback((f) => {
    if (!f) return;
    if (f.size > CLIENT_MAX_FILE_BYTES) {
      setSuccessMessage?.('Each upload must be under 4 MB — use Try sample bid for the 72-page TAPS IFB');
      setTimeout(() => setSuccessMessage?.(''), 3500);
      return;
    }
    setFiles((prev) => {
      if (prev.length >= CLIENT_MAX_FILES) {
        setSuccessMessage?.(`Maximum ${CLIENT_MAX_FILES} PDFs`);
        setTimeout(() => setSuccessMessage?.(''), 2500);
        return prev;
      }
      if (prev.some((p) => p.name === f.name && p.size === f.size)) return prev;
      return [...prev, f];
    });
  }, [setSuccessMessage]);

  const handleFileRemove = useCallback((name) => {
    setFiles((prev) => (name ? prev.filter((f) => f.name !== name) : []));
  }, []);

  const handleUpdateAnswer = useCallback((requirementId, patch) => {
    setSession((prev) => {
      const answers = (prev.answers || []).map((a) =>
        a.requirementId === requirementId ? { ...a, ...patch } : a
      );
      const next = { ...prev, answers };
      next.goNoGo = buildGoNoGo(next);
      return next;
    });
  }, [setSession]);

  const handleSetApproval = useCallback((requirementId, value) => {
    setSession((prev) => {
      const next = {
        ...prev,
        approvals: { ...(prev.approvals || {}), [requirementId]: value },
      };
      next.goNoGo = buildGoNoGo(next);
      return next;
    });
  }, [setSession]);

  const handleUpdateLibraryEntry = useCallback((id, patch) => {
    setSession((prev) => ({
      ...prev,
      libraryEntries: (prev.libraryEntries || []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, [setSession]);

  const handleReset = useCallback(() => {
    resetSession();
    setFiles([]);
    setSampleData(null);
    setPartnerItems(null);
    setProcessError('');
    setProgress({ pct: 0, text: '' });
    setStage(0);
  }, [resetSession]);

  return (
    <AnimatedScreenWrapper>
      <div
        className="flex flex-col h-full scrollbar-hide app-header-offset"
        style={{
          backgroundColor: theme?.colors?.background,
          color: theme?.colors?.textPrimary,
          overflowY: stage === 3 ? 'hidden' : 'auto',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 max-w-content mx-auto w-full py-4 sm:py-6 flex-1 flex flex-col">
          {stage === 0 && (
            <UploadStage
              files={files}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onAnalyze={() => runPipeline('upload')}
              onSample={() => { setFiles([]); runPipeline('sample'); }}
              onLoadLegacySample={() => {
                setSampleData(structuredClone(MOCK_RESPONSE));
                setPartnerItems(structuredClone(NON_JSI_ITEMS));
                setStage(3);
              }}
              theme={theme}
              aiStatus={aiStatus}
              error={processError}
            />
          )}

          {stage === 1 && (
            <ProcessingStage
              theme={theme}
              progressPct={progress.pct}
              statusText={progress.text || 'Working…'}
            />
          )}

          {stage === 2 && session?.meta && (
            <RfpReviewStage
              session={session}
              onUpdateAnswer={handleUpdateAnswer}
              onSetApproval={handleSetApproval}
              onUpdateLibraryEntry={handleUpdateLibraryEntry}
              onReset={handleReset}
              theme={theme}
              setSuccessMessage={setSuccessMessage}
            />
          )}

          {stage === 3 && sampleData && (
            <Suspense fallback={<p className="text-sm" style={{ color: theme?.colors?.textSecondary }}>Loading sample editor…</p>}>
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStage(session?.meta ? 2 : 0)}
                  className="h-11 px-4 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: theme?.colors?.textSecondary }}
                >
                  Back
                </button>
              </div>
              <ResponseBuilder
                data={sampleData}
                onChange={setSampleData}
                partnerItems={partnerItems}
                onPartnerItemChange={(itemCode, field, value) => {
                  setPartnerItems((prev) => prev.map((item) => (item.itemCode === itemCode ? { ...item, [field]: value } : item)));
                }}
                onExport={(ok) => {
                  setSuccessMessage?.(ok ? 'Sample PDF downloaded' : 'Sample export failed');
                  setTimeout(() => setSuccessMessage?.(''), 3000);
                }}
                theme={theme}
              />
            </Suspense>
          )}
        </div>
      </div>
    </AnimatedScreenWrapper>
  );
};

export default RfpResponderScreen;
