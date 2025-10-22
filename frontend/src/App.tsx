import { RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import BackendStatus from './components/BackendStatus';


function App() {
  return (
    <AuthProvider>
      {/* <BackendStatus /> */}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
