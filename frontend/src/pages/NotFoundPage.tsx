import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <AlertCircle size={64} className="text-gray-400 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <Button onClick={() => navigate('/')} variant="default" size="default">
        Go Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
