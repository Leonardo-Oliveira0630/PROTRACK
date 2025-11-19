
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import JobsList from './pages/JobsList';
import JobCreate from './pages/JobCreate';
import Admin from './pages/Admin';
import Sectors from './pages/Sectors';
import Collaborators from './pages/Collaborators';
import Login from './pages/Login';
import PromisedJobs from './pages/PromisedJobs';
import GlobalScanModal from './components/GlobalScanModal';
import ProductionCalendar from './pages/ProductionCalendar';
import JobDetails from './pages/JobDetails';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <GlobalScanModal />
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/promised" element={<PromisedJobs />} />
          <Route path="/calendar" element={<ProductionCalendar />} />
          <Route path="/create-job" element={<JobCreate />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/collaborators" element={<Collaborators />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
