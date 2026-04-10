import React, { useState, useMemo, useCallback } from 'react';
import { Modal } from '../../../components/common/Modal.jsx';
import { FormInput } from '../../../components/common/FormComponents.jsx';
import { SegmentedToggle } from '../../../components/common/GroupedToggle.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Package, ArrowRightLeft } from 'lucide-react';
import { 
    LOANER_POOL_PRODUCTS, 
    AVAILABILITY_STATUS, 
    STATUS_LABELS, 
    STATUS_COLORS, 
    LOAN_DURATIONS,
    SALES_REPS,
    CURRENT_USER,
    TRANSFER_STATUS,
    TRANSFER_STATUS_LABELS,
    TRANSFER_STATUS_COLORS,
    INITIAL_TRANSFER_REQUESTS,
    INITIAL_NOTIFICATIONS,
    LOAN_EVENT_TYPES
} from './data.js';

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);

import { TransferRequestModal } from './components/TransferRequestModal.jsx';
import { IncomingTransferCard } from './components/IncomingTransferCard.jsx';
import { TransfersTab } from './components/TransfersTab.jsx';
import { RequestItem, RequestDrawer } from './components/RequestDrawer.jsx';
import { ProductCard } from './components/ProductCard.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';

// ============================================
// MAIN LOANER POOL SCREEN
// ============================================
export const LoanerPoolScreen = ({ theme, setSuccessMessage, userSettings, myProjects = [], setMyProjects }) => {
    const [activeTab, setActiveTab] = useState('browse'); // browse, transfers
    const [requestItems, setRequestItems] = useState([]);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [transferModalProduct, setTransferModalProduct] = useState(null);
    
    // State for products (to track ownership changes)
    const [products, setProducts] = useState(LOANER_POOL_PRODUCTS);
    
    // State for transfer requests
    const [transferRequests, setTransferRequests] = useState(INITIAL_TRANSFER_REQUESTS);
    
    // State for loan events (audit trail) - collected for future use
    const [, setLoanEvents] = useState([]);

    const requestItemIds = useMemo(() => new Set(requestItems.map(item => item.id)), [requestItems]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const totalRequestItems = requestItems.length;

    // Count pending transfers needing action
    const pendingTransferCount = useMemo(() => {
        return transferRequests.filter(
            r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
        ).length;
    }, [transferRequests]);

    const handleAddToRequest = useCallback((e, productToAdd) => {
        e.stopPropagation();
        setRequestItems(prev => [...prev, productToAdd]);
    }, []);

    const handleRemoveFromRequest = useCallback((productId) => {
        setRequestItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    const handleSubmitRequest = useCallback(() => {
        setSuccessMessage?.(`Request for ${requestItems.length} item(s) submitted!`);
        setTimeout(() => setSuccessMessage?.(''), 3000);
        setRequestItems([]);
    }, [requestItems.length, setSuccessMessage]);

    // Transfer request handlers
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
        
        // Log event
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
                // Complete the transfer - change ownership
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
                
                // Log completion event
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
            
            // Just approve (not complete yet)
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

    return (
        <div className="flex flex-col min-h-full" style={{ paddingBottom: totalRequestItems > 0 ? '88px' : '0', backgroundColor: theme.colors.background }}>
            {/* Tab bar - using standardized SegmentedToggle */}
            <div className="px-4 pb-3" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)' }}>
                <SegmentedToggle
                    value={activeTab}
                    onChange={setActiveTab}
                    options={[
                        { value: 'browse', label: 'Browse', icon: Package },
                        { value: 'transfers', label: 'Transfers', icon: ArrowRightLeft, badge: pendingTransferCount }
                    ]}
                    size="md"
                    fullWidth
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'browse' ? (
                    <>
                        {/* Search bar */}
                        <div className="px-4 pt-4 pb-3">
                            <StandardSearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search by name or model..."
                                theme={theme}
                            />
                        </div>

                        {/* Info banner about transfers */}
                        <div className="mx-4 mb-4 p-3 rounded-xl flex items-start gap-3" style={{ backgroundColor: `${theme.colors.info}20` }}>
                            <ArrowRightLeft className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.colors.info }} />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme.colors.info }}>
                                    Intra-Rep Transfers Now Available
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                    Items on loan can now be transferred directly between reps without returning to warehouse.
                                </p>
                            </div>
                        </div>

                        {/* Product grid */}
                        <div className="px-4 pb-4 grid grid-cols-2 gap-4">
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
                            {filteredProducts.length === 0 && (
                                <div className="col-span-2 mt-8 text-center">
                                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: theme.colors.textSecondary }} />
                                    <p style={{ color: theme.colors.textSecondary }}>
                                        {searchQuery ? `No products found for "${searchQuery}"` : 'No loaner pool products available.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <TransfersTab
                        transferRequests={transferRequests}
                        products={products}
                        theme={theme}
                        onApprove={handleApproveTransfer}
                        onDecline={handleDeclineTransfer}
                    />
                )}
            </div>

            {/* Request drawer */}
            <RequestDrawer
                requestItems={requestItems}
                onRemoveFromRequest={handleRemoveFromRequest}
                onSubmitRequest={handleSubmitRequest}
                theme={theme}
                userSettings={userSettings}
                myProjects={myProjects}
                setMyProjects={setMyProjects}
            />

            {/* Modals */}
            <ProductDetailModal
                product={viewingProduct}
                theme={theme}
                onClose={() => setViewingProduct(null)}
                onTransfer={setTransferModalProduct}
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
