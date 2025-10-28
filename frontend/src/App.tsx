import { RouterProvider } from 'react-router-dom';
import './App.css';
import { SocketProvider } from './contexts/SocketContext';
import { router } from './router';


function App() {
  return (
    <SocketProvider>
      {/* <BackendStatus /> */}
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
