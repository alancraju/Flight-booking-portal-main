import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 pt-10">
            <SignIn routing="path" path="/login" signUpUrl="/register" />
        </div>
    );
};

export default Login;
