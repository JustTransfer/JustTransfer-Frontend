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
import { isSupportedLang, resolvePreferredLang, withLangPrefix } from "./hooks/useLangRedirect";

import './App.css';

function LangLayout() {
  const { lng } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (isSupportedLang(lng) && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  if (!isSupportedLang(lng)) {
    return <Navigate to={withLangPrefix(resolvePreferredLang(i18n.language), location)} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();
  return <Navigate to={withLangPrefix(resolvePreferredLang(i18n.language), location)} replace />;
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

            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ServerConfigProvider>
    </NotificationProvider>
  );
}

export default App;