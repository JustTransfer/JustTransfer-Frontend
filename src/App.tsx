import React from 'react';
import { Routes, Route } from "react-router-dom";

import HomePage from './pages/home';
import CreateAccountPage from './pages/createaccount';
import LoginPage from './pages/login';

import NewTransfer from './pages/new-transfer';
import Inbox from './pages/inbox';
import Transfers from './pages/transfers';
import AccountPage from './pages/account';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CreateAccountPage />} />

      <Route path="/account" element={<AccountPage />} />
      <Route path="/transfers" element={<Transfers />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/new-transfer" element={<NewTransfer />} />
    </Routes>
  );
}

export default App;
