/* ── RFP Responder Screen — Main stage machine ──────────────────── */
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { AnimatedScreenWrapper } from '../../components/common/AnimatedScreenWrapper.jsx';
import {
  UploadStage,
  ProcessingStage,
  ClarificationStage,
} from './RfpResponderStages.jsx';
import {
  PROCESSING_STEPS,
  CLARIFICATION_QUESTIONS,
  MOCK_RESPONSE,
  NON_JSI_ITEMS,
} from './rfpMockData.js';

const ResponseBuilder = React.lazy(() =>
  import('./RfpResponderComponents.jsx').then((m) => ({ default: m.ResponseBuilder }))
);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const RfpResponderScreen = ({ theme, screenParams, onNavigate, setSuccessMessage }) => {
  /* ── Stage: 0 = upload, 1 = processing, 2 = clarification, 3 = builder ── */
  const [stage, setStage] = useState(0);
  const [file, setFile] = useState(null);

  /* Stage 1 state */
  const [completedSteps, setCompletedSteps] = useState(0);

  /* Stage 2 state */
  const [questionIndex, setQuestionIndex] = useState(0);

  /* Stage 3 state */
  const [responseData, setResponseData] = useState(null);
  const [partnerItems, setPartnerItems] = useState(null);

  /* ── Handle preloaded file from home screen drop ── */
  useEffect(() => {
    if (screenParams?.preloadedFile) {
      setFile(screenParams.preloadedFile);
      setStage(1); // skip upload, go straight to processing
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── File handling ── */
  const handleFileSelect = useCallback((f) => {
    if (f.size > MAX_FILE_SIZE) {
      setSuccessMessage?.('File must be under 20 MB');
      setTimeout(() => setSuccessMessage?.(''), 2000);
      return;
    }
    setFile(f);
  }, [setSuccessMessage]);

  const handleFileRemove = useCallback(() => setFile(null), []);

  const handleAnalyze = useCallback(() => {
    if (file) setStage(1);
  }, [file]);

  /* ── Stage 1: Staggered processing animation ── */
  useEffect(() => {
    if (stage !== 1) return;
    setCompletedSteps(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCompletedSteps(step);
      if (step >= PROCESSING_STEPS.length) {
        clearInterval(interval);
        // Auto-advance after final step completes
        setTimeout(() => setStage(2), 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [stage]);

  /* ── Stage 2: Handle answer selection ── */
  const handleAnswer = useCallback((choiceIdx) => {
    const nextIdx = questionIndex + 1;
    if (nextIdx < CLARIFICATION_QUESTIONS.length) {
      setQuestionIndex(nextIdx);
    } else {
      // All answered — build response
      setResponseData(structuredClone(MOCK_RESPONSE));
      setPartnerItems(structuredClone(NON_JSI_ITEMS));
      setStage(3);
    }
  }, [questionIndex]);

  const handlePartnerItemChange = useCallback((itemCode, field, value) => {
    setPartnerItems((prev) =>
      prev.map((item) => item.itemCode === itemCode ? { ...item, [field]: value } : item)
    );
  }, []);

  /* ── Stage 3: Export actions ── */
  const handleExport = useCallback(() => {
    setSuccessMessage?.('PDF downloaded successfully');
    setTimeout(() => setSuccessMessage?.(''), 3000);
  }, [setSuccessMessage]);

  const handleSaveOpportunity = useCallback(() => {
    setSuccessMessage?.('Saved as opportunity');
    setTimeout(() => setSuccessMessage?.(''), 2500);
  }, [setSuccessMessage]);

  /* ── Render ── */
  return (
    <AnimatedScreenWrapper>
      <div
        className="flex flex-col h-full scrollbar-hide app-header-offset"
        style={{ backgroundColor: theme?.colors?.background, color: theme?.colors?.textPrimary, overflowY: (stage === 2 || stage === 3) ? 'hidden' : 'auto' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-4 sm:py-6 flex-1 flex flex-col">
          {stage === 0 && (
            <UploadStage
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onAnalyze={handleAnalyze}
              theme={theme}
            />
          )}

          {stage === 1 && (
            <ProcessingStage
              steps={PROCESSING_STEPS}
              completedCount={completedSteps}
              theme={theme}
            />
          )}

          {stage === 2 && (
            <ClarificationStage
              questions={CLARIFICATION_QUESTIONS}
              currentIndex={questionIndex}
              onAnswer={handleAnswer}
              theme={theme}
            />
          )}

          {stage === 3 && responseData && (
            <Suspense
              fallback={(
                <div className="w-full max-w-xl mx-auto py-10 text-center">
                  <p className="text-sm" style={{ color: theme?.colors?.textSecondary }}>
                    Preparing response editor...
                  </p>
                </div>
              )}
            >
              <ResponseBuilder
                data={responseData}
                onChange={setResponseData}
                partnerItems={partnerItems}
                onPartnerItemChange={handlePartnerItemChange}
                onExport={handleExport}
                onSave={handleSaveOpportunity}
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
