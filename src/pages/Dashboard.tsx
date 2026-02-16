import { useAuth } from '@/contexts/AuthContext';
import ClientDashboard from '@/pages/ClientDashboard';
import KAMDashboard from '@/pages/KAMDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return user?.role === 'kam' ? <KAMDashboard /> : <ClientDashboard />;
};

export default Dashboard;
