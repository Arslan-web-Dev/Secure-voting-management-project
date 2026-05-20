import React from 'react';
import SignUpForm from '@/features/auth/components/SignUpForm';

export default function SignUpPage() {
  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <h2 className="text-center text-xl font-bold text-slate-900 dark:text-white">
          Create your account
        </h2>
      </div>
      <SignUpForm />
    </>
  );
}
