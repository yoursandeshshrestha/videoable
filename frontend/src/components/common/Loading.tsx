import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: number;
  message?: string;
}

const Loading = ({ size = 40, message }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={size} className="animate-spin text-blue-600" />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default Loading;

