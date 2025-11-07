import { useLocation, Link } from 'react-router';
import { Home as HomeIcon, Users as UsersIcon, Bell as BellIcon, Zap as SheepWheelIcon, BookOpenIcon, Brain, Trophy, TrendingUp, Share2, Crown, DollarSign } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';
const Sidebar = () => { 
    const {authUser} = useAuthUser();
    const location = useLocation();
    const currentPath= location.pathname;

    return <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
            <div className="p-5 border-b border-base-300">
                <Link to="/" className="flex items-center gap-2.5">
                    <SheepWheelIcon className="size-9 text-primary"/>
                    <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                        Streamify
                    </span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <Link to="/" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/" ? "btn-active": ""}`}>
                    <HomeIcon className="size-5 text-base-content opacity-70"/>
                    <span>Home</span>
                </Link>
                <Link to="/friends" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/friends" ? "btn-active": ""}`}>
                    <UsersIcon className="size-5 text-base-content opacity-70"/>
                    <span>Friends</span>
                </Link>
                <Link to="/notifications" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/notifications" ? "btn-active": ""}`}>
                    <BellIcon className="size-5 text-base-content opacity-70"/>
                    <span>Notifications</span>
                </Link>
                <Link to="/language-journey" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/language-journey" ? "btn-active": ""}`}>
                    <BookOpenIcon className="size-5 text-base-content opacity-70"/>
                    <span>Language Journey</span>
                </Link>
                <Link to="/ai-tutor" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/ai-tutor" ? "btn-active": ""}`}>
                    <Brain className="size-5 text-base-content opacity-70"/>
                    <span>AI Mentor</span>
                </Link>

                <div className="divider text-xs opacity-50">REWARDS & PROGRESS</div>

                <Link to="/achievements" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/achievements" ? "btn-active": ""}`}>
                    <Trophy className="size-5 text-base-content opacity-70"/>
                    <span>Achievements</span>
                </Link>
                <Link to="/leaderboard" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/leaderboard" ? "btn-active": ""}`}>
                    <TrendingUp className="size-5 text-base-content opacity-70"/>
                    <span>Leaderboard</span>
                </Link>
                <Link to="/referral" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/referral" ? "btn-active": ""}`}>
                    <Share2 className="size-5 text-base-content opacity-70"/>
                    <span>Referral</span>
                </Link>

                <div className="divider text-xs opacity-50">SUBSCRIPTION</div>

                <Link to="/subscription" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/subscription" ? "btn-active": ""}`}>
                    <Crown className="size-5 text-base-content opacity-70"/>
                    <span>My Plan</span>
                </Link>
                <Link to="/pricing" className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                    currentPath === "/pricing" ? "btn-active": ""}`}>
                    <DollarSign className="size-5 text-base-content opacity-70"/>
                    <span>Pricing</span>
                </Link>
            </nav>
            {/*USER PROFILE SECTION*/}
            <div className="p-4 border-t border-base-300 mt-auto">
                <div className="flex items-center gap-3">
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
                </div>
            </div>
    </aside>
};

export default Sidebar