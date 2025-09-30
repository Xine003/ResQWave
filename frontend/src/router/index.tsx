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
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/pages/ForgotPassword';
import VerificationSignin from '../pages/Focal/LoginFocal/pages/VerificationSignin';
import {
  CommunityGroups,
  ForgotPasswordPageDispatcher,
  LoginDispatcher,
  Reports,
  Tabular,
  Visualization
} from '../pages/Official';

import SettingLocationPage from "../pages/Official/CommunityGroups/components/SettingLocationPage";
import FocalDashboard from '../pages/Focal/Dashboard';

// Protective route for focal pages
const FocalProtectedRoute: React.FC = () => {
  const currentPath = window.location.pathname;
  const isFocalAuthenticated = window.isFocalAuthenticated;
  // --- PROTECTIVE ROUTE LOGIC ---
  // Uncomment the following block for production to protect focal routes:
  /*
  if (!isFocalAuthenticated && currentPath === "/focal-dashboard") {
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
  // Public login route for focal users
  {
    path: '/login-focal',
    element: <LoginFocal />,
  },
  // Focal Routes (protected)
  {
    element: <FocalProtectedRoute />,
    children: [
      {
        path: '/forgot-password-focal',
        element: <ForgotPasswordVerification />,
      },
      {
        path: '/verification-signin-focal',
        element: <VerificationSignin />,
      },
      {
        path: '/focal-dashboard',
        element: <FocalDashboard />,
      }
    ],
  },

  {
    path: '/login-dispatcher',
    element: <LoginDispatcher />,
  },
  {
    path: '/forgot-passwo rd-dispatcher',
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
  },
  {
    path: 'community-groups/setting-location',
    element: <SettingLocationPage />
  },
]);