import { OfficialLayout } from '@/components/Official/officialLayout';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Landing, LoginFocal } from '../pages/Focal';
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/forgotpassword';
import VerificationSignin from '../pages/Focal/LoginFocal/verificationSignin';
import {
  CommunityGroups,
  ForgotPasswordPageDispatcher,
  LoginDispatcher,
  Reports,
  Tabular,
  Visualization
} from '../pages/Official';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login-focal', 
    element: <LoginFocal />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordVerification />,
  },
  {
    path: '/verification-signin',
    element: <VerificationSignin />,
  },
  {
    path: '/login-dispatcher',
    element: <LoginDispatcher />,
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