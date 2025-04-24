import React, { useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="hidden md:flex md:w-1/2 bg-indigo-600 flex-col justify-center items-center text-white p-12">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6">
                    <span className="text-white text-2xl font-bold">B</span>
                </div>
                <h1 className="text-3xl font-bold mb-6">Create New Password</h1>
                <p className="text-lg text-center max-w-md">
                    Choose a strong password to keep your BlockStore account secure.
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
                            Enter a new password for your account
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                                readOnly
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={processing}
                        >
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
