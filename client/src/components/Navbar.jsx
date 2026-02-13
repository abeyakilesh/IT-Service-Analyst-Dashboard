import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { HiOutlineBell, HiOutlineSearch, HiOutlineCalendar } from 'react-icons/hi';
import CalendarModal from './CalendarModal';

const Navbar = () => {
    const { user } = useAuthStore();
    const [time, setTime] = useState(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Live clock — update every second
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <>
            <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Clock */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 tabular-nums tracking-wide">{formattedTime}</span>
                    </div>

                    {/* Calendar Button */}
                    <button
                        onClick={() => setCalendarOpen(true)}
                        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Calendar"
                    >
                        <HiOutlineCalendar size={20} />
                    </button>

                    {/* Notification Bell */}
                    <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <HiOutlineBell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-xs">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">{user?.name}</span>
                    </div>
                </div>
            </header>

            {/* Calendar Modal */}
            <CalendarModal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
        </>
    );
};

export default Navbar;
