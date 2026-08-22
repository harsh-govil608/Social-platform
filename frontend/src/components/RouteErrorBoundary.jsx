import { useRouteError, useNavigate } from 'react-router';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route Error:', error);

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return {
        title: '404 - Page Not Found',
        message: "The page you're looking for doesn't exist or has been moved.",
      };
    }

    if (error?.status === 403) {
      return {
        title: '403 - Access Denied',
        message: "You don't have permission to access this page.",
      };
    }

    if (error?.status >= 500) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
      };
    }

    return {
      title: 'Oops! Something went wrong',
      message: error?.message || 'An unexpected error occurred.',
    };
  };

  const { title, message } = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>

          <h1 className="card-title text-2xl mb-2">{title}</h1>
          <p className="text-base-content/70 mb-6">{message}</p>

          {process.env.NODE_ENV === 'development' && error?.stack && (
            <div className="w-full mb-4">
              <details className="collapse collapse-arrow bg-base-200">
                <summary className="collapse-title text-sm font-medium">
                  Error Stack Trace
                </summary>
                <div className="collapse-content">
                  <pre className="text-xs overflow-auto max-h-60 text-left">
                    {error.stack}
                  </pre>
                </div>
              </details>
            </div>
          )}

          <div className="card-actions gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button onClick={() => navigate('/')} className="btn btn-primary gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
