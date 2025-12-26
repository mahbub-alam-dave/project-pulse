export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = ''
}) {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}