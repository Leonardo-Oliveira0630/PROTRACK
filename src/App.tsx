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
import UrgencyAlertModal from './components/UrgencyAlertModal';
import QuickSwitchModal from './components/QuickSwitchModal';
import ProductionCalendar from './pages/ProductionCalendar';
import JobDetails from './pages/JobDetails';
import Dentists from './pages/Dentists';
import JobTypes from './pages/JobTypes';
import BoxColors from './pages/BoxColors';
import { Menu, Hexagon } from 'lucide-react';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { toggleMobileMenu } = useApp();
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full w-full lg:pl-64 transition-all duration-300 relative">
        <header className="lg:hidden bg-[#0f172a] text-white p-4 flex items-center justify-between shrink-0 shadow-md z-40">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-300">DL</span>
                    </div>
                </div>
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white">
                    ProTrack
                </span>
            </div>
            <button 
                onClick={toggleMobileMenu} 
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 active:bg-slate-700 transition-colors"
                aria-label="Abrir menu"
            >
                <Menu size={24} />
            </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 w-full scroll-smooth">
          <div className="max-w-7xl mx-auto w-full pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
      <GlobalScanModal />
      <UrgencyAlertModal />
      <QuickSwitchModal />
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
      <Routes>
        <Route path="/*" element={
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
                    <Route path="/dentists" element={<Dentists />} />
                    <Route path="/job-types" element={<JobTypes />} />
                    <Route path="/box-colors" element={<BoxColors />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        } />
      </Routes>
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