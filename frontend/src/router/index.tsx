import { OfficialLayout } from '@/components/Official/OfficialLayout';
import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Landing, LoginFocal, RegisterAccount } from '../pages/Focal';
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/pages/SignAccount/ForgotPassword';
import VerificationSignin from '../pages/Focal/LoginFocal/pages/SignAccount/VerificationSignin';
import VerifyAccount from '../pages/Focal/LoginFocal/pages/RegisterAccount/VerifyAccount';
import InfoDetailsRegister from '../pages/Focal/LoginFocal/pages/RegisterAccount/InfoDetailsRegister';
import {
  CommunityGroups,
  ForgotPasswordPageDispatcher,
  LoginDispatcher,
  Reports,
  Tabular,
  Visualization
} from '../pages/Official';
// TypeScript declaration for window property
declare global {
  interface Window {
    isFocalAuthenticated?: boolean;
  }
}

import FocalDashboard from '../pages/Focal/Dashboard';
import SettingLocationPage from "../pages/Official/CommunityGroups/components/SettingLocationPage";

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
  // Public register route for focal users
  {
    path: '/register-focal',
    element: <RegisterAccount />,
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
        path: '/verify-account-focal',
        element: <VerifyAccount />,
      },
      {
        path: '/register/personal-info',
        element: <InfoDetailsRegister step={1} />,
      },
      {
        path: '/register/profile-picture',
        element: <InfoDetailsRegister step={2} />,
      },
      {
        path: '/register/create-password',
        element: <InfoDetailsRegister step={3} />,
      },
      {
        path: '/register/location-details',
        element: <InfoDetailsRegister step={4} />,
      },
      {
        path: '/register/alternative-focal-person',
        element: <InfoDetailsRegister step={5} />,
      },
      {
        path: '/register/alternative-profile-picture',
        element: <InfoDetailsRegister step={6} />,
      },
      {
        path: '/register/about-neighborhood',
        element: <InfoDetailsRegister step={7} />,
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