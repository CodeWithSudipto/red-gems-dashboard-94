import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard since we're using AppShell layout
  return <Navigate to="/" replace />;
};

export default Index;
