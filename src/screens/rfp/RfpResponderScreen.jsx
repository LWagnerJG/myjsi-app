/* ── RFP Responder Screen — real extract → analyze → review pipeline ── */
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { AnimatedScreenWrapper } from '../../components/common/AnimatedScreenWrapper.jsx';
import {
  UploadStage,
  ProcessingStage,
  ClarificationStage,
} from './RfpResponderStages.jsx';
import { RfpReviewStage } from './RfpReviewStage.jsx';
import {
  PROCESSING_STEPS,
  CLARIFICATION_QUESTIONS,
  MOCK_RESPONSE,
  NON_JSI_ITEMS,
} from './rfpMockData.js';
import {
  CLIENT_MAX_FILE_BYTES,
  CLIENT_MAX_FILES,
  extractRfpPdfs,
  analyzeRfpPages,
  fetchRfpStatus,
} from './rfpApi.js';
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
};

const RfpResponderScreen = ({ theme, screenParams, setSuccessMessage }) => {
  /* stage: 0 upload, 1 processing, 2 clarification, 3 review, 4 sample builder */
  const [stage, setStage] = useState(0);
  const [files, setFiles] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processError, setProcessError] = useState('');
  const [statusText, setStatusText] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [session, setSession, resetSession] = usePersistentState('rfpResponderSession', EMPTY_SESSION, { version: 2 });
  const [sampleData, setSampleData] = useState(null);
  const [partnerItems, setPartnerItems] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  /* Restore review stage if we have a persisted session */
  useEffect(() => {
    if (session?.meta?.projectName && (session.requirements?.length || session.answers?.length)) {
      setStage(3);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchRfpStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ aiConfigured: false, aiMessage: 'Could not reach /api/rfp/status' }));
  }, []);

  useEffect(() => {
    if (screenParams?.preloadedFile) {
      setFiles([screenParams.preloadedFile]);
      setStage(1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = useCallback((f) => {
    if (!f) return;
    if (f.size > CLIENT_MAX_FILE_BYTES) {
      setSuccessMessage?.('Each PDF must be under 4 MB');
      setTimeout(() => setSuccessMessage?.(''), 2500);
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

  const handleAnalyze = useCallback(() => {
    if (files.length) {
      setProcessError('');
      setStage(1);
    }
  }, [files]);

  /* Real pipeline during stage 1 */
  useEffect(() => {
    if (stage !== 1 || !files.length) return;
    let cancelled = false;

    const run = async () => {
      try {
        setCompletedSteps(0);
        setStatusText('Uploading and extracting text from your PDF…');
        const extracted = await extractRfpPdfs(files);
        if (cancelled) return;
        setCompletedSteps(2);
        setStatusText('Building requirements checklist and matching the JSI answer library…');

        const analyzed = await analyzeRfpPages({
          pages: extracted.pages,
          emptyPages: extracted.emptyPages,
          fileName: files.map((f) => f.name).join(', '),
        });
        if (cancelled) return;
        setCompletedSteps(PROCESSING_STEPS.length);

        const nextSession = {
          meta: analyzed.meta || { projectName: files[0]?.name || 'RFP' },
          requirements: analyzed.requirements || [],
          itemCodes: analyzed.itemCodes || [],
          deadlines: analyzed.deadlines || [],
          submissionRules: analyzed.submissionRules || [],
          answers: analyzed.answers || [],
          clarifyingQuestions: analyzed.clarifyingQuestions || [],
          emptyPages: analyzed.emptyPages || extracted.emptyPages || [],
          approvals: {},
          extractionMode: analyzed.extractionMode,
          aiConfigured: analyzed.aiConfigured,
          aiMessage: analyzed.aiMessage,
          fileName: analyzed.fileName || files[0]?.name || '',
          library: analyzed.library || [],
        };
        setSession(nextSession);

        const qs = (analyzed.clarifyingQuestions || [])
          .filter((q) => q?.question)
          .slice(0, 6)
          .map((q) => ({
            question: q.question,
            rfpExcerpt: q.why || '',
            choices: ['I have this info — continue', 'Flag for follow-up', 'Not sure yet'],
            _id: q.id,
          }));

        setTimeout(() => {
          if (cancelled) return;
          if (qs.length) {
            setDynamicQuestions(qs);
            setQuestionIndex(0);
            setStage(2);
          } else {
            setStage(3);
          }
        }, 600);
      } catch (err) {
        if (cancelled) return;
        setProcessError(err.message || 'Analysis failed');
        setStatusText('');
        setCompletedSteps(0);
        setStage(0);
        setSuccessMessage?.(err.message || 'Analysis failed');
        setTimeout(() => setSuccessMessage?.(''), 4000);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [stage, files, setSession, setSuccessMessage]);

  const handleAnswer = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < dynamicQuestions.length) {
      setQuestionIndex(nextIdx);
    } else {
      setStage(3);
    }
  }, [questionIndex, dynamicQuestions.length]);

  const handleUpdateAnswer = useCallback((requirementId, patch) => {
    setSession((prev) => ({
      ...prev,
      answers: (prev.answers || []).map((a) =>
        a.requirementId === requirementId ? { ...a, ...patch } : a
      ),
    }));
  }, [setSession]);

  const handleSetApproval = useCallback((requirementId, value) => {
    setSession((prev) => ({
      ...prev,
      approvals: {
        ...(prev.approvals || {}),
        [requirementId]: value,
      },
    }));
  }, [setSession]);

  const handleReset = useCallback(() => {
    resetSession();
    setFiles([]);
    setDynamicQuestions([]);
    setQuestionIndex(0);
    setSampleData(null);
    setPartnerItems(null);
    setProcessError('');
    setStage(0);
  }, [resetSession]);

  const handleLoadSample = useCallback(() => {
    setSampleData(structuredClone(MOCK_RESPONSE));
    setPartnerItems(structuredClone(NON_JSI_ITEMS));
    setStage(4);
  }, []);

  const handleSampleExport = useCallback((ok = true) => {
    setSuccessMessage?.(ok ? 'Sample PDF downloaded' : 'Sample export failed');
    setTimeout(() => setSuccessMessage?.(''), 3000);
  }, [setSuccessMessage]);

  const handlePartnerItemChange = useCallback((itemCode, field, value) => {
    setPartnerItems((prev) =>
      prev.map((item) => (item.itemCode === itemCode ? { ...item, [field]: value } : item))
    );
  }, []);

  return (
    <AnimatedScreenWrapper>
      <div
        className="flex flex-col h-full scrollbar-hide app-header-offset"
        style={{
          backgroundColor: theme?.colors?.background,
          color: theme?.colors?.textPrimary,
          overflowY: (stage === 2 || stage === 4) ? 'hidden' : 'auto',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 max-w-content mx-auto w-full py-4 sm:py-6 flex-1 flex flex-col">
          {stage === 0 && (
            <UploadStage
              file={files[0] || null}
              files={files}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onAnalyze={handleAnalyze}
              theme={theme}
              aiStatus={aiStatus}
              error={processError}
              onLoadSample={handleLoadSample}
            />
          )}

          {stage === 1 && (
            <ProcessingStage
              steps={PROCESSING_STEPS}
              completedCount={completedSteps}
              theme={theme}
              statusOverride={statusText}
            />
          )}

          {stage === 2 && (
            <ClarificationStage
              questions={dynamicQuestions.length ? dynamicQuestions : CLARIFICATION_QUESTIONS}
              currentIndex={questionIndex}
              onAnswer={handleAnswer}
              theme={theme}
            />
          )}

          {stage === 3 && session?.meta && (
            <RfpReviewStage
              session={session}
              onUpdateAnswer={handleUpdateAnswer}
              onSetApproval={handleSetApproval}
              onReset={handleReset}
              onLoadSample={handleLoadSample}
              theme={theme}
              setSuccessMessage={setSuccessMessage}
            />
          )}

          {stage === 4 && sampleData && (
            <Suspense
              fallback={(
                <div className="w-full max-w-xl mx-auto py-10 text-center">
                  <p className="text-sm" style={{ color: theme?.colors?.textSecondary }}>
                    Preparing sample response editor…
                  </p>
                </div>
              )}
            >
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStage(session?.meta ? 3 : 0)}
                  className="h-11 px-4 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    color: theme?.colors?.textSecondary,
                  }}
                >
                  Back to live responder
                </button>
              </div>
              <ResponseBuilder
                data={sampleData}
                onChange={setSampleData}
                partnerItems={partnerItems}
                onPartnerItemChange={handlePartnerItemChange}
                onExport={handleSampleExport}
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
