import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    format,
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday,
    addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
    addYears, subYears,
    startOfYear, endOfYear, eachMonthOfInterval,
    getDay,
} from 'date-fns';
import { HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { getTickets } from '../api/ticketApi';
import StatusBadge from './StatusBadge';

const VIEWS = ['month', 'week', 'day', 'year'];

const CalendarModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(null);

    // Fetch all tickets for dot indicators
    const { data: ticketData } = useQuery({
        queryKey: ['calendar-tickets'],
        queryFn: () => getTickets({ limit: 500, sort: '-createdAt' }),
        enabled: isOpen,
    });

    const tickets = ticketData?.data?.data || [];

    // Map tickets by date string (YYYY-MM-DD)
    const ticketsByDate = useMemo(() => {
        const map = {};
        tickets.forEach((t) => {
            const key = format(new Date(t.createdAt), 'yyyy-MM-dd');
            if (!map[key]) map[key] = [];
            map[key].push(t);
        });
        return map;
    }, [tickets]);

    // Get tickets for selected date
    const selectedDateTickets = selectedDate
        ? ticketsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
        : [];

    // Navigation
    const goNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else if (view === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (view === 'year') setCurrentDate(addYears(currentDate, 1));
    };
    const goPrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else if (view === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (view === 'year') setCurrentDate(subYears(currentDate, 1));
    };
    const goToday = () => setCurrentDate(new Date());

    // Handle day click
    const handleDayClick = (day) => {
        const key = format(day, 'yyyy-MM-dd');
        if (ticketsByDate[key]) {
            setSelectedDate(day);
        }
    };

    // Header title
    const getTitle = () => {
        if (view === 'month') return format(currentDate, 'MMMM yyyy');
        if (view === 'week') {
            const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
            const we = endOfWeek(currentDate, { weekStartsOn: 0 });
            return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
        }
        if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy');
        if (view === 'year') return format(currentDate, 'yyyy');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Calendar</h2>
                        <button
                            onClick={goToday}
                            className="px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {VIEWS.map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${view === v
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                        <button onClick={onClose} className="ml-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <HiOutlineX size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-6 py-3">
                    <button onClick={goPrev} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <HiOutlineChevronLeft size={18} />
                    </button>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getTitle()}</h3>
                    <button onClick={goNext} className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <HiOutlineChevronRight size={18} />
                    </button>
                </div>

                {/* Calendar Body */}
                <div className="px-6 pb-4 overflow-y-auto max-h-[60vh]">
                    {view === 'month' && <MonthView currentDate={currentDate} ticketsByDate={ticketsByDate} onDayClick={handleDayClick} selectedDate={selectedDate} />}
                    {view === 'week' && <WeekView currentDate={currentDate} ticketsByDate={ticketsByDate} onDayClick={handleDayClick} selectedDate={selectedDate} />}
                    {view === 'day' && <DayView currentDate={currentDate} ticketsByDate={ticketsByDate} onDayClick={handleDayClick} />}
                    {view === 'year' && <YearView currentDate={currentDate} ticketsByDate={ticketsByDate} onMonthClick={(date) => { setCurrentDate(date); setView('month'); }} />}

                    {/* Selected Date Detail */}
                    {selectedDate && selectedDateTickets.length > 0 && (
                        <TicketDetail
                            date={selectedDate}
                            tickets={selectedDateTickets}
                            onClose={() => setSelectedDate(null)}
                            onNavigate={(id) => { onClose(); navigate(`/tickets/${id}`); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────── MONTH VIEW ─────────── */
const MonthView = ({ currentDate, ticketsByDate, onDayClick, selectedDate }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
        <div>
            <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center py-2">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const hasTickets = !!ticketsByDate[key];
                    const ticketCount = ticketsByDate[key]?.length || 0;
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);
                    const selected = selectedDate && isSameDay(day, selectedDate);

                    return (
                        <button
                            key={key}
                            onClick={() => onDayClick(day)}
                            className={`relative flex flex-col items-center justify-center py-2.5 rounded-xl text-sm transition-all duration-200
                                ${!inMonth ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}
                                ${today ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : ''}
                                ${selected ? 'bg-blue-600 text-white dark:bg-blue-600 ring-2 ring-blue-400' : ''}
                                ${!today && !selected && inMonth ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
                                ${hasTickets && !selected ? 'cursor-pointer' : !hasTickets ? 'cursor-default' : 'cursor-pointer'}
                            `}
                        >
                            <span>{format(day, 'd')}</span>
                            {hasTickets && (
                                <div className="flex gap-0.5 mt-1">
                                    {ticketCount <= 3 ? (
                                        Array.from({ length: ticketCount }).map((_, i) => (
                                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/80' : 'bg-blue-500 dark:bg-blue-400'}`}></span>
                                        ))
                                    ) : (
                                        <>
                                            <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/80' : 'bg-blue-500 dark:bg-blue-400'}`}></span>
                                            <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/80' : 'bg-amber-500'}`}></span>
                                            <span className={`text-[9px] font-bold ${selected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>+{ticketCount - 2}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────── WEEK VIEW ─────────── */
const WeekView = ({ currentDate, ticketsByDate, onDayClick, selectedDate }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayTickets = ticketsByDate[key] || [];
                const today = isToday(day);
                const selected = selectedDate && isSameDay(day, selectedDate);

                return (
                    <div key={key} className={`rounded-xl p-3 min-h-[120px] border transition-all ${today ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'
                        } ${selected ? 'ring-2 ring-blue-500' : ''}`}>
                        <div className="text-center mb-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500">{format(day, 'EEE')}</p>
                            <p className={`text-lg font-bold ${today ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{format(day, 'd')}</p>
                        </div>
                        {dayTickets.length > 0 && (
                            <div className="space-y-1">
                                {dayTickets.slice(0, 3).map((t) => (
                                    <button
                                        key={t._id}
                                        onClick={() => onDayClick(day)}
                                        className="w-full text-left px-2 py-1 rounded-md text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 truncate hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                                    >
                                        {t.title}
                                    </button>
                                ))}
                                {dayTickets.length > 3 && (
                                    <p className="text-[10px] text-slate-400 text-center">+{dayTickets.length - 3} more</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* ─────────── DAY VIEW ─────────── */
const DayView = ({ currentDate, ticketsByDate, onDayClick }) => {
    const key = format(currentDate, 'yyyy-MM-dd');
    const dayTickets = ticketsByDate[key] || [];

    return (
        <div className="space-y-3">
            <div className="text-center py-4">
                <p className={`text-4xl font-bold ${isToday(currentDate) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {format(currentDate, 'd')}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{format(currentDate, 'EEEE, MMMM yyyy')}</p>
                {dayTickets.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{dayTickets.length} ticket{dayTickets.length !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
            {dayTickets.length > 0 ? (
                <div className="space-y-2">
                    {dayTickets.map((t) => (
                        <div
                            key={t._id}
                            onClick={() => onDayClick(currentDate)}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{format(new Date(t.createdAt), 'h:mm a')} · {t.priority}</p>
                            </div>
                            <StatusBadge status={t.status} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-slate-400 py-8">No tickets on this day</p>
            )}
        </div>
    );
};

/* ─────────── YEAR VIEW ─────────── */
const YearView = ({ currentDate, ticketsByDate, onMonthClick }) => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
        <div className="grid grid-cols-3 gap-4">
            {months.map((month) => {
                const ms = startOfMonth(month);
                const me = endOfMonth(month);
                const daysInMonth = eachDayOfInterval({ start: ms, end: me });
                const ticketDays = daysInMonth.filter((d) => ticketsByDate[format(d, 'yyyy-MM-dd')]);
                const totalTickets = daysInMonth.reduce((acc, d) => acc + (ticketsByDate[format(d, 'yyyy-MM-dd')]?.length || 0), 0);

                return (
                    <button
                        key={format(month, 'yyyy-MM')}
                        onClick={() => onMonthClick(month)}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left"
                    >
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{format(month, 'MMMM')}</p>
                        {totalTickets > 0 ? (
                            <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: Math.min(ticketDays.length, 5) }).map((_, i) => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{totalTickets} tickets</span>
                            </div>
                        ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">No tickets</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

/* ─────────── TICKET DETAIL PANEL ─────────── */
const TicketDetail = ({ date, tickets, onClose, onNavigate }) => {
    return (
        <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Tickets on {format(date, 'MMMM d, yyyy')}
                </h4>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded transition-colors">
                    <HiOutlineX size={14} />
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {tickets.map((t) => (
                    <div
                        key={t._id}
                        onClick={() => onNavigate(t._id)}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer group"
                    >
                        <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-medium capitalize ${t.priority === 'high' ? 'text-red-500' : t.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {t.priority}
                                </span>
                                <span className="text-[10px] text-slate-400">·</span>
                                <span className="text-[10px] text-slate-400">{t.categoryId?.name || 'Uncategorized'}</span>
                                <span className="text-[10px] text-slate-400">·</span>
                                <span className="text-[10px] text-slate-400">{format(new Date(t.createdAt), 'h:mm a')}</span>
                            </div>
                        </div>
                        <StatusBadge status={t.status} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarModal;
