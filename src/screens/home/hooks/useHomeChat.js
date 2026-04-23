// Custom hook for the Elliott AI chat assistant on the home screen
import { useState, useCallback, useRef, useEffect } from 'react';
import { LEAD_TIMES_DATA, QUICKSHIP_SERIES } from '../../resources/lead-times/data.js';
import { ORDER_DATA } from '../../orders/data.js';
import { COMMISSION_RATES_DATA, BONUS_STRUCTURE } from '../../resources/commission-rates/data.js';
import { CONTRACTS_DATA } from '../../resources/contracts/data.js';
import { SAMPLE_POLICIES } from '../../resources/sample-discounts/data.js';
import { COM_YARDAGE_DATA } from '../../resources/request-com-yardage/data.js';

/* ── Knowledge base built from live app data ─────────────────────────── */

const ALL_SERIES = [...new Set(LEAD_TIMES_DATA.map(d => d.series))].sort();

const CATEGORIES = {
    swivel:     ['Arwyn', 'Bourne', 'Cosgrove', 'Connect', 'Garvey RS', 'Gatsby', 'Knox', 'Kyla', 'Mackey', 'Moto', 'Protocol', 'Proxy', 'Satisse', 'Sosa', 'Ziva'],
    guest:      ['Addison', 'Americana', 'Ansen', 'Boston', 'Bryn', 'Class Act', 'Encore', 'Finn', 'Finn Nu', 'Harbor', 'Henley', 'Indie', 'Jude', 'Kindera', 'Madison', 'Millie', 'Mittle', 'Newton', 'Oxley', 'Pillows', 'Ramona', 'Ria', 'Scroll', 'Teekan', 'Totem', 'Trinity', 'Wink'],
    lounge:     ['Avini', 'BeSPACE', 'Caav', 'Hoopz', 'Poet', 'Somna'],
    conference: ['Arwyn', 'Draft', 'Vision'],
    casegoods:  ['Anthology', 'Brogan', 'Copilot', 'Finale', 'Forge', 'Lincoln', 'Lok', 'Nosh', 'Privacy', 'Prost', 'Romy', 'Trail', 'Walden', 'Wellington'],
    benching:   ['Flux', 'Moto', 'Native', 'Reef', 'Vision'],
};

const NAV = {
    orders:       'View Your Orders',
    products:     'Browse Products',
    projects:     'View Projects',
    samples:      'Request Samples',
    community:    'Visit Community',
    marketplace:  'Explore Marketplace',
    members:      'Find Members',
    settings:     'Open Settings',
    help:         'Get Help',
    feedback:     'Share Feedback',
    leadTimes:    'Check Lead Times',
    commissions:  'View Commissions',
    contracts:    'View Contracts',
    presentations:'Browse Presentations',
    fabrics:      'Search Fabrics',
    loanerPool:   'View Loaner Pool',
    tradeshows:   'See Tradeshows',
    comYardage:   'COM Yardage Info',
    sampleDisc:   'Sample Discounts',
};

/* ── Route mapping for smart navigation buttons ──────────────────────── */

const NAV_ROUTES = {
    orders:        'orders',
    products:      'products',
    projects:      'projects',
    samples:       'samples',
    community:     'community',
    marketplace:   'marketplace',
    members:       'members',
    settings:      'settings',
    help:          'help',
    feedback:      'feedback',
    leadTimes:     'resources/lead-times',
    commissions:   'resources/commission-rates',
    contracts:     'resources/contracts',
    presentations: 'presentations',
    fabrics:       'resources/search-fabrics',
    loanerPool:    'resources/loaner-pool',
    tradeshows:    'resources/tradeshows',
    comYardage:    'resources/request-com-yardage',
    sampleDisc:    'resources/sample-discounts',
};

/** Build a smart-link action object from a NAV key */
function act(navKey) {
    return { label: NAV[navKey], route: NAV_ROUTES[navKey] };
}

/* ── Intent detection ────────────────────────────────────────────────── */

