import React from 'react';
import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>
      <LoginForm />
    </>
  );
}
