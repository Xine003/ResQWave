import { useState, useEffect, useMemo, useRef } from 'react';

import { Eye, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type ActivityLogModalProps = {
    open: boolean;
    onClose: () => void;
    center?: { x: number; y: number } | null;
};

// Hardcoded activity log data for demonstration (replace with real data as needed)
const activityLogs = [
    {
        monthLabel: 'October 2025',
        days: [
            {
                dayLabel: 'October 8, 2025',
                entries: [
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                ],
            },
            {
                dayLabel: 'October 5, 2025',
                entries: [
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                ],
            },
            {
                dayLabel: 'October 2, 2025',
                entries: [
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                ],
            },
            {
                dayLabel: 'October 1, 2025',
                entries: [
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                    {
                        user: 'Gwyneth',
                        action: 'updated their neighborhood information.',
                        details: 'No. of Households: 5-10',
                        time: '06:23',
                    },
                ],
            },
        ],
    },
];

export default function ActivityLogModal({ open, onClose, center = null }: ActivityLogModalProps) {
    const ANIM_MS = 220;
    const [mounted, setMounted] = useState<boolean>(open);
    const [visible, setVisible] = useState<boolean>(open);
    useEffect(() => {
        if (open) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => setMounted(false), ANIM_MS);
            return () => clearTimeout(t);
        }
    }, [open]);

    const [selectedMonth, setSelectedMonth] = useState<string>('Month');
    const [selectedYear, setSelectedYear] = useState<string>('Year');
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    // State to control PDF modal
    // Optionally, you could store the PDF path or report id if needed for dynamic PDFs
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

    // State for expand/collapse of months and days
    const [expandedMonth, setExpandedMonth] = useState<string | null>(activityLogs[0]?.monthLabel || null);
    const [expandedDay, setExpandedDay] = useState<string | null>(activityLogs[0]?.days[0]?.dayLabel || null);
    const [query, setQuery] = useState('');


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
    // Filtered logs by search (date string)
    const filteredLogs = useMemo(() => {
        if (!query.trim()) return activityLogs;
        const q = query.trim().toLowerCase();
        return activityLogs.map(month => ({
            ...month,
            days: month.days
                .map(day => ({
                    ...day,
                    entries: day.entries,
                }))
                .filter(day => day.dayLabel.toLowerCase().includes(q))
        })).filter(month => month.days.length > 0);
    }, [query]);

    if (!mounted) return null;


    const baseStyle: any = {
        width: 'min(780px, 96%)',
        height: '85vh',
        minHeight: 80,
        overflow: 'hidden',
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
    const overlayStyle: any = {
        position: 'fixed', inset: 0,
        background: visible ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)',
        zIndex: 'var(--z-popover)',
        transition: `background ${ANIM_MS}ms ease`,
        pointerEvents: visible ? 'auto' : 'none',
    };
    const animatedModalStyle: any = {
        ...modalStyle,
        opacity: visible ? 1 : 0,
        transform: center
            ? `translate(-50%, -50%) translateY(${visible ? '0' : '-8px'})`
            : `${visible ? 'translateY(0)' : 'translateY(-8px)'}`,
        transition: `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms cubic-bezier(.2,.9,.2,1)`,
    };

    return (
        <>
            <div style={overlayStyle}>
                <div style={animatedModalStyle}>
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
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>Activity Logs</h2>
                        <div style={{ color: '#BABABA', fontSize: 14, fontWeight: 400 }}>Last Updated: October 10, 2025</div>
                    </div>

                    {/* Controls: search + filters */}
                    <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center', zIndex: 2 }}>
                        <div style={{ position: 'relative', flex: 2 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b8b8b' }} />
                            <Input
                                value={query}
                                onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                                placeholder="Search Reports by Date"
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
                       
                    </div>

                    {/* Scrollable data list - only this area scrolls */}
                    <div
                        className="history-modal-list"
                        style={{
                            marginTop: 18,
                            display: 'grid',
                            gap: 12,
                            overflowY: 'auto',
                            maxHeight: 'calc(85vh - 260px)',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            paddingRight: 6,
                        }}
                    >
                        {filteredLogs.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, gap: 12, color: '#cfcfcf' }}>
                                <svg width="36" height="36" fill="none" stroke="#8b8b8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="16" /><line x1="32" y1="32" x2="25" y2="25" /></svg>
                                <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6, color: '#fff' }}>No activity logs</div>
                                <div style={{ fontSize: 13, maxWidth: 420, textAlign: 'center', color: '#cfcfcf' }}>There are no activity logs for your community. Try widening the date range or clearing filters.</div>
                            </div>
                        ) : filteredLogs.map(month => {
                            const monthExpanded = expandedMonth === month.monthLabel;
                            return (
                                <div key={month.monthLabel} style={{ display: 'grid', gap: 10 }}>
                                    <button
                                        onClick={() => setExpandedMonth(monthExpanded ? null : month.monthLabel)}
                                        aria-expanded={monthExpanded}
                                        aria-label={monthExpanded ? 'Collapse month' : 'Expand month'}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            color: '#111111',
                                            padding: '9px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: 15.7,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span>{month.monthLabel}</span>
                                            <span style={{ background: '#111111', color: '#fff', borderRadius: 999, padding: '1px 11px', fontSize: 12 }}>{month.days.length}</span>
                                        </div>
                                        <svg width="30" height="30" style={{ transform: monthExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', color: '#111' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                    </button>
                                    {monthExpanded && month.days.map(day => {
                                        const dayExpanded = expandedDay === day.dayLabel;
                                        return (
                                            <div key={day.dayLabel} style={{ display: 'grid', gap: 10 }}>
                                                <button
                                                    onClick={() => setExpandedDay(dayExpanded ? null : day.dayLabel)}
                                                    aria-expanded={dayExpanded}
                                                    aria-label={dayExpanded ? 'Collapse day' : 'Expand day'}
                                                    style={{
                                                        width: '100%',
                                                        background: '#232323',
                                                        color: '#fff',
                                                        padding: '9px 16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        border: '1px solid #333',
                                                        cursor: 'pointer',
                                                        fontWeight: 500,
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span>{day.dayLabel}</span>
                                                        <span style={{ background: '#fff', color: '#111', borderRadius: 999, padding: '1px 11px', fontSize: 12 }}>{day.entries.length}</span>
                                                    </div>
                                                    <svg width="30" height="30" style={{ transform: dayExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', color: '#fff' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                                </button>
                                                {dayExpanded && (
                                                    <div style={{ background: '#171717', border: '1px solid #333', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {day.entries.map((entry, idx) => (
                                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', borderBottom: idx !== day.entries.length - 1 ? '1px solid #232323' : 'none' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid #BABABA', marginRight: 10 }}></span>
                                                                    <div>
                                                                        <div style={{ fontWeight: 400, fontSize: 15 }}>{entry.user} {entry.action}</div>
                                                                        <div style={{ fontSize: 13, color: '#BABABA', marginTop: 2 }}>{entry.details}</div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontWeight: 400, fontSize: 15, color: '#BABABA', minWidth: 48, textAlign: 'right' }}>{entry.time}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

