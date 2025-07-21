import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './components/auth/auth.css';
import './components/clients/client.css';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
/* import Dashboard from './components/Dashboard'; */ 
import CreateClient from './components/clients/CreateClient';
import ClientList from './components/clients/ClientList';
import ClientDetails from './components/clients/ClientDetails';
import TreasuryDashboard from './components/treasury/TreasuryDashboard';
import ClientReview from './components/treasury/ClientReview';
import TreasuryOfficerDashboard from './components/treasuryOfficer/TreasuryOfficerDashboard';
import TradeDeskDashboard from './components/tradeDesk/TradeDeskDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/new"
          element={
            <ProtectedRoute>
              <CreateClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <RoleBasedRoute allowedRoles={['Agent OPS', 'Treasury OPS', 'Treasury Officer']}>
              <ClientDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/treasury"
          element={
            <RoleBasedRoute allowedRoles={['Treasury OPS']}>
              <TreasuryDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/treasury/clients/:id"
          element={
            <RoleBasedRoute allowedRoles={['Treasury OPS']}>
              <ClientReview />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/treasury-officer"
          element={
            <RoleBasedRoute allowedRoles={['Treasury Officer']}>
              <TreasuryOfficerDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/trade-desk"
          element={
            <RoleBasedRoute allowedRoles={['Trade Desk']}>
              <TradeDeskDashboard />
            </RoleBasedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
