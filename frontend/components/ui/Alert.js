export function Alert({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-blue-50 text-blue-800',
    destructive: 'bg-red-50 text-red-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800'
  };

  return (
    <div className={`rounded-md p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }) {
  return (
    <div className={`mt-2 text-sm ${className}`}>
      {children}
    </div>
  );
} 