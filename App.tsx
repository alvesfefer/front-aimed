import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import PatientDashboard from './components/dashboards/PatientDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import InstitutionDashboard from './components/dashboards/InstitutionDashboard';
import SOSButton from './components/SOSButton';
import SplashScreen from './components/SplashScreen';
import { UserRole } from './types';

const AppContent = () => {
  const { user } = useApp();
  
  // Authentication View
  if (!user) {
    return <Auth />;
  }

  // Role-Based Dashboards
  return (
    <div className="min-h-screen bg-[#002A32] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 animate-fade-in">
      {user.role === UserRole.PATIENT && <PatientDashboard />}
      {user.role === UserRole.DOCTOR && <DoctorDashboard />}
      {user.role === UserRole.INSTITUTION && <InstitutionDashboard />}
      <SOSButton />
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Remove component after fade transition (3s total)
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <AppProvider>
      {showSplash && <SplashScreen fadeOut={fadeOut} />}
      
      {/* Main App acts as background until splash is gone */}
      <div className="bg-[#002A32] min-h-screen">
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default App;