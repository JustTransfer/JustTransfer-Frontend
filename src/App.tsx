import React from 'react';
import { Routes, Route } from "react-router-dom";

import ScrollToTop from './components/scrollToTop';
import { NotificationProvider } from './hooks/useNotificationContext';
import { ServerConfigProvider } from './hooks/useServerConfig';
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/home';
import AnonymousTransfer from './pages/anonymoustransfer';
import CreateAccountPage from './pages/createaccount';
import VerifyEmailPage from './pages/verifyemail';
import ResetPasswordRequestPage from './pages/resetPasswordRequest';
import ResetPasswordPage from './pages/resetPassword';
import LoginPage from './pages/login';
import Logout from './pages/logout';

import NewTransfer from './pages/new-transfer';
import Inbox from './pages/inbox';
import Transfers from './pages/transfers';
import AccountPage from './pages/account';
import PricingPage from './pages/pricing';
import Error from './pages/error';

import './App.css';

function App() {
  return (
    <NotificationProvider>
      <ServerConfigProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<CreateAccountPage />} />

            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:id" element={<VerifyEmailPage />} />

            <Route path="/reset-password" element={<ResetPasswordRequestPage />} />
            <Route path="/reset-password/:id" element={<ResetPasswordPage />} />

            <Route path="/anonymous-transfer/:id" element={<AnonymousTransfer />} />

            <Route path="/account" element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>}
            />

            <Route path="/pricing" element={
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>}
            />

            <Route path="/transfers" element={
              <ProtectedRoute>
                <Transfers />
              </ProtectedRoute>}
            />

            <Route path="/inbox" element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>}
            />

            <Route path="/new-transfer" element={
              <ProtectedRoute>
                <NewTransfer />
              </ProtectedRoute>}
            />

            <Route path="*" element={<Error />} />
          </Routes>
        </AuthProvider>
      </ServerConfigProvider>
    </NotificationProvider>
  );
}

export default App;
