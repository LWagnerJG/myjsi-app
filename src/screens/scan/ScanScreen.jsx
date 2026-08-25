import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppScreenLayout } from '../../components/common/AppScreenLayout.jsx';
import { DEMO_SHIPMENTS, getShipment } from './data.js';
import { RECEIPT_STATUS } from './receivingLogic.js';
import { useReceiving } from './useReceiving.js';
import { ScanHome } from './components/ScanHome.jsx';
import { ShipmentOverview } from './components/ShipmentOverview.jsx';
import { ReceivingScanner } from './components/ReceivingScanner.jsx';
import { BingoSheet } from './components/BingoSheet.jsx';
import { ReceiptReview } from './components/ReceiptReview.jsx';
import { CompletionSummary } from './components/CompletionSummary.jsx';
import { IssueSheet } from './components/IssueSheet.jsx';
import { ConnectionPanel } from './components/ConnectionPanel.jsx';

export const ScanScreen = ({ theme, screenParams, setBackHandler }) => {
    const receiving = useReceiving();
    const [stack, setStack] = useState(['home']);
    const [activeShipmentId, setActiveShipmentId] = useState(screenParams?.shipmentId || null);
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [issueState, setIssueState] = useState(null);

    const view = stack[stack.length - 1];
    const shipment = useMemo(
        () => getShipment(activeShipmentId) || null,
        [activeShipmentId]
    );

    const push = useCallback((next) => setStack((prev) => [...prev, next]), []);
    const pop = useCallback(() => {
        let popped = false;
        setStack((prev) => {
            if (prev.length <= 1) return prev;
            popped = true;
            return prev.slice(0, -1);
        });
        return popped;
    }, []);
    const resetTo = useCallback((next) => setStack([next]), []);

    useEffect(() => {
        if (screenParams?.shipmentId && screenParams.shipmentId !== activeShipmentId) {
            setActiveShipmentId(screenParams.shipmentId);
            setStack(['home', 'shipment']);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenParams?.shipmentId]);

    // Let the app header / hardware back button walk back through scan steps first.
    useEffect(() => {
        if (typeof setBackHandler !== 'function') return undefined;
        if (stack.length <= 1) {
            setBackHandler(null);
            return undefined;
        }
        return setBackHandler(() => pop());
    }, [pop, setBackHandler, stack.length]);

    const openShipment = useCallback((next) => {
        setActiveShipmentId(next.id);
        const receipt = receiving.receiptFor(next.id);
        if (receipt?.status === RECEIPT_STATUS.COMPLETED) {
            setStack(['home', 'shipment', 'summary']);
        } else {
            push('shipment');
        }
    }, [push, receiving]);

    const startScanning = useCallback(() => {
        if (!shipment) return;
        receiving.startReceiving(shipment);
        receiving.resumeReceipt(shipment);
        push('scanner');
    }, [push, receiving, shipment]);

    const openIssue = useCallback((issue, request) => {
        setIssueState({ issue: issue || null, request: request || null });
    }, []);

    const closeIssue = useCallback(() => setIssueState(null), []);

    const content = () => {
        if (view === 'home' || !shipment) {
            return (
                <ScanHome
                    theme={theme}
                    receiving={receiving}
                    onOpenShipment={openShipment}
                    onOpenConnection={() => setConnectionOpen(true)}
                />
            );
        }

        if (view === 'shipment') {
            return (
                <ShipmentOverview
                    theme={theme}
                    shipment={shipment}
                    receiving={receiving}
                    onStartScanning={startScanning}
                    onViewBingo={() => push('bingo')}
                    onViewReview={() => { receiving.startReceiving(shipment); push('review'); }}
                    onViewSummary={() => push('summary')}
                />
            );
        }

        if (view === 'scanner') {
            return (
                <ReceivingScanner
                    theme={theme}
                    shipment={shipment}
                    receiving={receiving}
                    onOpenIssue={(request) => openIssue(null, request)}
                    onViewBingo={() => push('bingo')}
                    onReview={() => push('review')}
                    onOpenConnection={() => setConnectionOpen(true)}
                />
            );
        }

        if (view === 'bingo') {
            return (
                <BingoSheet
                    theme={theme}
                    shipment={shipment}
                    receiving={receiving}
                    onReportIssue={(request) => openIssue(null, request)}
                />
            );
        }

        if (view === 'review') {
            return (
                <ReceiptReview
                    theme={theme}
                    shipment={shipment}
                    receiving={receiving}
                    onBackToScanning={() => { pop(); }}
                    onCompleted={() => setStack(['home', 'shipment', 'summary'])}
                    onOpenIssue={openIssue}
                />
            );
        }

        return (
            <CompletionSummary
                theme={theme}
                shipment={shipment}
                receiving={receiving}
                onViewReceipt={() => push('bingo')}
                onViewIssues={() => push('review')}
                onReceiveAnother={() => {
                    const next = DEMO_SHIPMENTS.find((s) => {
                        const receipt = receiving.receiptFor(s.id);
                        return !receipt || receipt.status !== RECEIPT_STATUS.COMPLETED;
                    });
                    setActiveShipmentId(next?.id || null);
                    resetTo('home');
                }}
                onOpenConnection={() => setConnectionOpen(true)}
            />
        );
    };

    return (
        <AppScreenLayout
            theme={theme}
            showTitle={false}
            maxWidthClass="max-w-4xl"
            horizontalPaddingClass="px-4 sm:px-6 lg:px-8"
            contentPaddingBottomClass="pb-10"
            contentClassName="pt-4"
        >
            {content()}

            <IssueSheet
                theme={theme}
                open={!!issueState}
                onClose={closeIssue}
                shipment={shipment || DEMO_SHIPMENTS[0]}
                receiving={receiving}
                request={issueState?.request}
                issue={issueState?.issue}
            />

            <ConnectionPanel
                theme={theme}
                open={connectionOpen}
                onClose={() => setConnectionOpen(false)}
                receiving={receiving}
                shipment={shipment}
            />
        </AppScreenLayout>
    );
};

export default ScanScreen;
