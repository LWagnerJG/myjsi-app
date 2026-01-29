import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PillButton, SecondaryButton } from '../../components/common/JSIButtons.jsx';
import { ArrowRight, Package } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';

// Configuration option sets
const CASEGOODS_TYPICAL_OPTIONS = ['U-Shape','L-Shape','Single Ped Desk','Adjustable Ht Desk'];
const CONFERENCE_SIZE_OPTIONS = ['30x72','42x90','48x108','54x180','60x210'];
const LOUNGE_SEATING_OPTIONS = ['Single Seater','Two Seater','Three Seater','Ottoman'];
const MATERIAL_UPCHARGE = { laminate: 1, veneer: 1.12 };
const TYPICAL_MULTIPLIERS = { 'U-Shape': 1, 'L-Shape': 0.92, 'Single Ped Desk': 0.85, 'Adjustable Ht Desk': 1.05 };

// Product selection tabs
const ProductTabs = React.memo(({ products, activeProduct, onProductSelect, theme, categoryName }) => {
  const isCasegoods = categoryName?.toLowerCase() === 'casegoods';
  return (
    <GlassCard theme={theme} className="pt-4 pb-1 px-4">
      <div className="flex space-x-8 overflow-x-auto scrollbar-hide pb-2" style={{ minHeight: 136 }}>
        {products.map(p => {
          const active = activeProduct.id === p.id;
          const baseScale = p?.thumbScale || (isCasegoods ? 1.25 : 1.0);
          return (
            <div key={p.id} className="flex flex-col items-center select-none" style={{ width: 86 }}>
              <button onClick={() => onProductSelect(p)} aria-pressed={active} className="relative w-[86px] h-[96px] flex items-center justify-center active:scale-95 transition-transform" style={{ WebkitTapHighlightColor:'transparent' }}>
                <img src={p.image} alt={p.name} loading="lazy" className={`max-w-full max-h-full object-contain transition-transform duration-500 ${active?'scale-[1.04]':'scale-100'} hover:scale-[1.06]`} style={{ transform:`scale(${baseScale})` }} />
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full" style={{ backgroundColor: theme.colors.accent }} />}
              </button>
              <span className="mt-2 text-[11px] font-semibold tracking-wide px-1 text-center leading-tight" style={{ color: theme.colors.textPrimary }}>{p.name}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
});
ProductTabs.displayName='ProductTabs';

// Hero component
const ProductHero = React.memo(({ product, theme, categoryId, onNavigate, categoryName }) => {
  const handleCompetitionClick = useCallback(()=> onNavigate(`products/category/${categoryId}/competition/${product.id}`),[categoryId,onNavigate,product.id]);
  const isChairCategory = /chair|guest|seating/i.test(categoryId) || /chair|guest|seating/i.test(categoryName||'');
  const isCasegoods = categoryId==='casegoods';
  const aspectClass = isChairCategory? 'aspect-[4/3]' : 'aspect-video';
  const [currentImg,setCurrentImg]=useState(product.image); const [prevImg,setPrevImg]=useState(null);
  useEffect(()=>{ if(product.image!==currentImg){ setPrevImg(currentImg); setCurrentImg(product.image); const t=setTimeout(()=>setPrevImg(null),450); return ()=>clearTimeout(t);} },[product.image,currentImg]);
  let baseZoom = product.heroScale ? Math.min(1.18, Math.max(0.85, product.heroScale)) : (isChairCategory?0.96:1.12); if(isCasegoods) baseZoom*=1.15;
  return (
    <div className={`relative w-full ${aspectClass} rounded-3xl overflow-hidden shadow-lg group`} style={{ backgroundColor: theme.colors.surface }}>
      {prevImg && <img src={prevImg} alt="prev" className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-500" />}
      <img src={currentImg} alt={product.name} className="absolute inset-0 w-full h-full object-contain transition-all duration-[900ms] ease-[cubic-bezier(.22,.8,.12,.99)] opacity-0 group-hover:scale-[1.02]" style={{ transform:`scale(${baseZoom})`, animation:'fadeInHero 600ms forwards' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background:'linear-gradient(to top, rgba(0,0,0,0.34), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0))' }} />
      <div className="absolute left-0 right-0 bottom-0 flex items-end justify-between px-5 pb-4 pt-8">
        <div className="leading-tight select-none">
          <h2 className="text-[30px] font-bold text-white drop-shadow-sm tracking-tight">{product.name}</h2>
          <p className="mt-1 text-[18px] font-semibold text-white/95 drop-shadow-sm">${product.price?.toLocaleString()||'TBD'}</p>
        </div>
        <div className="absolute bottom-3 right-4">
          <button onClick={handleCompetitionClick} className="flex items-center space-x-2 px-5 py-2 rounded-full font-semibold text-sm transition-all active:scale-95 backdrop-blur-sm hover:brightness-105" style={{ backgroundColor:'rgba(255,255,255,0.55)', color:theme.colors.textPrimary, border:'1px solid rgba(255,255,255,0.65)', boxShadow:'0 4px 14px rgba(0,0,0,0.18)' }}>
            <span>Competition</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});
ProductHero.displayName='ProductHero';

// Pricing Table
const PricingTable = React.memo(({ products, activeProduct, onSelectProduct, theme, categoryId, typicalLayout, onTypicalLayoutChange, conferenceSize, onConferenceSizeChange, loungeConfig, onLoungeConfigChange, guestLegType, onGuestLegTypeChange, materialMode, onMaterialModeChange }) => {
  const isGuest = categoryId==='guest';
  const isCasegoods = categoryId==='casegoods';
  const isConference = categoryId==='conference-tables';
  const isTraining = categoryId==='training-tables';
  const isLounge = categoryId==='lounge';

  // Material toggle only for these categories
  const showMaterialToggle = isCasegoods || isConference || isTraining;
  const materialOptions = ['Laminate','Veneer']; // training uses same set
  const materialActiveIndex = materialOptions.findIndex(o=>materialMode===o.toLowerCase());

  // Top pills depending on category
  let pills = [];
  if (isCasegoods) pills = CASEGOODS_TYPICAL_OPTIONS;
  else if (isConference) pills = CONFERENCE_SIZE_OPTIONS;
  else if (isLounge) pills = LOUNGE_SEATING_OPTIONS;
  else if (isGuest) pills = ['Wood','Metal'];

  const handlePillClick = (value) => {
    if (isCasegoods) onTypicalLayoutChange(value);
    else if (isConference) onConferenceSizeChange(value);
    else if (isLounge) onLoungeConfigChange(value);
    else if (isGuest) onGuestLegTypeChange(value.toLowerCase());
  };

  const sorted = useMemo(()=>[...products].sort((a,b)=>(a.price||0)-(b.price||0)),[products]);

  const computePrice = (p) => {
    if (isCasegoods) {
      const materialFactor = MATERIAL_UPCHARGE[materialMode] || 1;
      const typicalFactor = TYPICAL_MULTIPLIERS[typicalLayout] || 1;
      return Math.round((p.price||0)*materialFactor*typicalFactor/10)*10;
    }
    return p.price;
  };

  return (
    <GlassCard theme={theme} className="px-0 pb-3 pt-0 overflow-hidden animate-[fadeSlide_.55s_ease]">
      {pills.length>0 && (
        <div className="px-6 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {pills.map(pill=>{ const active = (isCasegoods && pill===typicalLayout) || (isConference && pill===conferenceSize) || (isLounge && pill===loungeConfig) || (isGuest && pill.toLowerCase()===guestLegType); return (
            <PillButton key={pill} onClick={()=>handlePillClick(pill)} isSelected={active} theme={theme} size="compact">{pill}</PillButton>
          );})}
        </div>
      )}
      {showMaterialToggle && (
        <div className="px-6 mt-3">
          <div className="relative flex h-10 w-full rounded-full border p-1 overflow-hidden font-medium text-[12px]" style={{ borderColor:theme.colors.border, backgroundColor:theme.colors.surface }}>
            <span className="absolute top-1 bottom-1 left-1 rounded-full shadow-sm transition-transform duration-300 ease-out" style={{ width:`calc((100% - .5rem)/${materialOptions.length})`, background:theme.colors.subtle, transform:`translateX(${materialActiveIndex*100}%)` }} />
            {materialOptions.map(opt=>{ const key=opt.toLowerCase(); const active=materialMode===key; return (
              <button key={opt} onClick={()=>onMaterialModeChange(key)} className={`relative z-10 flex-1 rounded-full flex items-center justify-center whitespace-nowrap transition-colors ${active? 'font-semibold':''}`} style={{ color: active? theme.colors.textPrimary: theme.colors.textSecondary }}>{opt}</button>
            );})}
          </div>
        </div>
      )}
      <div className="mx-6 h-px mt-4" style={{ backgroundColor:theme.colors.border }} />
      <div className="px-6 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: theme.colors.textSecondary }}>Series</span>
        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: theme.colors.textSecondary }}>List $</span>
      </div>
      <div className="mt-1">
        {sorted.map(p=>{ const active=p.id===activeProduct.id; const price=computePrice(p); return (
          <button key={p.id} onClick={()=>onSelectProduct(p)} disabled={active} className={`w-full group px-6 py-3 flex items-center justify-between text-[13px] transition-colors text-left ${active?'bg-transparent':'hover:bg-black/5'} rounded-none`} style={{ cursor: active?'default':'pointer' }}>
            <span className="flex items-center"><span className="inline-block w-1.5 h-4 mr-3 rounded-full transition-colors" style={{ backgroundColor: active? theme.colors.accent: theme.colors.border }} />
              <span className={`font-medium ${active?'tracking-wide':''}`} style={{ color: active? theme.colors.textPrimary: theme.colors.textSecondary }}>{p.name}</span></span>
            <span className="font-semibold" style={{ color: active? theme.colors.accent: theme.colors.textSecondary }}>${price?.toLocaleString?.()||'TBD'}</span>
          </button>
        );})}
      </div>
    </GlassCard>
  );
});
PricingTable.displayName='PricingTable';

const ErrorState = ({ theme, message='The requested item does not exist.' }) => (
  <div className="p-4"><GlassCard theme={theme} className="p-8 text-center"><Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} /><p style={{ color: theme.colors.textPrimary }}>{message}</p></GlassCard></div>
);

