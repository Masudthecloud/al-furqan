import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return to Home
      </button>
    </div>
  );
}