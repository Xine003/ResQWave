import { createBrowserRouter } from 'react-router-dom';
import { Outlet, Navigate } from 'react-router-dom';
import React from 'react';
// TypeScript declaration for window property
declare global {
  interface Window {
    isFocalAuthenticated?: boolean;
  }
}
import { OfficialLayout } from '@/components/Official/officialLayout';
import { Landing, LoginFocal } from '../pages/Focal';
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/ForgotPassword';
import VerificationSignin from '../pages/Focal/LoginFocal/VerificationSignin';
import {
  CommunityGroups,
  ForgotPasswordPageDispatcher,
  LoginDispatcher,
  Reports,
  Tabular,
  Visualization
} from '../pages/Official';
import FocalDashboard from '../pages/Focal/Dashboard';

// Protective route for focal pages
const FocalProtectedRoute: React.FC = () => {
  const currentPath = window.location.pathname;
  const isFocalAuthenticated = window.isFocalAuthenticated;
  // --- PROTECTIVE ROUTE LOGIC ---
  // Uncomment the following block for production to protect focal routes:
  /*
  if (!isFocalAuthenticated && currentPath === "/login-focal/focal-dashboard") {
    return <Navigate to="/login-focal" replace />;
  }
  */
  // --- END PROTECTIVE ROUTE LOGIC ---
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  // Focal Routes (protected)
  {
    path: '/login-focal',
    element: <FocalProtectedRoute />,
    children: [
      {
        path: '',
        element: <LoginFocal />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordVerification />,
      },
      {
        path: 'verification-signin',
        element: <VerificationSignin />,
      },
      {
        path: 'focal-dashboard',
        element: <FocalDashboard />,
      },
    ],
  },
  {
    path: '/login-dispatcher',
    element: <LoginDispatcher />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/forgot-password-dispatcher',
    element: <ForgotPasswordPageDispatcher />,
  },
  {
    path: '/',
    element: <OfficialLayout><Outlet /></OfficialLayout>,
    children: [
      {
        path: 'visualization',
        element: <Visualization />
      },
      {
        path: 'reports',
        element: <Reports />
      },
      {
        path: 'community-groups',
        element: <CommunityGroups />
      },
      {
        path: 'tabular',
        element: <Tabular />
      },
    ]
  }
]);