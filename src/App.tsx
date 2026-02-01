import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Loans from './pages/Loans';
import CommodityPrices from './pages/CommodityPrices';
import ApplyNow from './pages/ApplyNow';
import UsaApplyNow from './pages/UsaApplyNow';
import IndiaApplyNow from './pages/IndiaApplyNow';
import Layout from './components/Layout';

type Page = 'dashboard' | 'categories' | 'loans' | 'commodity-prices' | 'apply-now' | 'usa-apply-now' | 'india-apply-now';

function AppContent() {
  const { admin, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!admin) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'categories' && <Categories />}
      {currentPage === 'loans' && <Loans />}
      {currentPage === 'commodity-prices' && <CommodityPrices />}
      {currentPage === 'apply-now' && <ApplyNow />}
      {currentPage === 'usa-apply-now' && <UsaApplyNow />}
      {currentPage === 'india-apply-now' && <IndiaApplyNow />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
