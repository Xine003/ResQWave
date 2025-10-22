import { OfficialLayout } from '@/components/Official/officialLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Landing, LoginFocal, RegisterAccount } from '../pages/Focal';
import AccountReview from '../pages/Focal/LoginFocal/pages/RegisterAccount/AccountReview';
import InfoDetailsRegister from '../pages/Focal/LoginFocal/pages/RegisterAccount/InfoDetailsRegister';
import VerifyAccount from '../pages/Focal/LoginFocal/pages/RegisterAccount/VerifyAccount';
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/pages/SignAccount/ForgotPassword';
import VerificationSignin from '../pages/Focal/LoginFocal/pages/SignAccount/VerificationSignin';
import {
    CommunityGroups,
    LoginOfficial,
    Reports,
    Tabular,
    VerificationOfficial,
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
import { Dispatchers } from '../pages/Official/DispatcherCRUD';
import { Terminals } from '../pages/Official/Terminal';

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
        path: '/register/about-residents',
        element: <InfoDetailsRegister step={8} />,
      },
      {
        path: '/register/floodwater-duration',
        element: <InfoDetailsRegister step={9} />,
      },
      {
        path: '/register/flood-hazards',
        element: <InfoDetailsRegister step={10} />,
      },
      {
        path: '/register/other-info',
        element: <InfoDetailsRegister step={11} />,
      },
      {
        path: '/register/account-review',
        element: <AccountReview />,
      },
      {
        path: '/focal-dashboard',
        element: <FocalDashboard />,
      }
    ],
  },

  {
    path: '/login-official',
    element: <LoginOfficial />,
  },
  {
    path: '/verification-official',
    element: <VerificationOfficial />,
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
        path: 'dispatchers',
        element: (
          <ProtectedRoute adminOnly={true}>
            <Dispatchers />
          </ProtectedRoute>
        )
      },
      {
        path: 'terminal',
        element: (
          <ProtectedRoute adminOnly={true}>
            <Terminals />
          </ProtectedRoute>
        )
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