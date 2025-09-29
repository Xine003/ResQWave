import { useState, useRef, useEffect, useMemo } from 'react';
import { Eye, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type HistoryModalProps = {
    open: boolean;
    onClose: () => void;
    center?: { x: number; y: number } | null;
};

// Simple sample data for the history list. Replace with real data/props later.
const SAMPLE_REPORTS = [
    {
        monthLabel: 'September 2025',
        count: 3,
        items: [
            { id: 'DOC_EMG_009', date: 'September 17, 2025', type: 'Critical' },
            { id: 'DOC_EMG_008', date: 'September 10, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_007', date: 'September 1, 2025', type: 'Critical' },
        ],
    },
    {
        monthLabel: 'October 2025',
        count: 2,
        items: [
            { id: 'DOC_EMG_002', date: 'October 2, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_001', date: 'October 5, 2025', type: 'Critical' },
        ],
    },
    {
        monthLabel: 'November 2025',
        count: 2,
        items: [
            { id: 'DOC_EMG_002', date: 'October 2, 2025', type: 'User Initiated' },
            { id: 'DOC_EMG_001', date: 'October 5, 2025', type: 'Critical' },
        ],
    },

];

export default function HistoryModal({ open, onClose, center = null }: HistoryModalProps) {
    const [query, setQuery] = useState('');
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
    const [selectedMonth, setSelectedMonth] = useState<string>('Month');
    const [selectedYear, setSelectedYear] = useState<string>('Year');
    const [selectedType, setSelectedType] = useState<string>('All Types');
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [typeOpen, setTypeOpen] = useState(false);
    const monthRef = useRef<HTMLButtonElement | null>(null);
    const yearRef = useRef<HTMLButtonElement | null>(null);
    const typeRef = useRef<HTMLButtonElement | null>(null);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = (() => {
        const y = new Date().getFullYear();
        const range = 6; // current year and previous 5 years
        return Array.from({ length: range }, (_, i) => String(y - i));
    })();
    const types = ['All Types', 'Critical', 'User Initiated'];

    // Derive filtered groups based on search and filters
    const groupedReports = useMemo(() => {
        const q = query.trim().toLowerCase();

        return SAMPLE_REPORTS.map((group) => {
            const filteredItems = group.items.filter((item) => {
                // search by id
                if (q && !item.id.toLowerCase().includes(q)) return false;

                // parse date to evaluate month/year
                const parsed = new Date(item.date);
                if (selectedMonth !== 'Month') {
                    const monthName = months[parsed.getMonth()];
                    if (monthName !== selectedMonth) return false;
                }
                if (selectedYear !== 'Year') {
                    const yearStr = String(parsed.getFullYear());
                    if (yearStr !== selectedYear) return false;
                }

                // filter by type if selected
                if (selectedType !== 'All Types') {
                    if ((item as any).type !== selectedType) return false;
                }

                return true;
            });

            return { ...group, items: filteredItems, count: filteredItems.length };
        }).filter(g => g.items.length > 0);
    }, [query, selectedMonth, selectedYear, selectedType]);

    // (removed dynamic width measuring — using fixed minWidth values for menu content)

    // Reset filters to defaults
    function resetFilters() {
        setQuery('');
        setSelectedMonth('Month');
        setSelectedYear('Year');
        setSelectedType('All Types');
        setMonthOpen(false);
        setYearOpen(false);
        setTypeOpen(false);
    }

    // Helper to blur trigger when dropdown closes so focus ring/active state is removed
    function handleOpenChange(open: boolean, ref: React.RefObject<HTMLButtonElement | null>, setOpen: (v: boolean) => void) {
        setOpen(open);
        if (!open) {
            // Radix may re-focus the trigger after closing; delay and then blur + temporarily remove tabindex
            setTimeout(() => {
                try {
                    const el = ref.current;
                    if (!el) return;
                    el.blur();
                    // prevent immediate refocus by temporarily removing it from tab order
                    el.setAttribute('tabindex', '-1');
                    // restore tabindex shortly after so keyboard users can still tab to it later
                    setTimeout(() => {
                        try { el.removeAttribute('tabindex'); } catch (e) { /* ignore */ }
                    }, 350);
                } catch (e) {
                    /* ignore */
                }
            }, 180);
        }
    }

    // If parent changes `open` to false (modal closed), reset filters
    useEffect(() => {
        if (!open) {
            resetFilters();
        }
    }, [open]);

    // ensure expanded map defaults to open groups when modal opens
    useEffect(() => {
        if (open) {
            const init: Record<string, boolean> = {};
            SAMPLE_REPORTS.forEach(g => { init[g.monthLabel] = true; });
            setExpandedMap(init);
        }
    }, [open]);

    if (!open) return null;

    const baseStyle: any = {
        width: 'min(780px, 96%)',
        height: '85vh', // fixed height so modal doesn't resize when content collapses
        minHeight: 80,
        overflow: 'hidden', // inner area handles scrolling
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        display: 'flex',
        flexDirection: 'column',
    };

    const modalStyle: any = center
        ? { ...baseStyle, position: 'fixed', left: center.x, top: center.y, transform: 'translate(-50%, -50%)', background: '#171717' }
        : { ...baseStyle, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171717' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 'var(--z-popover)' }}>
            <div style={modalStyle}>
                <style>{`
                    .history-modal-list::-webkit-scrollbar{display:none;} 
                    .history-modal-list{ -webkit-overflow-scrolling: touch; }
                    .history-group-body{ -webkit-overflow-scrolling: touch; }
                `}</style>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18,
                        cursor: 'pointer', transition: 'color 0.18s, transform 0.18s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'scale(1.01)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = '#BABABA';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
                    <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>History</h2>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 300 }}>View Documented Emergency Reports for Your Community</div>
                </div>

                {/* Controls: search + filters */}
                <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', zIndex: 2 }}>
                    <div style={{ position: 'relative', flex: 2 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b8b8b' }} />
                        <Input
                            value={query}
                            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                            placeholder="Search Reports by ID"
                            className="w-full bg-[#262626] border-[#404040] text-[#BABABA] placeholder:text-[#BABABA] placeholder:font-light pl-10 pr-3 py-5 rounded-md"
                        />
                    </div>
                    <DropdownMenu open={monthOpen} onOpenChange={(v) => handleOpenChange(v, monthRef, setMonthOpen)}>
                        <DropdownMenuTrigger asChild>
                            <button
                                ref={monthRef}
                                className="flex items-center justify-between min-w-[100px] gap-2 px-3 py-[9px] rounded-md bg-[#262626] border border-[#404040] text-[#cfcfcf] hover:bg-[#313131] hover:border-[#6b7280] transition-colors cursor-pointer"
                                aria-label="Select month"
                                style={{ outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedMonth}</span>
                                <ChevronDown size={16} style={{ color: '#8b8b8b', transform: monthOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms' }} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent style={{ minWidth: "100px" }} className="z-[99999] bg-[#171717] border border-[#2b2b2b] text-[#cfcfcf]">
                            {months.map((m) => (
                                <DropdownMenuItem key={m} onClick={() => { setSelectedMonth(m); setMonthOpen(false); }}>{m}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu open={yearOpen} onOpenChange={(v) => handleOpenChange(v, yearRef, setYearOpen)}>
                        <DropdownMenuTrigger asChild>
                            <button
                                ref={yearRef}
                                className="flex items-center justify-between min-w-[80px] gap-2 px-3 py-[9px] rounded-md bg-[#262626] border border-[#404040] text-[#cfcfcf] hover:bg-[#313131] hover:border-[#6b7280] transition-colors cursor-pointer"
                                aria-label="Select year"
                                style={{ outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedYear}</span>
                                <ChevronDown size={16} style={{ color: '#8b8b8b', transform: yearOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms' }} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent style={{ minWidth: "80px" }} className="z-[99999] bg-[#171717] border border-[#2b2b2b] text-[#cfcfcf]">
                            {years.map((y) => (
                                <DropdownMenuItem key={y} onClick={() => { setSelectedYear(y); setYearOpen(false); }}>{y}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu open={typeOpen} onOpenChange={(v) => handleOpenChange(v, typeRef, setTypeOpen)}>
                        <DropdownMenuTrigger asChild>
                            <button
                                ref={typeRef}
                                className="flex items-center justify-between min-w-[110px] gap-2 px-3 py-[9px] rounded-md bg-[#262626] border border-[#404040] text-[#cfcfcf] hover:bg-[#313131] hover:border-[#6b7280] transition-colors cursor-pointer"
                                aria-label="Select type"
                                style={{ outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedType}</span>
                                <ChevronDown size={16} style={{ color: '#8b8b8b', transform: typeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms' }} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent style={{ minWidth: "110px" }} className="z-[99999] bg-[#171717] border border-[#2b2b2b] text-[#cfcfcf]">
                            {types.map((t) => (
                                <DropdownMenuItem key={t} onClick={() => { setSelectedType(t); setTypeOpen(false); }}>{t}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Scrollable data list - only this area scrolls */}
                <div
                    className="history-modal-list"
                    style={{
                        marginTop: 18,
                        display: 'grid',
                        gap: 12,
                        overflowY: 'auto',
                        // subtract estimated header + controls + padding: adjust if you change paddings
                        maxHeight: 'calc(85vh - 260px)',
                        // hide scrollbars where possible (Firefox/IE)
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingRight: 6,
                    }}
                >
                    {groupedReports.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, gap: 12, color: '#cfcfcf' }}>
                            <Search size={36} color="#8b8b8b" />
                            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6, color: '#fff' }}>No history yet</div>
                            <div style={{ fontSize: 13, maxWidth: 420, textAlign: 'center', color: '#cfcfcf' }}>There are no documented emergency reports for your community. Try widening the date range or clearing filters.</div>
                            <button
                                onClick={() => resetFilters()}
                                style={{ marginTop: 12, padding: '8px 14px', borderRadius: 6, background: '#262626', color: '#fff', border: '1px solid #404040', cursor: 'pointer' }}
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : groupedReports.map((group) => {
                        const expanded = !!expandedMap[group.monthLabel];
                        return (
                            <div key={group.monthLabel} style={{ display: 'grid', gap: 10 }}>
                                {/* Month header as full-width white pill */}
                                <button
                                    onClick={() => setExpandedMap(prev => ({ ...prev, [group.monthLabel]: !prev[group.monthLabel] }))}
                                    aria-expanded={expanded}
                                    aria-label={expanded ? 'Collapse month' : 'Expand month'}
                                    style={{
                                        width: '100%',
                                        background: '#ffffff',
                                        color: '#111111',
                                        padding: '9px 16px',
                                        borderRadius: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, fontSize: 15.7 }}>
                                        <span>{group.monthLabel}</span>
                                        <span style={{ background: '#111111', color: '#fff', borderRadius: 999, padding: '1px 11px', fontSize: 12 }}>{group.count}</span>
                                    </div>
                                    <ChevronDown size={18} style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', color: '#111' }} />
                                </button>

                                <div
                                    className="history-group-body"
                                    style={{
                                        marginTop: expanded ? 8 : 0,
                                        display: 'grid',
                                        gap: 12,
                                        overflow: 'hidden',
                                        maxHeight: expanded ? '2000px' : '0px',
                                        transition: 'max-height 260ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease, transform 240ms ease, margin-top 240ms ease',
                                        opacity: expanded ? 1 : 0,
                                        transform: expanded ? 'translateY(0)' : 'translateY(-6px)'
                                    }}
                                >
                                    {group.items.map((r) => (
                                        <div
                                            key={r.id}
                                            style={{
                                                background: '#262626', color: '#fff', padding: '14px 16px', borderRadius: 6, display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', border: '1px solid #404040', transition: 'background 0.18s, border-color 0.18s',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#313131';
                                                e.currentTarget.style.borderColor = '#6b7280'; // lighter gray
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = '#262626';
                                                e.currentTarget.style.borderColor = '#404040';
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 400, letterSpacing: 0.2 }}>{r.id}</div>
                                                <div style={{ fontSize: 13, color: '#cfcfcf', marginTop: 6 }}>Report accomplished on {r.date}</div>
                                            </div>

                                            <button
                                                style={{
                                                    background: "rgba(59,130,246,0.10)", border: "none", width: 47, height: 47, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", boxShadow: "inset 0 0 0 1px rgba(103,161,255,0.06)", transition: "all 0.2s ease-in-out", // smooth effect
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "rgba(59,130,246,0.18)" // lighter
                                                    e.currentTarget.style.boxShadow =
                                                        "inset 0 0 0 1px rgba(59,130,246,0.3)" // stronger border
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "rgba(59,130,246,0.10)" // reset
                                                    e.currentTarget.style.boxShadow =
                                                        "inset 0 0 0 1px rgba(103,161,255,0.06)" // reset
                                                }}
                                                aria-label="View report"
                                            >
                                                <Eye
                                                    size={21}
                                                    color="#3B82F6"
                                                    style={{
                                                        transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
                                                    }}
                                                    className="hover:scale-110"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
