import { Routes, Route, useParams, useLocation, Navigate, Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import ScrollToTop from './components/scrollToTop';
import { NotificationProvider } from './hooks/useNotificationContext';
import { ServerConfigProvider } from './hooks/useServerConfig';
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/home';
import TermsService from './pages/termsService';
import PrivacyPolicy from './pages/privacyPolicy';
import LinkTransfer from './pages/linktransfer';
import CreateAccountPage from './pages/createaccount';
import VerifyEmailPage from './pages/verifyemail';
import ResetPasswordRequestPage from './pages/resetPasswordRequest';
import ResetPasswordPage from './pages/resetPassword';
import LoginPage from './pages/login';
import Logout from './pages/logout';

import SavedTransfers from './pages/savedTransfer';
import TransferDetails from './pages/transferDetails';
import AccountPage from './pages/account';
import PricingPage from './pages/pricing';
import Error from './pages/error';
import { supportedLanguages } from './i18n';

import './App.css';

function LangLayout() {
  const { lng } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (lng && supportedLanguages.includes(lng as any) && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  if (!lng || !supportedLanguages.includes(lng as any)) {
    const detected = supportedLanguages.includes(i18n.language as any)
      ? i18n.language
      : "en";

    const looksLikeLangCode = lng && /^[a-z]{2}$/i.test(lng);
    const rest = looksLikeLangCode
      ? location.pathname.replace(new RegExp(`^/${lng}`), "")
      : location.pathname;

    const target = `/${detected}${rest === "/" ? "" : rest}${location.search}${location.hash}`;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <NotificationProvider>
      <ServerConfigProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/:lng" element={<LangLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="logout" element={<Logout />} />
              <Route path="register" element={<CreateAccountPage />} />

              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="verify-email/:id" element={<VerifyEmailPage />} />

              <Route path="reset-password" element={<ResetPasswordRequestPage />} />
              <Route path="reset-password/:id" element={<ResetPasswordPage />} />

              <Route path="link-transfer/:id" element={<LinkTransfer />} />

              <Route path="terms" element={<TermsService />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />

              <Route path="account" element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>}
              />

              <Route path="pricing" element={
                <ProtectedRoute>
                  <PricingPage />
                </ProtectedRoute>}
              />

              <Route path="transfers" element={
                <ProtectedRoute>
                  <SavedTransfers />
                </ProtectedRoute>}
              />

              <Route path="transfers/:id" element={
                <ProtectedRoute>
                  <TransferDetails />
                </ProtectedRoute>}
              />

              <Route path="*" element={<Error />} />
            </Route>

            <Route path="/" element={<Navigate to={`/en`} replace />} />
          </Routes>
        </AuthProvider>
      </ServerConfigProvider>
    </NotificationProvider>
  );
}

export default App;