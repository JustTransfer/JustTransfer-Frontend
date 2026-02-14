import React from 'react';
import { Routes, Route } from "react-router-dom";

import { ServerConfigProvider } from './hooks/useServerConfig';
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/home';
import AnonymousTransfer from './pages/anonymoustransfer';
import CreateAccountPage from './pages/createaccount';
import LoginPage from './pages/login';

import NewTransfer from './pages/new-transfer';
import Inbox from './pages/inbox';
import Transfers from './pages/transfers';
import AccountPage from './pages/account';
import Error from './pages/error';

import './App.css';

function App() {
  return (
    <ServerConfigProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<CreateAccountPage />} />

          <Route path="/register" element={<CreateAccountPage />} />

          <Route path="/anonymous-transfer/:id" element={<AnonymousTransfer />} />

          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
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

          < Route path="/new-transfer" element={
            <ProtectedRoute>
              <NewTransfer />
            </ProtectedRoute >}
          />

          <Route path="*" element={<Error />} />
        </Routes>
      </AuthProvider>
    </ServerConfigProvider>
  );
}

export default App;
