'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowRight, Check, ChevronDown, Loader2, Search, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ALL_COUNTRY_CODES } from '@/lib/country-codes';
import { cn } from '@/lib/utils';

// Validation Schema
const formSchema = z.object({
    restaurantName: z.string().min(2, "Restaurant name is too short"),
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(5, "Please enter a valid phone number"),
    tables: z.string().min(1, "Please select number of tables"),
    pos: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Default to UAE or US as initial state
const DEFAULT_COUNTRY = ALL_COUNTRY_CODES.find(c => c.code === 'AE') || ALL_COUNTRY_CODES[0];

export default function BookDemoForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Dropdown state
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tables: "",
        }
    });

    const phoneNumber = watch('phone');

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // IP-based Country Detection
    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code) {
                    const detected = ALL_COUNTRY_CODES.find(c => c.code === data.country_code);
                    if (detected) {
                        setSelectedCountry(detected);
                    }
                }
            } catch (error) {
                console.error('Failed to detect country:', error);
            }
        };

        detectCountry();
    }, []);

    const filteredCountries = useMemo(() => 
        ALL_COUNTRY_CODES.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.dial.includes(searchQuery) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]);

    // Handle Phone Change with Auto-detection
    const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue('phone', value);

        if (value.startsWith('+')) {
            const normalizedInput = value.replace(/[^\d+]/g, '');
            const matched = ALL_COUNTRY_CODES
                .filter(c => {
                    const normalizedDial = c.dial.replace(/[^\d+]/g, '');
                    return normalizedInput.startsWith(normalizedDial);
                })
                .sort((a, b) => b.dial.replace(/[^\d+]/g, '').length - a.dial.replace(/[^\d+]/g, '').length)[0];

            if (matched && matched.code !== selectedCountry.code) {
                setSelectedCountry(matched);
            }
        }
    };

    // Keyboard Navigation for Dropdown
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev + 1) % filteredCountries.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev - 1 + filteredCountries.length) % filteredCountries.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0) {
                    selectCountry(filteredCountries[focusedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const selectCountry = (country: typeof DEFAULT_COUNTRY) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
    };

    // Scroll focused item into view
    useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            const element = listRef.current.children[focusedIndex] as HTMLElement;
            if (element) {
                element.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [focusedIndex]);

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        console.log('Submitting:', { ...data, fullPhone: `${selectedCountry.dial}${data.phone}` });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h3>
                <p className="text-gray-600 mb-8">
                    Thanks for your interest in QREats. One of our restaurant success managers will contact you shortly to schedule your demo.
                </p>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                >
                    Book another demo
                </button>
            </div>
        );
    }

    return (
        <div className="h-full bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-xl border border-white/50 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 via-pink-500 to-purple-500" />

            <div className="mb-8 relative z-10">
                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Book Your Demo</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Unlock the full potential of your restaurant with our intelligent management platform.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                <div className="space-y-1">
                    <label htmlFor="restaurantName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Restaurant Name
                    </label>
                    <input
                        {...register('restaurantName')}
                        id="restaurantName"
                        placeholder="e.g. The Burger Joint"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                            errors.restaurantName ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        )}
                    />
                    {errors.restaurantName && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.restaurantName.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="firstName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            First Name
                        </label>
                        <input
                            {...register('firstName')}
                            id="firstName"
                            placeholder="John"
                            className={cn(
                                "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                errors.firstName ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            )}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.firstName.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="lastName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Last Name
                        </label>
                        <input
                            {...register('lastName')}
                            id="lastName"
                            placeholder="Doe"
                            className={cn(
                                "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                errors.lastName ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            )}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.lastName.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Mobile Number
                    </label>
                    <div className="relative flex gap-2">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                onKeyDown={handleKeyDown}
                                aria-haspopup="listbox"
                                aria-expanded={isOpen}
                                className="flex items-center gap-2 w-[110px] pl-3 pr-2 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-900 font-medium cursor-pointer"
                            >
                                <span className="text-lg leading-none">{selectedCountry.flag}</span>
                                <span className="text-sm truncate">{selectedCountry.dial}</span>
                                <ChevronDown size={14} className={cn("ml-auto text-gray-400 transition-transform", isOpen && "rotate-180")} />
                            </button>

                            {isOpen && (
                                <div className="absolute top-full left-0 mt-2 w-[280px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                    <div className="p-3 border-b border-gray-100 bg-white/50 sticky top-0 backdrop-blur-md">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search country..."
                                                autoFocus
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div
                                        ref={listRef}
                                        data-lenis-prevent
                                        role="listbox"
                                        className="max-h-[240px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent p-1"
                                    >
                                        {filteredCountries.length > 0 ? (
                                            filteredCountries.map((c, idx) => (
                                                <button
                                                    key={c.code}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={selectedCountry.code === c.code}
                                                    onClick={() => selectCountry(c)}
                                                    onMouseMove={() => setFocusedIndex(idx)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors text-left",
                                                        selectedCountry.code === c.code ? "bg-orange-50 text-orange-700" : "text-gray-700",
                                                        focusedIndex === idx && "bg-gray-100"
                                                    )}
                                                >
                                                    <span className="text-xl leading-none">{c.flag}</span>
                                                    <span className="font-semibold w-12">{c.dial}</span>
                                                    <span className="truncate flex-1 text-gray-500 text-xs">{c.name}</span>
                                                    {selectedCountry.code === c.code && <Check size={14} />}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-gray-400">
                                                No countries found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative flex-1">
                            <input
                                {...register('phone')}
                                type="tel"
                                id="phone"
                                onChange={onPhoneChange}
                                placeholder="555-0123"
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                                    errors.phone ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                )}
                            />
                        </div>
                    </div>
                    {errors.phone && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.phone.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="john@restaurant.com"
                        className={cn(
                            "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium",
                            errors.email ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        )}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="tables" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Tables
                        </label>
                        <div className="relative">
                            <select
                                {...register('tables')}
                                id="tables"
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl bg-white/50 border outline-none transition-all text-gray-900 font-medium appearance-none cursor-pointer",
                                    errors.tables ? "border-red-500 ring-2 ring-red-100" : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                )}
                            >
                                <option value="" disabled>Select...</option>
                                <option value="1-10">1-10</option>
                                <option value="11-30">11-30</option>
                                <option value="31-50">31-50</option>
                                <option value="50+">50+</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.tables && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.tables.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="pos" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                            POS System
                        </label>
                        <input
                            {...register('pos')}
                            type="text"
                            id="pos"
                            placeholder="e.g. Toast"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            Confirm Request <ArrowRight size={20} />
                        </>
                    )}
                </button>

                <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                    By clicking &quot;Confirm Request&quot; you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                </p>
            </form>
        </div>
    );
}

