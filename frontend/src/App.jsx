import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RouteErrorBoundary from "./components/RouteErrorBoundary.jsx";

// Auth + Landing pages — load eagerly so first paint is instant
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

// All other pages — lazy loaded for faster initial bundle
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx"));
const VocabularyReviewPage = lazy(() => import("./pages/VocabularyReviewPage.jsx"));
const FeedPage = lazy(() => import("./pages/FeedPage.jsx"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage.jsx"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage.jsx"));
const LanguageJourneyPage = lazy(() => import("./pages/LanguageJourneyPage.jsx"));
const FindPartnersPage = lazy(() => import("./pages/FindPartnersPage.jsx"));
const NotificationPage = lazy(() => import("./pages/NotificationPage.jsx"));
const FriendsPage = lazy(() => import("./pages/FriendsPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage.jsx"));
const CallPage = lazy(() => import("./pages/CallPage.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.jsx"));
const AITutorPage = lazy(() => import("./pages/AITutorPage.jsx"));
const ConversationPracticePage = lazy(() => import("./pages/ConversationPracticePage.jsx"));
const PricingPage = lazy(() => import("./pages/PricingPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage.jsx"));
const PracticePage = lazy(() => import("./pages/PracticePage.jsx"));
const ProgressPage = lazy(() => import("./pages/ProgressPage.jsx"));
const DailyTaskPage = lazy(() => import("./pages/DailyTaskPage.jsx"));

// Helper: protect routes that require auth + onboarding
const Protected = ({ children, isAuthenticated, isOnboarded }) => {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isOnboarded) return <Navigate to="/onboarding" />;
  return children;
};

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <div className="h-screen" data-theme={theme}>
        <Suspense fallback={<PageLoader />}>
          <Routes errorElement={<RouteErrorBoundary />}>
            {/* Auth routes */}
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />}
            />
            <Route
              path="/signup"
              element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />}
            />
            <Route
              path="/forgot-password"
              element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />}
            />
            <Route
              path="/reset-password/:token"
              element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />}
            />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                isAuthenticated ? (
                  !isOnboarded ? <OnboardingPage /> : <Navigate to="/" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Public pages */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/home" element={<Navigate to="/" />} />

            {/* Root: landing for guests, dashboard for authenticated users */}
            <Route
              path="/"
              element={
                !isAuthenticated ? <LandingPage /> :
                !isOnboarded ? <Navigate to="/onboarding" /> :
                <Layout showSidebar={true}><HomePage /></Layout>
              }
            />
            <Route
              path="/feed"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><FeedPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/daily-task"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><DailyTaskPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/practice"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><PracticePage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/language-journey"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><LanguageJourneyPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/find-partners"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><FindPartnersPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><LeaderboardPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/achievements"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><AchievementsPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/profile"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><ProfilePage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><UserProfilePage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/notifications"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><NotificationPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/friends"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><FriendsPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/progress"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><ProgressPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/vocabulary"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><VocabularyReviewPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/ai-tutor"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><AITutorPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/conversation-practice"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={false}><ConversationPracticePage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={false}><ChatPage /></Layout>
                </Protected>
              }
            />
            <Route
              path="/call/:id"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <CallPage />
                </Protected>
              }
            />
            <Route
              path="/checkout"
              element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/subscription"
              element={
                <Protected isAuthenticated={isAuthenticated} isOnboarded={isOnboarded}>
                  <Layout showSidebar={true}><SubscriptionPage /></Layout>
                </Protected>
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};
export default App;
