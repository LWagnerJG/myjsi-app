import React, { useState, useMemo, useCallback } from 'react';
import { SegmentedToggle } from '../../../components/common/GroupedToggle.jsx';
import { TabContent } from '../../../components/common/TabContent.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { ScreenTopChrome } from '../../../components/common/ScreenTopChrome.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { Package, ArrowRightLeft } from 'lucide-react';
import {
    LOANER_POOL_PRODUCTS,
    AVAILABILITY_STATUS,
    TRANSFER_STATUS,
    INITIAL_TRANSFER_REQUESTS,
    CURRENT_USER,
    LOAN_EVENT_TYPES,
    SALES_REPS,
} from './data.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);

import { TransferRequestModal } from './components/TransferRequestModal.jsx';
import { TransfersTab } from './components/TransfersTab.jsx';
import { RequestDrawer } from './components/RequestDrawer.jsx';
import { ProductCard } from './components/ProductCard.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';

const TAB_OPTIONS = [
    { value: 'browse', label: 'Browse', icon: Package },
    { value: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
];

export const LoanerPoolScreen = ({ theme, setSuccessMessage, userSettings, myProjects = [], setMyProjects }) => {
    const [activeTab, setActiveTab] = useState('browse');
    const [requestItems, setRequestItems] = useState([]);
    const [requestOpen, setRequestOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [transferModalProduct, setTransferModalProduct] = useState(null);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    const [products, setProducts] = useState(LOANER_POOL_PRODUCTS);
    const [transferRequests, setTransferRequests] = useState(INITIAL_TRANSFER_REQUESTS);
    const [, setLoanEvents] = useState([]);

    const isDark = isDarkTheme(theme);
    const c = theme.colors;

    const requestItemIds = useMemo(() => new Set(requestItems.map(item => item.id)), [requestItems]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const totalRequestItems = requestItems.length;

    const pendingTransferCount = useMemo(() => {
        return transferRequests.filter(
            r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
        ).length;
    }, [transferRequests]);

    const tabOptions = useMemo(() => TAB_OPTIONS.map((opt) => (
        opt.value === 'transfers' ? { ...opt, badge: pendingTransferCount } : opt
    )), [pendingTransferCount]);

    const handleAddToRequest = useCallback((e, productToAdd) => {
        e?.stopPropagation?.();
        setRequestItems(prev => {
            if (prev.some(item => item.id === productToAdd.id)) return prev;
            return [...prev, productToAdd];
        });
    }, []);

    const handleRemoveFromRequest = useCallback((productId) => {
        setRequestItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        setSuccessMessage?.(`Request for ${requestItems.length} item(s) submitted!`);
        setTimeout(() => setSuccessMessage?.(''), 3000);
        setRequestItems([]);
        setRequestOpen(false);
    }, [requestItems.length, setSuccessMessage]);

    const handleSubmitTransfer = useCallback((transferData) => {
        const newRequest = {
            id: `tr-${Date.now()}`,
            ...transferData,
            status: TRANSFER_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            decidedAt: null,
            decisionReason: null
        };

        setTransferRequests(prev => [newRequest, ...prev]);

        setLoanEvents(prev => [...prev, {
            id: `evt-${Date.now()}`,
            itemId: transferData.itemId,
            eventType: LOAN_EVENT_TYPES.TRANSFER_REQUESTED,
            repId: CURRENT_USER.id,
            timestamp: new Date().toISOString(),
            notes: `Transfer requested from ${getRepById(transferData.fromRepId)?.name} to ${CURRENT_USER.name}`
        }]);

        setSuccessMessage?.('Transfer request sent!');
        setTimeout(() => setSuccessMessage?.(''), 3000);
    }, [setSuccessMessage]);

    const handleApproveTransfer = useCallback((requestId, isComplete = false) => {
        setTransferRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;

            if (isComplete || r.status === TRANSFER_STATUS.APPROVED) {
                setProducts(prods => prods.map(p => {
                    if (p.id === r.itemId) {
                        return {
                            ...p,
                            currentHolderRepId: r.toRepId,
                            location: `In field with ${getRepById(r.toRepId)?.name}`,
                            status: AVAILABILITY_STATUS.OUT_FOR_LOAN
                        };
                    }
                    return p;
                }));

                setLoanEvents(evts => [...evts, {
                    id: `evt-${Date.now()}`,
                    itemId: r.itemId,
                    eventType: LOAN_EVENT_TYPES.TRANSFER_COMPLETED,
                    repId: r.toRepId,
                    timestamp: new Date().toISOString(),
                    notes: `Transfer completed: ${getRepById(r.fromRepId)?.name} → ${getRepById(r.toRepId)?.name}`
                }]);

                setSuccessMessage?.('Transfer completed! Ownership updated.');
                setTimeout(() => setSuccessMessage?.(''), 3000);

                return { ...r, status: TRANSFER_STATUS.COMPLETED, decidedAt: new Date().toISOString() };
            }

            setLoanEvents(evts => [...evts, {
                id: `evt-${Date.now()}`,
                itemId: r.itemId,
                eventType: LOAN_EVENT_TYPES.TRANSFER_APPROVED,
                repId: CURRENT_USER.id,
                timestamp: new Date().toISOString(),
                notes: `Transfer approved by ${CURRENT_USER.name}`
            }]);

            setSuccessMessage?.('Transfer approved! Awaiting handoff confirmation.');
            setTimeout(() => setSuccessMessage?.(''), 3000);

            return { ...r, status: TRANSFER_STATUS.APPROVED, decidedAt: new Date().toISOString() };
        }));
    }, [setSuccessMessage]);

    const handleDeclineTransfer = useCallback((requestId, reason) => {
        setTransferRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;

            setLoanEvents(evts => [...evts, {
                id: `evt-${Date.now()}`,
                itemId: r.itemId,
                eventType: LOAN_EVENT_TYPES.TRANSFER_DECLINED,
                repId: CURRENT_USER.id,
                timestamp: new Date().toISOString(),
                notes: `Transfer declined by ${CURRENT_USER.name}${reason ? `: ${reason}` : ''}`
            }]);

            setSuccessMessage?.('Transfer request declined.');
            setTimeout(() => setSuccessMessage?.(''), 3000);

            return {
                ...r,
                status: TRANSFER_STATUS.DECLINED,
                decidedAt: new Date().toISOString(),
                decisionReason: reason || null
            };
        }));
    }, [setSuccessMessage]);

    const showTransferBanner = activeTab === 'browse' && !bannerDismissed;

    return (
        <div
            className="flex flex-col min-h-full app-header-offset"
            style={{
                paddingBottom: totalRequestItems > 0 && !requestOpen ? '5.5rem' : '0',
                backgroundColor: c.background,
            }}
        >
            <ScreenTopChrome theme={theme} contentClassName="pt-2 pb-2">
                <div className="w-full md:w-auto md:max-w-[280px]">
                    <SegmentedToggle
                        value={activeTab}
                        onChange={setActiveTab}
                        options={tabOptions}
                        size="sm"
                        theme={theme}
                        fullWidth
                        className="md:!inline-flex md:!w-auto"
                    />
                </div>
            </ScreenTopChrome>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-content mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
                    <TabContent activeKey={activeTab}>
                        {activeTab === 'browse' ? (
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                    <div className="w-full sm:max-w-xs md:max-w-sm">
                                        <StandardSearchBar
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            placeholder="Search name or model"
                                            theme={theme}
                                            style={{ height: 44 }}
                                            inputClassName="text-[0.875rem]"
                                        />
                                    </div>
                                    <p className="text-[0.6875rem] font-medium tabular-nums sm:text-right" style={{ color: c.textSecondary, opacity: 0.72 }}>
                                        {filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}
                                        {searchQuery ? ` matching “${searchQuery}”` : ' in pool'}
                                    </p>
                                </div>

                                {showTransferBanner ? (
                                    <div
                                        className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(91,123,140,0.1)' : `${c.info}10`,
                                            border: `1px solid ${isDark ? 'rgba(91,123,140,0.18)' : `${c.info}22`}`,
                                        }}
                                    >
                                        <ArrowRightLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.info }} aria-hidden="true" />
                                        <p className="flex-1 min-w-0 text-[0.75rem] leading-snug" style={{ color: c.textSecondary }}>
                                            <span className="font-semibold" style={{ color: c.textPrimary }}>Rep-to-rep transfers</span>
                                            {' '}— request items on loan without sending them back to the warehouse.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setBannerDismissed(true)}
                                            className="flex-shrink-0 text-[0.6875rem] font-semibold px-2 py-1 rounded-full focus-ring"
                                            style={{ color: c.textSecondary }}
                                            aria-label="Dismiss"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : null}

                                {filteredProducts.length > 0 ? (
                                    <div
                                        className="grid gap-3 sm:gap-4"
                                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 176px), 1fr))' }}
                                    >
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                theme={theme}
                                                isInRequest={requestItemIds.has(product.id)}
                                                onView={setViewingProduct}
                                                onTransfer={setTransferModalProduct}
                                                onAdd={handleAddToRequest}
                                                onRemove={handleRemoveFromRequest}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center">
                                        <Package className="w-10 h-10 mx-auto mb-3 opacity-25" style={{ color: c.textSecondary }} aria-hidden="true" />
                                        <p className="text-sm font-medium" style={{ color: c.textPrimary }}>No pieces found</p>
                                        <p className="text-[0.75rem] mt-1" style={{ color: c.textSecondary }}>
                                            {searchQuery ? 'Try a different search term.' : 'The loaner pool is empty right now.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <TransfersTab
                                transferRequests={transferRequests}
                                products={products}
                                theme={theme}
                                onApprove={handleApproveTransfer}
                                onDecline={handleDeclineTransfer}
                            />
                        )}
                    </TabContent>
                </div>
            </div>

            <RequestDrawer
                open={requestOpen}
                onOpenChange={setRequestOpen}
                requestItems={requestItems}
                onRemoveFromRequest={handleRemoveFromRequest}
                onSubmitRequest={handleSubmitRequest}
                theme={theme}
                userSettings={userSettings}
                myProjects={myProjects}
                setMyProjects={setMyProjects}
            />

            <ProductDetailModal
                product={viewingProduct}
                theme={theme}
                onClose={() => setViewingProduct(null)}
                onTransfer={setTransferModalProduct}
                isInRequest={viewingProduct ? requestItemIds.has(viewingProduct.id) : false}
                onAdd={handleAddToRequest}
                onRemove={handleRemoveFromRequest}
            />
            <TransferRequestModal
                show={!!transferModalProduct}
                onClose={() => setTransferModalProduct(null)}
                product={transferModalProduct}
                theme={theme}
                myProjects={myProjects}
                onSubmitTransfer={handleSubmitTransfer}
            />
        </div>
    );
};
