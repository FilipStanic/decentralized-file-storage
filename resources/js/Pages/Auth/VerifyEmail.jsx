import React from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="hidden md:flex md:w-1/2 bg-indigo-600 flex-col justify-center items-center text-white p-12">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6">
                    <span className="text-white text-2xl font-bold">B</span>
                </div>
                <h1 className="text-3xl font-bold mb-6">Verify Your Email</h1>
                <p className="text-lg text-center max-w-md">
                    We need to verify your email to ensure the security of your BlockStore account.
                </p>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center md:hidden">
                                <span className="text-white font-bold">B</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Email Verification</h2>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                            Thanks for signing up! Before getting started, could you verify your email address by clicking on
                            the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700">
                                A new verification link has been sent to the email address you provided during registration.
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="mb-6">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </form>

                    <div className="text-center">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