const INTENT_PATTERNS = [
    { intent: 'greeting',      test: t => /\b(hello|hi|hey|howdy|good morning|good afternoon|what'?s up)\b/.test(t) },
    { intent: 'thanks',        test: t => /\b(thank|thanks|thx|appreciate)\b/.test(t) },
    { intent: 'whoAreYou',     test: t => /\b(who are you|what are you|your name|about you|introduce)\b/.test(t) },
    { intent: 'leadTimeSeries',test: t => /\b(lead ?time|ship|deliver|how long|when.*ready|production time|turnaround)\b/.test(t) && findSeriesInText(t) },
    { intent: 'leadTimeGen',   test: t => /\b(lead ?time|ship|deliver|how long|when.*ready|production time|turnaround)\b/.test(t) },
    { intent: 'quickShip',     test: t => /\b(quick ?ship|fast ?ship|expedit|rush|12.*day|10.*day)\b/.test(t) },
    { intent: 'orderLookup',   test: t => /\b(\d{5,6}[-–]\d{2})\b/.test(t) || /\b(order|po|purchase order)\b.*\b\d{4,}/.test(t) },
    { intent: 'orderGen',      test: t => /\b(order|po |purchase order|shipment|track|ack|acknowledge)\b/.test(t) },
    { intent: 'commissionRate', test: t => /\b(commission|rate|rep rate|spiff|comp plan)\b/.test(t) },
    { intent: 'bonus',         test: t => /\b(bonus|incentive|quarterly|annual target|kicker)\b/.test(t) },
    { intent: 'contract',      test: t => /\b(contract|omnia|tips|premier|gsa|cooperative|government)\b/.test(t) },
    { intent: 'sampleDiscount',test: t => /\b(sample discount|sample program|sample pricing|sample rate)\b/.test(t) },
    { intent: 'comYardage',    test: t => /\b(com |com$|customer.*own.*material|yardage|com yard|fabric yard)\b/.test(t) },
    { intent: 'fabric',        test: t => /\b(fabric|upholster|textile|maharam|designtex|momentum)\b/.test(t) },
    { intent: 'finish',        test: t => /\b(finish|laminate|veneer|wood finish|color option|stain)\b/.test(t) },
    { intent: 'product',       test: t => /\b(product|series|catalog|browse|model)\b/.test(t) },
    { intent: 'seriesLookup',  test: t => !!findSeriesInText(t) },
    { intent: 'category',      test: t => /\b(swivel|guest|lounge|conference|casegood|bench|training)\b/.test(t) },
    { intent: 'project',       test: t => /\b(project|lead|pipeline|opportunit|bid|spec|install)\b/.test(t) },
    { intent: 'sample',        test: t => /\b(sample|request sample|sample cart|sample request)\b/.test(t) },
    { intent: 'marketplace',   test: t => /\b(marketplace|elliott ?buck|reward|points|store)\b/.test(t) },
    { intent: 'community',     test: t => /\b(communit|post|board|channel|social)\b/.test(t) },
    { intent: 'presentation',  test: t => /\b(present|deck|slide|promo material)\b/.test(t) },
    { intent: 'tradeshow',     test: t => /\b(trade ?show|neocon|event|exhibit)\b/.test(t) },
    { intent: 'loanerPool',    test: t => /\b(loaner|pool|borrow|transfer)\b/.test(t) },
    { intent: 'navigation',    test: t => /\b(where|how do i|navigate|find|go to|open|get to)\b/.test(t) },
    { intent: 'help',          test: t => /\b(help|support|contact|feedback|issue)\b/.test(t) },
];

function findSeriesInText(text) {
    const lower = text.toLowerCase();
    // Check longest names first to avoid partial matches
    const sorted = [...ALL_SERIES].sort((a, b) => b.length - a.length);
    return sorted.find(s => lower.includes(s.toLowerCase()));
}

function matchIntent(text) {
    const lower = text.toLowerCase();
    for (const p of INTENT_PATTERNS) {
        if (p.test(lower)) return p.intent;
    }
    return null;
}

/* ── Reply generator ─────────────────────────────────────────────────── */

function generateReply(text) {
    const intent = matchIntent(text);
    const series = findSeriesInText(text);

    switch (intent) {

    case 'greeting':
        return "Hello! I'm Elliott, your JSI sales assistant. I have real-time knowledge of **lead times**, **orders**, **commission rates**, **contracts**, and all **73 JSI product series**. What can I help you with?";

    case 'thanks':
        return "You're welcome! Let me know if there's anything else I can help with.";

    case 'whoAreYou':
        return "I'm **Elliott**, your built-in JSI sales assistant. I can answer questions about:\n\n• **Lead times** for any of the 73 JSI series\n• **QuickShip** availability (12 business days)\n• **Order** tracking and status\n• **Commission rates**, bonuses, and spiffs\n• **Contracts** (Omnia, TIPS, Premier, GSA)\n• **Sample discounts** and COM yardage\n• **Navigation** — I can point you to any screen\n\nJust ask!";

    case 'leadTimeSeries': {
        const entries = LEAD_TIMES_DATA.filter(d => d.series.toLowerCase() === series.toLowerCase());
        const isQS = QUICKSHIP_SERIES.some(s => s.toLowerCase() === series.toLowerCase());
        if (!entries.length) return `I don't have lead-time data for "${series}". Check **${NAV.leadTimes}** for the full list.`;
        const lines = entries.map(e => `• **${e.type}**: ${e.weeks} weeks`).join('\n');
        const qsNote = isQS ? `\n\n⚡ **${series}** is also available through the **QuickShip** program (12 business days).` : '';
        return `**${series} Lead Times:**\n${lines}${qsNote}\n\nView all lead times at **${NAV.leadTimes}**.`;
    }

    case 'leadTimeGen': {
        const fastest = [...LEAD_TIMES_DATA].sort((a, b) => a.weeks - b.weeks).slice(0, 5);
        const lines = fastest.map(e => `• **${e.series}** (${e.type}) — ${e.weeks} wk`).join('\n');
        return `JSI lead times range from **3–10 weeks** depending on series & type.\n\n**Fastest right now:**\n${lines}\n\n⚡ **QuickShip** series ship in **12 business days**: ${QUICKSHIP_SERIES.join(', ')}.\n\nAsk me about a specific series, or visit **${NAV.leadTimes}**.`;
    }

    case 'quickShip':
        return `**JSI QuickShip Program** — delivers in **12 business days**.\n\nEligible series:\n${QUICKSHIP_SERIES.map(s => `• ${s}`).join('\n')}\n\nQuickShip applies to standard models with in-stock fabrics. Visit **${NAV.leadTimes}** for details.`;

    case 'orderLookup': {
        const numMatch = text.match(/(\d{5,6}[-–]\d{2})/);
        if (numMatch) {
            const orderNum = numMatch[1].replace('–', '-');
            const order = ORDER_DATA.find(o => o.orderNumber === orderNum);
            if (order) {
                const ship = new Date(order.shipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const items = order.lineItems.map(li => `  • ${li.name} (${li.model}) × ${li.quantity}`).join('\n');
                return `**Order ${order.orderNumber}**\n• **Status:** ${order.status}\n• **Company:** ${order.company}\n• **Project:** ${order.details}\n• **Net:** $${order.net.toLocaleString()}\n• **Est. Ship:** ${ship}\n• **Discount:** ${order.discount}\n\n**Line Items:**\n${items}\n\nOpen **${NAV.orders}** for full details.`;
            }
            return `I couldn't find order **${orderNum}** in the current data. Double-check the number or search in **${NAV.orders}**.`;
        }
        return `I can look up a specific order — just give me the order number (e.g. **449645-00**). Or browse all orders in **${NAV.orders}**.`;
    }

    case 'orderGen': {
        const statuses = {};
        ORDER_DATA.forEach(o => { statuses[o.status] = (statuses[o.status] || 0) + 1; });
        const statusLines = Object.entries(statuses).map(([s, c]) => `• **${s}:** ${c}`).join('\n');
        const totalNet = ORDER_DATA.reduce((sum, o) => sum + o.net, 0);
        return `**Your Orders Overview** (${ORDER_DATA.length} total orders, $${totalNet.toLocaleString()} net)\n\n${statusLines}\n\nYou can search by PO, filter by status, or ask me about a specific order number. Go to **${NAV.orders}**.`;
    }

    case 'commissionRate': {
        const rates = COMMISSION_RATES_DATA.standard.slice(0, 5);
        const lines = rates.map(r => `• ${r.discount} → Rep **${r.rep}%** · Spiff **${r.spiff}%**`).join('\n');
        return `**Commission Rate Schedule** (first 5 tiers):\n${lines}\n\n…and ${COMMISSION_RATES_DATA.standard.length - 5} more tiers.\n\nSee the full schedule at **${NAV.commissions}**.`;
    }

    case 'bonus': {
        const q = BONUS_STRUCTURE.quarterly.thresholds;
        const a = BONUS_STRUCTURE.annual.thresholds;
        const qLines = q.map(t => `• $${t.target.toLocaleString()} → **${t.bonus}** — ${t.description}`).join('\n');
        const aLines = a.map(t => `• $${t.target.toLocaleString()} → **${t.bonus}** — ${t.description}`).join('\n');
        return `**Quarterly Bonus Targets:**\n${qLines}\n\n**Annual Bonus Targets:**\n${aLines}\n\nFull details at **${NAV.commissions}**.`;
    }

    case 'contract': {
        const lower = text.toLowerCase();
        const key = ['omnia', 'tips', 'premier', 'gsa'].find(k => lower.includes(k));
        if (key && CONTRACTS_DATA[key]) {
            const c = CONTRACTS_DATA[key];
            const discLines = c.discounts.slice(0, 4).map(d =>
                `• ${d.label}: Discount **${d.discount}** · Rep **${d.repCommission}**`
            ).join('\n');
            return `**${c.name}**\n\n${discLines}\n${c.discounts.length > 4 ? `\n…and ${c.discounts.length - 4} more tiers.` : ''}\n\nView full documents at **${NAV.contracts}**.`;
        }
        const names = Object.values(CONTRACTS_DATA).map(c => `• **${c.name}**`).join('\n');
        return `**Active JSI Contracts:**\n${names}\n\nAsk me about a specific contract (Omnia, TIPS, Premier, GSA) or visit **${NAV.contracts}**.`;
    }

    case 'sampleDiscount': {
        const lines = SAMPLE_POLICIES.map(d => `• **${d.title}** — **${d.discount}% off**`).join('\n');
        return `**Sample Discount Programs:**\n${lines}\n\nFull details at **${NAV.sampleDisc}**.`;
    }

    case 'comYardage': {
        const reqs = COM_YARDAGE_DATA.defaultYardageRequirements;
        const lines = Object.entries(reqs).map(([type, v]) =>
            `• **${type.replace(/-/g, ' ')}**: ${v.min}–${v.recommended} yards`
        ).join('\n');
        return `**COM Yardage Requirements:**\n${lines}\n\nTurnaround: **${COM_YARDAGE_DATA.estimatedTurnaroundTime}**\nContact: ${COM_YARDAGE_DATA.supportContact.name} (${COM_YARDAGE_DATA.supportContact.email})\n\nSubmit a request at **${NAV.comYardage}**.`;
    }

    case 'fabric':
        return `Browse the full fabric database (supplier, pattern, grade, tackability) at **${NAV.fabrics}**. You can filter by Maharam, Designtex, Momentum, and more.\n\nFor COM fabrics, ask me about **COM yardage** requirements.`;

    case 'finish':
        return `JSI offers a wide range of finishes including laminates, veneers, and wood stains. Browse all available options in the **${NAV.products}** screen — use the Finishes tab for side-by-side comparison.`;

    case 'product':
        return `The **${NAV.products}** screen lets you browse all JSI product lines, finishes, and fabrics. You can compare products and view specs.\n\nJSI has **${ALL_SERIES.length} product series** across 6 categories. Ask me about a specific series for detailed lead times!`;

    case 'seriesLookup': {
        const entries = LEAD_TIMES_DATA.filter(d => d.series.toLowerCase() === series.toLowerCase());
        const isQS = QUICKSHIP_SERIES.some(s => s.toLowerCase() === series.toLowerCase());
        const cats = Object.entries(CATEGORIES).filter(([, arr]) => arr.some(s => s.toLowerCase() === series.toLowerCase())).map(([k]) => k);
        const ltLines = entries.length ? entries.map(e => `• ${e.type}: **${e.weeks} weeks**`).join('\n') : '• Lead time data not available';
        return `**${series}**\n${cats.length ? `Category: ${cats.join(', ')}\n` : ''}${isQS ? '⚡ **QuickShip eligible** (12 business days)\n' : ''}\n**Lead Times:**\n${ltLines}\n\nView in **${NAV.products}** or check **${NAV.leadTimes}** for full details.`;
    }

    case 'category': {
        const lower = text.toLowerCase();
        const cat = Object.keys(CATEGORIES).find(k => lower.includes(k));
        if (cat) {
            const list = CATEGORIES[cat];
            return `**${cat.charAt(0).toUpperCase() + cat.slice(1)} Series** (${list.length}):\n${list.map(s => `• ${s}`).join('\n')}\n\nBrowse them all in **${NAV.products}**.`;
        }
        return `JSI product categories: **Swivel**, **Guest**, **Lounge**, **Conference**, **Casegoods**, **Benching**. Ask me about any category!`;
    }

    case 'project':
        return `Your project pipeline lives in **${NAV.projects}**. You can:\n\n• Add new leads & opportunities\n• Track stages (Discovery → Won/Lost)\n• Manage installs and follow-ups\n• View pipeline value & win rate\n\nAsk me about **commissions** to see how projects translate to earnings.`;

    case 'sample':
        return `Head to **${NAV.samples}** to browse and request product samples. Add items to your cart and submit a request.\n\nFor **sample discounts** by series, ask me or visit **${NAV.sampleDisc}**.`;

    case 'marketplace':
        return `The **${NAV.marketplace}** is where you spend **ElliottBucks** — earned through sales milestones, community engagement, and completed trainings. Browse the rewards store to redeem points for gift cards, JSI swag, and more.`;

    case 'community':
        return `The **${NAV.community}** tab lets you post updates, share wins, and engage with other JSI reps. You'll find channels, polls, and a shared library.\n\nUse **My Board** in the Community screen to pin important posts.`;

    case 'presentation':
        return `Find marketing presentations and sales decks at **${NAV.presentations}**. You can:\n\n• Browse JSI-curated decks\n• Add presentations to "My Decks"\n• Build custom decks with the **Presentation Builder**\n• Download and share directly`;

    case 'tradeshow':
        return `View upcoming tradeshows and events at **${NAV.tradeshows}**. You'll see dates, locations, booth info, and can RSVP or add events to your calendar.`;

    case 'loanerPool':
        return `The **${NAV.loanerPool}** tracks shared demo furniture. You can browse available pieces, request loaners, and manage incoming transfer requests from other reps.`;

    case 'navigation': {
        const lower = text.toLowerCase();
        const screenHints = [
            [/order/,        NAV.orders],
            [/product/,      NAV.products],
            [/project|lead/, NAV.projects],
            [/sample(?!.*disc)/, NAV.samples],
            [/communit/,     NAV.community],
            [/market|buck/,  NAV.marketplace],
            [/member/,       NAV.members],
            [/setting/,      NAV.settings],
            [/lead ?time/,   NAV.leadTimes],
            [/commission/,   NAV.commissions],
            [/contract/,     NAV.contracts],
            [/present|deck/, NAV.presentations],
            [/fabric/,       NAV.fabrics],
            [/loaner|pool/,  NAV.loanerPool],
            [/trade ?show/,  NAV.tradeshows],
            [/com |yardage/,  NAV.comYardage],
            [/sample.*disc/,  NAV.sampleDisc],
            [/help|support/, NAV.help],
            [/feedback/,     NAV.feedback],
        ];
        for (const [re, screen] of screenHints) {
            if (re.test(lower)) return `You'll find that in **${screen}**. Tap the tile on your home screen or use the navigation menu.`;
        }
        return `Here are the main areas of the app:\n\n${Object.values(NAV).map(n => `• **${n}**`).join('\n')}\n\nTell me what you're looking for and I'll point you to the right screen!`;
    }

    case 'help':
        return `For support:\n\n• Visit **${NAV.help}** for FAQs and guides\n• Submit feedback at **${NAV.feedback}**\n• Contact your JSI territory manager directly\n\nOr just ask me — I can answer most questions about products, orders, lead times, and commissions right here.`;

    default:
        return `I can help with that! Here's what I know about:\n\n• **Lead times** — Ask about any of the ${ALL_SERIES.length} JSI series\n• **QuickShip** — ${QUICKSHIP_SERIES.length} series ship in 12 business days\n• **Orders** — Look up any order by number\n• **Commissions** — Rates, spiffs, and bonus targets\n• **Contracts** — Omnia, TIPS, Premier, GSA details\n• **Products** — Series, categories, finishes, fabrics\n• **Navigation** — I'll point you to any screen\n\nTry asking "What's the lead time for Arwyn?" or "Show me order 450080-00"!`;
    }
}

/* ── Smart-link actions for each intent ───────────────────────────── */

function generateNavigationActions(text) {
    const lower = text.toLowerCase();
    const screenHints = [
        [/order/, 'orders'],
        [/product/, 'products'],
        [/project|lead/, 'projects'],
        [/sample(?!.*disc)/, 'samples'],
        [/communit/, 'community'],
        [/market|buck/, 'marketplace'],
        [/member/, 'members'],
        [/setting/, 'settings'],
        [/lead ?time/, 'leadTimes'],
        [/commission/, 'commissions'],
        [/contract/, 'contracts'],
        [/present|deck/, 'presentations'],
        [/fabric/, 'fabrics'],
        [/loaner|pool/, 'loanerPool'],
        [/trade ?show/, 'tradeshows'],
        [/com |yardage/, 'comYardage'],
        [/sample.*disc/, 'sampleDisc'],
        [/help|support/, 'help'],
        [/feedback/, 'feedback'],
    ];
    for (const [re, key] of screenHints) {
        if (re.test(lower)) return [act(key)];
    }
    return [act('orders'), act('products'), act('leadTimes')];
}

function generateActions(text) {
    const intent = matchIntent(text);
    const actionMap = {
        greeting:        [],
        thanks:          [],
        whoAreYou:       [act('leadTimes'), act('orders'), act('commissions'), act('contracts')],
        leadTimeSeries:  [act('leadTimes'), act('products')],
        leadTimeGen:     [act('leadTimes')],
        quickShip:       [act('leadTimes')],
        orderLookup:     [act('orders')],
        orderGen:        [act('orders')],
        commissionRate:  [act('commissions')],
        bonus:           [act('commissions')],
        contract:        [act('contracts')],
        sampleDiscount:  [act('sampleDisc')],
        comYardage:      [act('comYardage')],
        fabric:          [act('fabrics'), act('comYardage')],
        finish:          [act('products')],
        product:         [act('products')],
        seriesLookup:    [act('products'), act('leadTimes')],
        category:        [act('products')],
        project:         [act('projects'), act('commissions')],
        sample:          [act('samples'), act('sampleDisc')],
        marketplace:     [act('marketplace')],
        community:       [act('community')],
        presentation:    [act('presentations')],
        tradeshow:       [act('tradeshows')],
        loanerPool:      [act('loanerPool')],
        help:            [act('help'), act('feedback')],
    };
    if (intent === 'navigation') return generateNavigationActions(text);
    return actionMap[intent] || [act('leadTimes'), act('orders'), act('products')];
}

export function useHomeChat() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatAttachments, setChatAttachments] = useState([]);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const chatFileInputRef = useRef(null);
    const botReplyTimeoutRef = useRef(null);

    const appendChatTurn = useCallback((text, attachments = []) => {
        const trimmed = text?.trim() || '';
        const normalizedAttachments = Array.isArray(attachments) ? attachments : [];
        if (!trimmed && !normalizedAttachments.length) return;

        const userText = trimmed || `Shared ${normalizedAttachments.length} attachment${normalizedAttachments.length === 1 ? '' : 's'}.`;
        const now = Date.now();
        setChatMessages((prev) => ([
            ...prev,
            { id: `u-${now}`, role: 'user', text: userText, attachments: normalizedAttachments, timestamp: now }
        ]));
        if (botReplyTimeoutRef.current) {
            clearTimeout(botReplyTimeoutRef.current);
        }
        setIsBotThinking(true);

        const replyText = trimmed
            ? generateReply(trimmed)
            : `I saved ${normalizedAttachments.length === 1 ? 'that attachment' : 'those attachments'}. Add a quick note if you want help with the files or want me to point you to the right part of myJSI.`;
        const replyActions = trimmed ? generateActions(trimmed) : [];

        botReplyTimeoutRef.current = setTimeout(() => {
            setChatMessages((prev) => ([
                ...prev,
                { id: `a-${now}`, role: 'assistant', text: replyText, actions: replyActions, timestamp: Date.now() }
            ]));
            setIsBotThinking(false);
        }, 700);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (botReplyTimeoutRef.current) {
                clearTimeout(botReplyTimeoutRef.current);
            }
        };
    }, []);

    // Escape key to close chat
    useEffect(() => {
        if (!isChatOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsChatOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isChatOpen]);

    const openChatFromQuery = useCallback((query) => {
        const trimmed = query?.trim();
        if (!trimmed) return;
        setIsChatOpen(true);
        appendChatTurn(trimmed.replace(/^\?\s*/, ''), []);
    }, [appendChatTurn]);

    const handleChatSubmit = useCallback((e) => {
        e.preventDefault();
        if (!chatInput.trim() && chatAttachments.length === 0) return;
        appendChatTurn(chatInput, chatAttachments);
        setChatInput('');
        setChatAttachments([]);
        if (chatFileInputRef.current) {
            chatFileInputRef.current.value = '';
        }
    }, [appendChatTurn, chatAttachments, chatInput]);

    const handleChatFilePick = useCallback(() => {
        chatFileInputRef.current?.click();
    }, []);

    const handleChatFilesSelected = useCallback((event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const mapped = files.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            size: file.size
        }));
        setChatAttachments((prev) => {
            const seen = new Set(prev.map((file) => file.id));
            const next = [...prev];
            mapped.forEach((file) => {
                if (seen.has(file.id)) return;
                seen.add(file.id);
                next.push(file);
            });
            return next;
        });
        event.target.value = '';
    }, []);

    const handleRemoveAttachment = useCallback((id) => {
        setChatAttachments((prev) => prev.filter((file) => file.id !== id));
    }, []);

    const resetChat = useCallback(() => {
        setIsChatOpen(false);
        setChatMessages([]);
        setChatInput('');
        setChatAttachments([]);
        if (chatFileInputRef.current) {
            chatFileInputRef.current.value = '';
        }
    }, []);

    return {
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        chatInput,
        setChatInput,
        chatAttachments,
        isBotThinking,
        chatFileInputRef,
        appendChatTurn,
        openChatFromQuery,
        handleChatSubmit,
        handleChatFilePick,
        handleChatFilesSelected,
        handleRemoveAttachment,
        resetChat,
    };
}
