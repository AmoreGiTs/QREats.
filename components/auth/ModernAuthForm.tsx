'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Lock,
    Mail,
    Smartphone,
    Eye,
    EyeOff,
    ChefHat,
    CreditCard,
    Store
} from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
    restaurantName: z.string().min(2, 'Restaurant name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and numbers'),
    confirmPassword: z.string(),
    plan: z.enum(['basic', 'pro', 'enterprise'])
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function ModernAuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData | RegisterFormData>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema)
    });

    const onSubmit = async (data: LoginFormData | RegisterFormData) => {
        setIsLoading(true);
        setAuthError(null);
        setAuthSuccess(null);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setAuthSuccess(result.message || (isLogin ? 'Login successful!' : 'Registration successful!'));

                // Redirect after successful login
                if (isLogin && result.user?.restaurantId) {
                    setTimeout(() => {
                        window.location.href = `/${result.user.restaurant?.slug || 'dashboard'}`;
                    }, 1500);
                } else if (!isLogin) {
                    // Switch to login after successful registration
                    setTimeout(() => {
                        setIsLogin(true);
                        reset();
                        setAuthSuccess('Account created! Please log in.');
                    }, 1500);
                }
            } else {
                setAuthError(result.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setAuthError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Dev Credentials Helper */}
                {process.env.NODE_ENV === 'development' && isLogin && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-bold text-blue-900 mb-2">🔧 Test Credentials</p>
                        <p className="text-xs text-blue-700">Email: <code className="bg-blue-100 px-1 rounded">admin@test.com</code></p>
                        <p className="text-xs text-blue-700">Password: <code className="bg-blue-100 px-1 rounded">password123</code></p>
                    </div>
                )}

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-restaurant-neutral-200">
                    {/* Decorative Header */}
                    <div className="relative h-32 bg-linear-to-r from-restaurant-primary-500 to-restaurant-food-500 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-100/20 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

                        {/* Animated Floating Icons */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute top-6 left-6 text-white/20"
                        >
                            <ChefHat className="w-8 h-8" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                            className="absolute top-10 right-10 text-white/20"
                        >
                            <CreditCard className="w-6 h-6" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}
                            className="absolute bottom-6 right-6 text-white/20"
                        >
                            <Store className="w-8 h-8" />
                        </motion.div>

                        {/* Logo/Brand */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <AnimatedLogo className="text-white text-3xl justify-center" size="large" />
                                <p className="text-white/80 text-sm mt-1">
                                    {isLogin ? 'Welcome back!' : 'Start your restaurant journey'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Form Toggle */}
                                <div className="flex mb-8 bg-restaurant-neutral-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setIsLogin(true)}
                                        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${isLogin
                                            ? 'bg-white shadow-sm text-restaurant-primary-600'
                                            : 'text-restaurant-neutral-600 hover:text-restaurant-neutral-900'
                                            }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => setIsLogin(false)}
                                        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${!isLogin
                                            ? 'bg-white shadow-sm text-restaurant-primary-600'
                                            : 'text-restaurant-neutral-600 hover:text-restaurant-neutral-900'
                                            }`}
                                    >
                                        Register
                                    </button>
                                </div>

                                {/* Error/Success Messages */}
                                {authError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            {authError}
                                        </p>
                                    </div>
                                )}

                                {authSuccess && (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {authSuccess}
                                        </p>
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {!isLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                                Restaurant Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-restaurant-neutral-400">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <input
                                                    {...register('restaurantName')}
                                                    type="text"
                                                    placeholder="Your Restaurant"
                                                    className="w-full pl-10 pr-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                            {(errors as any).restaurantName && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {(errors as any).restaurantName.message as string}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-restaurant-neutral-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                placeholder="you@restaurant.com"
                                                className="w-full pl-10 pr-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email.message as string}
                                            </p>
                                        )}
                                    </div>

                                    {!isLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-restaurant-neutral-400">
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    {...register('phone')}
                                                    type="tel"
                                                    placeholder="+254 7XX XXX XXX"
                                                    className="w-full pl-10 pr-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                            {(errors as any).phone && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {(errors as any).phone.message as string}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-restaurant-neutral-400">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-12 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-restaurant-neutral-400 hover:text-restaurant-neutral-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.password.message as string}
                                            </p>
                                        )}
                                    </div>

                                    {!isLogin && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    {...register('confirmPassword')}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-3 border border-restaurant-neutral-300 rounded-lg focus:ring-2 focus:ring-restaurant-primary-500 focus:border-transparent transition-all outline-none"
                                                />
                                                {(errors as any).confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {(errors as any).confirmPassword.message as string}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-restaurant-neutral-700 mb-2">
                                                    Plan Selection
                                                </label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'basic', name: 'Basic', price: 'Ksh 2,000' },
                                                        { id: 'pro', name: 'Pro', price: 'Ksh 5,000' },
                                                        { id: 'enterprise', name: 'Enterprise', price: 'Ksh 15,000' }
                                                    ].map((plan) => (
                                                        <label
                                                            key={plan.id}
                                                            className={`relative border rounded-lg p-3 cursor-pointer transition-all ${
                                                                // Compare with watch if using react-hook-form watch
                                                                'bg-restaurant-primary-50 border-restaurant-primary-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={plan.id}
                                                                {...register('plan')}
                                                                className="sr-only"
                                                            />
                                                            <div className="text-center">
                                                                <div className="font-medium text-restaurant-neutral-900">
                                                                    {plan.name}
                                                                </div>
                                                                <div className="text-sm text-restaurant-neutral-600">
                                                                    {plan.price}/mo
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {isLogin && (
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register('rememberMe')}
                                                    className="w-4 h-4 text-restaurant-primary-600 rounded border-restaurant-neutral-300 focus:ring-restaurant-primary-500"
                                                />
                                                <span className="ml-2 text-sm text-restaurant-neutral-700">
                                                    Remember me
                                                </span>
                                            </label>
                                            <a
                                                href="/forgot-password"
                                                className="text-sm text-restaurant-primary-600 hover:text-restaurant-primary-700"
                                            >
                                                Forgot password?
                                            </a>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-linear-to-r from-restaurant-primary-600 to-restaurant-primary-700 text-white py-3.5 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-restaurant-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : isLogin ? (
                                            'Sign In'
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-restaurant-neutral-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-restaurant-neutral-500">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                {/* Social Login (Design Only) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 py-2.5 border border-restaurant-neutral-300 rounded-lg hover:bg-restaurant-neutral-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex items-center justify-center gap-2 py-2.5 border border-restaurant-neutral-300 rounded-lg hover:bg-restaurant-neutral-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium">Facebook</span>
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Terms */}
                        <p className="mt-6 text-center text-xs text-restaurant-neutral-500">
                            By continuing, you agree to our{' '}
                            <a href="/terms" className="text-restaurant-primary-600 hover:underline">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-restaurant-primary-600 hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
