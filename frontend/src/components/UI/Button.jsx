import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
    const variants = {
        primary: "bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2",
        secondary: "bg-white text-primary border-2 border-primary hover:bg-blue-50",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
