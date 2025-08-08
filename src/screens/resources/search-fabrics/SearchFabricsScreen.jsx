import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { StyledSelect } from '../../../components/forms/StyledSelect.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Package, CheckCircle, Search, Filter } from 'lucide-react';
import { 
    FABRIC_SUPPLIERS, 
    FABRIC_PATTERNS, 
    JSI_SERIES_OPTIONS, 
    FABRIC_GRADES,
    FABRIC_TYPES,
    TACKABLE_OPTIONS,
    SAMPLE_FABRIC_RESULTS,
    SEARCH_FORM_INITIAL
} from './data.js';
import { FABRICS_DATA } from '../../../data/products.js';

export const SearchFabricsScreen = ({ theme, onNavigate, onUpdateCart }) => {
    const [form, setForm] = useState(SEARCH_FORM_INITIAL);
    const [showGradeOptions, setShowGradeOptions] = useState(false);
    const [showFabricOptions, setShowFabricOptions] = useState(false);
    const [showTackableOptions, setShowTackableOptions] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const updateField = useCallback((field, value) => {
        setForm(f => ({ ...f, [field]: value }));
    }, []);

    const updateMulti = useCallback((field, value) => {
        setForm(f => {
            const has = f[field].includes(value);
            const arr = has ? f[field].filter(x => x !== value) : [...f[field], value];
            return { ...f, [field]: arr };
        });
        if (field === 'grade') setShowGradeOptions(true);
        if (field === 'fabricType') setShowFabricOptions(true);
        if (field === 'tackable') setShowTackableOptions(true);
    }, []);

    const handleSubmit = useCallback(e => {
        e.preventDefault();
        if (!form.supplier || !form.jsiSeries) {
            setError('Supplier and Series are required.');
            return;
        }
        setError('');
        let filtered = FABRICS_DATA?.filter(item =>
            item.supplier === form.supplier &&
            item.series === form.jsiSeries &&
            (!form.pattern || item.pattern === form.pattern) &&
            (form.grade.length === 0 || form.grade.includes(item.grade)) &&
            (form.fabricType.length === 0 || form.fabricType.includes(item.textile)) &&
            (form.tackable.length === 0 || form.tackable.includes(item.tackable))
        ) || [];
        
        // Demo fallback
        if (
            filtered.length === 0 &&
            form.supplier === 'Arc-Com' &&
            form.jsiSeries === 'Alden'
        ) {
            filtered = SAMPLE_FABRIC_RESULTS.filter(item => 
                item.supplier === form.supplier && item.series === form.jsiSeries
            );
        }
        setResults(filtered);
    }, [form]);

    const resetSearch = useCallback(() => {
        setForm(SEARCH_FORM_INITIAL);
        setResults(null);
        setShowGradeOptions(false);
        setShowFabricOptions(false);
        setShowTackableOptions(false);
        setError('');
    }, []);

    const handleOrderSample = (fabric) => {
        const newItem = {
            id: `fabric-${fabric.supplier.toLowerCase().replace(/\s/g, '-')}-${fabric.pattern.toLowerCase().replace(/\s/g, '-')}`,
            name: `${fabric.pattern} by ${fabric.supplier}`,
            category: 'Fabric',
            manufacturer: fabric.supplier,
            pattern: fabric.pattern,
            grade: fabric.grade,
            image: '', // Fabric samples typically don't have images
        };
        
        if (onUpdateCart) {
            onUpdateCart(newItem, 1);
        }
        
        if (onNavigate) {
            onNavigate('samples');
        }
    };

    const CardHeader = ({ title, children }) => (
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b" style={{ borderColor: theme.colors.border }}>
            <h3 className="font-bold text-xl" style={{ color: theme.colors.textPrimary }}>{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="Search Fabrics" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
                {!results ? (
                    <div className="space-y-6">
                        {/* Info Card */}
                        <GlassCard theme={theme} className="p-4">
                            <div className="flex items-start space-x-3">
                                <Search className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
                                <div>
                                    <h3 className="font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>
                                        Find Approved Fabrics
                                    </h3>
                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                        Search our database of pre-approved fabrics by supplier, pattern, and specifications. 
                                        All fabrics shown are compatible with JSI products.
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Search Form */}
                        <GlassCard theme={theme}>
                            <CardHeader title="Search Criteria">
                                <div 
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: theme.colors.accent + '20' }}
                                >
                                    <Search className="w-5 h-5" style={{ color: theme.colors.accent }} />
                                </div>
                            </CardHeader>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 rounded-2xl" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                                            <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{error}</p>
                                        </div>
                                    )}

                                    {/* Required Fields Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <StyledSelect
                                            theme={theme}
                                            label="Supplier *"
                                            placeholder="Select a supplier"
                                            value={form.supplier}
                                            onChange={e => updateField('supplier', e.target.value)}
                                            options={FABRIC_SUPPLIERS}
                                        />
                                        <StyledSelect
                                            theme={theme}
                                            label="JSI Series *"
                                            placeholder="Select JSI series"
                                            value={form.jsiSeries}
                                            onChange={e => updateField('jsiSeries', e.target.value)}
                                            options={JSI_SERIES_OPTIONS}
                                        />
                                    </div>

                                    {/* Optional Pattern Field */}
                                    <div className="max-w-md">
                                        <StyledSelect
                                            theme={theme}
                                            label="Pattern (Optional)"
                                            placeholder="Search for a pattern"
                                            value={form.pattern}
                                            onChange={e => updateField('pattern', e.target.value)}
                                            options={FABRIC_PATTERNS}
                                        />
                                    </div>

                                    {/* Filter Sections */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2">
                                            <Filter className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                                            <h4 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>Filters</h4>
                                        </div>

                                        {/* Grade Filter */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Grade</label>
                                            <div className="flex flex-wrap gap-2">
                                                {!showGradeOptions
                                                    ? <button
                                                        type="button"
                                                        onClick={() => setShowGradeOptions(true)}
                                                        className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                        style={{ 
                                                            backgroundColor: theme.colors.subtle, 
                                                            color: theme.colors.textPrimary 
                                                        }}
                                                    >
                                                        Any Grade
                                                    </button>
                                                    : <>
                                                        <button
                                                            type="button"
                                                            onClick={() => { updateField('grade', []); setShowGradeOptions(false); }}
                                                            className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                            style={{ 
                                                                backgroundColor: theme.colors.subtle, 
                                                                color: theme.colors.textPrimary 
                                                            }}
                                                        >
                                                            Any Grade
                                                        </button>
                                                        {FABRIC_GRADES.map(g => (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() => updateMulti('grade', g)}
                                                                className="px-4 py-2 rounded-xl font-medium transition-all"
                                                                style={form.grade.includes(g) ? {
                                                                    backgroundColor: theme.colors.accent,
                                                                    color: 'white'
                                                                } : {
                                                                    backgroundColor: theme.colors.surface,
                                                                    color: theme.colors.textPrimary,
                                                                    border: `1px solid ${theme.colors.border}`
                                                                }}
                                                            >
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </>
                                                }
                                            </div>
                                        </div>

                                        {/* Fabric Type Filter */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Fabric Type</label>
                                            <div className="flex flex-wrap gap-2">
                                                {!showFabricOptions
                                                    ? <button
                                                        type="button"
                                                        onClick={() => setShowFabricOptions(true)}
                                                        className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                        style={{ 
                                                            backgroundColor: theme.colors.subtle, 
                                                            color: theme.colors.textPrimary 
                                                        }}
                                                    >
                                                        Any Type
                                                    </button>
                                                    : <>
                                                        <button
                                                            type="button"
                                                            onClick={() => { updateField('fabricType', []); setShowFabricOptions(false); }}
                                                            className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                            style={{ 
                                                                backgroundColor: theme.colors.subtle, 
                                                                color: theme.colors.textPrimary 
                                                            }}
                                                        >
                                                            Any Type
                                                        </button>
                                                        {FABRIC_TYPES.map(t => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => updateMulti('fabricType', t)}
                                                                className="px-4 py-2 rounded-xl font-medium transition-all"
                                                                style={form.fabricType.includes(t) ? {
                                                                    backgroundColor: theme.colors.accent,
                                                                    color: 'white'
                                                                } : {
                                                                    backgroundColor: theme.colors.surface,
                                                                    color: theme.colors.textPrimary,
                                                                    border: `1px solid ${theme.colors.border}`
                                                                }}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </>
                                                }
                                            </div>
                                        </div>

                                        {/* Tackable Filter */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold" style={{ color: theme.colors.textSecondary }}>Tackable</label>
                                            <div className="flex flex-wrap gap-2">
                                                {!showTackableOptions
                                                    ? <button
                                                        type="button"
                                                        onClick={() => setShowTackableOptions(true)}
                                                        className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                        style={{ 
                                                            backgroundColor: theme.colors.subtle, 
                                                            color: theme.colors.textPrimary 
                                                        }}
                                                    >
                                                        Any Option
                                                    </button>
                                                    : <>
                                                        <button
                                                            type="button"
                                                            onClick={() => { updateField('tackable', []); setShowTackableOptions(false); }}
                                                            className="px-4 py-2 rounded-xl font-medium transition-colors"
                                                            style={{ 
                                                                backgroundColor: theme.colors.subtle, 
                                                                color: theme.colors.textPrimary 
                                                            }}
                                                        >
                                                            Any Option
                                                        </button>
                                                        {TACKABLE_OPTIONS.map(t => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => updateMulti('tackable', t.toLowerCase())}
                                                                className="px-4 py-2 rounded-xl font-medium transition-all"
                                                                style={form.tackable.includes(t.toLowerCase()) ? {
                                                                    backgroundColor: theme.colors.accent,
                                                                    color: 'white'
                                                                } : {
                                                                    backgroundColor: theme.colors.surface,
                                                                    color: theme.colors.textPrimary,
                                                                    border: `1px solid ${theme.colors.border}`
                                                                }}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
                                        style={{ 
                                            backgroundColor: theme.colors.accent, 
                                            color: 'white' 
                                        }}
                                    >
                                        Search Fabrics
                                    </button>
                                </form>
                            </div>
                        </GlassCard>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Results Header */}
                        <GlassCard theme={theme}>
                            <CardHeader title="Search Results" />
                            <div className="px-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <p style={{ color: theme.colors.textSecondary }}>
                                        Found <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{results.length}</span> matching fabric{results.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="text-right text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
                                        <div><span className="font-medium">Supplier:</span> {form.supplier}</div>
                                        {form.pattern && <div><span className="font-medium">Pattern:</span> {form.pattern}</div>}
                                        <div><span className="font-medium">Series:</span> {form.jsiSeries}</div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                        
                        {/* Results Grid */}
                        <div className="space-y-4">
                            {results.map((r, i) => (
                                <GlassCard key={i} theme={theme}>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div 
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: theme.colors.accent + '20' }}
                                                >
                                                    <CheckCircle className="w-6 h-6" style={{ color: theme.colors.accent }} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>Approved Fabric</h3>
                                                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Ready for specification</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleOrderSample(r)}
                                                className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                                style={{ 
                                                    backgroundColor: theme.colors.accent, 
                                                    color: 'white' 
                                                }}
                                            >
                                                <Package className="w-4 h-4" />
                                                <span>Order Sample</span>
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Supplier:</span>
                                                <p style={{ color: theme.colors.textPrimary }}>{r.supplier}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Pattern:</span>
                                                <p style={{ color: theme.colors.textPrimary }}>{r.pattern}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Grade:</span>
                                                <p style={{ color: theme.colors.textPrimary }}>{r.grade}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Tackable:</span>
                                                <p className="capitalize" style={{ color: theme.colors.textPrimary }}>{r.tackable}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Type:</span>
                                                <p style={{ color: theme.colors.textPrimary }}>{r.textile || 'Not Specified'}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold" style={{ color: theme.colors.textSecondary }}>Series:</span>
                                                <p style={{ color: theme.colors.textPrimary }}>{r.series}</p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                        
                        {/* New Search Button */}
                        <div className="text-center pt-4">
                            <button
                                onClick={resetSearch}
                                className="px-8 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
                                style={{ 
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.textPrimary,
                                    border: `1px solid ${theme.colors.border}`
                                }}
                            >
                                Start New Search
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};