import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 pt-10">
            <SignUp routing="path" path="/register" signInUrl="/login" />
        </div>
    );
};

export default Register;