export const ProductComparisonScreen = ({ categoryId, onNavigate, theme }) => {
  const categoryData = PRODUCT_DATA?.[categoryId];
  const [activeProduct,setActiveProduct]=useState(categoryData?.products?.[0]);
  const isGuest = categoryId==='guest';
  const isCasegoods = categoryId==='casegoods';
  const isConference = categoryId==='conference-tables';
  const isLounge = categoryId==='lounge';
  const isTraining = categoryId==='training-tables';

  // States for configurations
  const [materialMode,setMaterialMode]=useState(isGuest?'wood':'laminate'); // wood/metal only used for guest filtering; laminate default for others
  const [typicalLayout,setTypicalLayout]=useState('U-Shape');
  const [conferenceSize,setConferenceSize]=useState('30x72');
  const [loungeConfig,setLoungeConfig]=useState('Single Seater');
  const [guestLegType,setGuestLegType]=useState('wood');

  const handleProductSelect = useCallback(p=>setActiveProduct(p),[]);
  if(!categoryData) return <ErrorState theme={theme} />;

  // Visible products filtering for guest
  const visibleProducts = useMemo(()=>{
    if(isGuest){
      return categoryData.products.filter(p => p.legType === guestLegType);
    }
    return categoryData.products;
  },[categoryData,isGuest,guestLegType]);

  useEffect(()=>{ if(isGuest && activeProduct && !visibleProducts.includes(activeProduct)){ const next=visibleProducts[0]; if(next) setActiveProduct(next);} },[isGuest,activeProduct,visibleProducts]);

  return (
    <div className="flex flex-col h-full app-header-offset">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-5">
          <div className="max-w-5xl mx-auto w-full space-y-5">
          <ProductTabs products={visibleProducts} activeProduct={activeProduct} onProductSelect={handleProductSelect} theme={theme} categoryName={categoryData.name} />
          <ProductHero product={activeProduct} theme={theme} categoryId={categoryId} onNavigate={onNavigate} categoryName={categoryData.name} />
          <PricingTable products={visibleProducts} activeProduct={activeProduct} onSelectProduct={handleProductSelect} theme={theme} categoryId={categoryId} typicalLayout={typicalLayout} onTypicalLayoutChange={setTypicalLayout} conferenceSize={conferenceSize} onConferenceSizeChange={setConferenceSize} loungeConfig={loungeConfig} onLoungeConfigChange={setLoungeConfig} guestLegType={guestLegType} onGuestLegTypeChange={setGuestLegType} materialMode={materialMode} onMaterialModeChange={setMaterialMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Inject keyframes if missing
if (typeof document !== 'undefined' && !document.getElementById('product-comp-anim')) {
  const style=document.createElement('style'); style.id='product-comp-anim'; style.innerHTML='@keyframes fadeInHero{0%{opacity:0;transform:scale(.92)}60%{opacity:1}100%{opacity:1}}@keyframes fadeSlide{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}@keyframes rowFade{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}'; document.head.appendChild(style);
}