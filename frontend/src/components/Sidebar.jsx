import { useLocation, Link } from 'react-router';
import { CalendarCheck, MessageCircle, Users, User, Zap, Flame, Newspaper, Trophy, Star, Map, CreditCard, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuthUser from '../hooks/useAuthUser';
import { getEnglishWordOfDay } from '../lib/learningApi';

const Sidebar = () => {
    const {authUser} = useAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;

    const { data: wotd } = useQuery({
        queryKey: ['englishWordOfDay'],
        queryFn: getEnglishWordOfDay,
        staleTime: 1000 * 60 * 60,
    });

    const navItems = [
        { path: '/daily-task', icon: CalendarCheck, label: 'Daily Task', description: "Today's practice" },
        { path: '/word-of-day', icon: BookOpen, label: 'Word of the Day', description: 'Daily vocabulary' },
        { path: '/feed', icon: Newspaper, label: 'Community', description: 'Posts & social feed' },
        { path: '/practice', icon: MessageCircle, label: 'Practice', description: 'AI & vocab practice' },
        { path: '/language-journey', icon: Map, label: 'Journey', description: 'Your learning path' },
        { path: '/find-partners', icon: Users, label: 'Partners', description: 'Find a partner' },
        { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', description: 'Top learners' },
        { path: '/achievements', icon: Star, label: 'Achievements', description: 'Badges & XP' },
        { path: '/profile', icon: User, label: 'Profile', description: 'Your profile' },
        { path: '/pricing', icon: CreditCard, label: 'Upgrade', description: 'Go premium' },
    ];

    return <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
            <div className="p-5 border-b border-base-300">
                <Link to="/" className="flex items-center gap-2.5">
                    <Zap className="size-9 text-primary"/>
                    <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                        LangPal
                    </span>
                </Link>
                <p className="text-xs opacity-60 mt-1">Learn by talking daily</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`btn btn-ghost justify-start w-full gap-3 px-4 normal-case h-auto py-3 ${
                                isActive ? "btn-active bg-primary/10": ""
                            }`}
                        >
                            <Icon className={`size-5 ${isActive ? 'text-primary' : 'text-base-content opacity-70'}`}/>
                            <div className="flex flex-col items-start">
                                <span className={`font-semibold ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
                                <span className="text-xs opacity-50">{item.description}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
            {/* WORD OF THE DAY */}
            <Link to="/word-of-day" className="mx-4 mb-3 block">
                <div className="px-4 py-3 bg-gradient-to-r from-secondary/15 to-accent/10 rounded-xl border border-secondary/30 hover:border-secondary/60 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="size-4 text-secondary shrink-0" />
                        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Word of the Day</span>
                    </div>
                    {wotd?.word?.word ? (
                        <>
                            <p className="font-bold text-base text-base-content leading-tight">{wotd.word.word}</p>
                            {wotd.word.partOfSpeech && (
                                <p className="text-xs text-base-content/50 italic">{wotd.word.partOfSpeech}</p>
                            )}
                            {wotd.word.definition && (
                                <p className="text-xs text-base-content/60 mt-1 line-clamp-2 leading-relaxed">
                                    {wotd.word.definition}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="space-y-1 animate-pulse">
                            <div className="h-4 bg-base-300 rounded w-2/3" />
                            <div className="h-3 bg-base-300 rounded w-full" />
                        </div>
                    )}
                </div>
            </Link>

            {/* STREAK DISPLAY */}
            <div className="px-4 py-3 mx-4 mb-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                <div className="flex items-center gap-3">
                    <Flame className="size-8 text-orange-500"/>
                    <div>
                        <p className="text-2xl font-bold text-orange-500">{authUser?.streak || 0}</p>
                        <p className="text-xs opacity-70">day streak</p>
                    </div>
                </div>
            </div>

            {/*USER PROFILE SECTION*/}
            <div className="p-4 border-t border-base-300 mt-auto">
                <Link to="/profile" className="flex items-center gap-3 hover:bg-base-300 rounded-lg p-2 -m-2 transition-colors">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img src={authUser?.profilePic} alt="User Avatar"/>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{authUser?.fullName}</p>
                        <p className="text-xs text-success flex items-center gap-1">
                            <span className="size-2 rounded-full bg-success inline-block"/>
                            Online
                        </p>
                    </div>
                </Link>
            </div>
    </aside>
};

export default Sidebar;