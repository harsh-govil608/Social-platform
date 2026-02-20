import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import VocabularyReviewPage from "./pages/VocabularyReviewPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import AchievementsPage from "./pages/AchievementsPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import LanguageJourneyPage from "./pages/LanguageJourneyPage.jsx";
// Beta: disabled
// import ContestsPage from "./pages/ContestsPage.jsx";
// import ContestDetailPage from "./pages/ContestDetailPage.jsx";
// import CertificatesPage from "./pages/CertificatesPage.jsx";
import FindPartnersPage from "./pages/FindPartnersPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
// import EnhancedLanguageJourneyPage from "./pages/EnhancedLanguageJourneyPage.jsx"; // Beta: disabled
import AITutorPage from "./pages/AITutorPage.jsx";
import ConversationPracticePage from "./pages/ConversationPracticePage.jsx";
// Beta: disabled
// import PricingPage from "./pages/PricingPage.jsx";
// import CheckoutPage from "./pages/CheckoutPage.jsx";
// import SubscriptionPage from "./pages/SubscriptionPage.jsx";
// import AchievementsPage from "./pages/AchievementsPage.jsx";
// import LeaderboardPage from "./pages/LeaderboardPage.jsx";
// import ReferralPage from "./pages/ReferralPage.jsx";
// import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
// New focused pages
import PracticePage from "./pages/PracticePage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import DailyTaskPage from "./pages/DailyTaskPage.jsx";
// import CodeArenaPage from "./pages/CodeArenaPage.jsx"; // Beta: disabled
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RouteErrorBoundary from "./components/RouteErrorBoundary.jsx";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <div className="h-screen" data-theme={theme}>
        <Routes errorElement={<RouteErrorBoundary />}>
          <Route
            path="/"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          {/* Redirect /home to root for convenience */}
          <Route path="/home" element={<Navigate to="/" />} />
          <Route
            path="/feed"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <FeedPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/achievements"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <AchievementsPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <LeaderboardPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            !isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/verify-email/:token"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        {/* New focused routes */}
        <Route
          path="/daily-task"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <DailyTaskPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/practice"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <PracticePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/progress"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <ProgressPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <ProfilePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/profile/:userId"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <UserProfilePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/language-journey"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <LanguageJourneyPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        
        <Route
          path="/ai-tutor"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <AITutorPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        
        <Route
          path="/conversation-practice"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ConversationPracticePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/vocabulary"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <VocabularyReviewPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Beta: disabled
        <Route
          path="/contests"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <ContestsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/contest/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ContestDetailPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/certificates"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <CertificatesPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        /> */}
        <Route
          path="/find-partners"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FindPartnersPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Beta: Monetization Routes disabled
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
        <Route path="/subscription" element={isAuthenticated && isOnboarded ? <Layout showSidebar={true}><SubscriptionPage /></Layout> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        <Route path="/referral" element={isAuthenticated && isOnboarded ? <Layout showSidebar={true}><ReferralPage /></Layout> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        */}
        </Routes>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};
export default App;