import { createBrowserRouter } from 'react-router-dom';
import { Landing, LoginFocal } from '../pages/Focal';
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
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login-official',
    element: <LoginOfficial />,
  },
]);