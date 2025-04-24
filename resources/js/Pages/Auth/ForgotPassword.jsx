import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="hidden md:flex md:w-1/2 bg-indigo-600 flex-col justify-center items-center text-white p-12">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6">
                    <span className="text-white text-2xl font-bold">B</span>
                </div>
                <h1 className="text-3xl font-bold mb-6">Forgot Your Password?</h1>
                <p className="text-lg text-center max-w-md">
                    No worries! We'll send you a link to reset your password and get you back into your account.
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
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700">{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={processing}
                        >
                            {processing ? 'Sending link...' : 'Email Password Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
