import { createBrowserRouter } from 'react-router-dom';
import { Landing, LoginFocal } from '../pages/Focal';
import ForgotPasswordVerification from '../pages/Focal/LoginFocal/forgotpassword';
import VerificationSignin from '../pages/Focal/LoginFocal/verificationSignin';
import { Dashboard, LoginOfficial } from '../pages/Official';

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
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login-official',
    element: <LoginOfficial />,
  },
]);