'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QrCode } from 'lucide-react';

interface LogoProps {
    className?: string;
    textClassName?: string;
    dotClassName?: string;
    showText?: boolean;
    animate?: boolean;
}

export function Logo({
    className,
    textClassName,
    dotClassName,
    showText = true,
    animate = true
}: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <motion.div
                initial={animate ? { scale: 0.5, opacity: 0, rotate: -180 } : undefined}
                animate={animate ? { scale: 1, opacity: 1, rotate: 0 } : undefined}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="relative flex items-center justify-center"
            >
                {/* Simulated QR Code transition */}
                <motion.div
                    initial={animate ? { opacity: 1, scale: 1 } : undefined}
                    animate={animate ? { opacity: 0, scale: 0.5 } : undefined}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center text-restaurant-neutral-900"
                >
                    <QrCode className="w-8 h-8" />
                </motion.div>

                {/* Final Logo Icon state (if any specific icon is desired besides text, otherwise just the dot animation mostly) */}
                {/* For "QREats.", the QR code transforms effectively into the brand identity. 
                    The user requested "logo animates from a QR code". 
                    Let's make the QR code shrink/fade into the "Square Dot" or just appear alongside.
                    Actually, let's have the QR code morph into the square dot of the ".". 
                    Or simply, the logo icon appears. 
                    
                    Re-reading: "animates from a QR code in milliseconds"
                    Let's do a sequence: QR Code appears -> Morphs/Fades -> Text "QREats" slides in + Dot appears.
                */}
            </motion.div>

            {/* Text Lockup */}
            {showText && (
                <div className={cn("text-2xl font-black tracking-tighter flex items-center", textClassName)}>
                    <motion.span
                        initial={animate ? { opacity: 0, x: -10 } : undefined}
                        animate={animate ? { opacity: 1, x: 0 } : undefined}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        QREats
                    </motion.span>

                    {/* The Square Dot */}
                    <motion.div
                        initial={animate ? { scale: 0, opacity: 0 } : undefined}
                        animate={animate ? { scale: 1, opacity: 1 } : undefined}
                        /* The QR code could arguably "become" this dot, but keeping them separate for clarity is often safer unless complex morphing is needed.
                           Let's make the QR code appear briefly then vanish as the dot hits. */
                        transition={{ duration: 0.3, delay: 0.7, type: "spring" }}
                        className={cn("w-2 h-2 bg-orange-500 ml-1 rounded-[1px]", dotClassName)}
                    />
                </div>
            )}
        </div>
    );
}

/* 
   Refined Animation Logic based on "logo animates from a QR code":
   1. Start with a QR Code centered.
   2. QR Code spins/scales down.
   3. "QREats" text reveals.
   4. The dot punctuates the end.
   
   Let's adjust the component to be even cooler.
*/

export function AnimatedLogo({
    className,
    size = "default"
}: {
    className?: string,
    size?: "small" | "default" | "large"
}) {
    // Size maps
    const sizeClasses = {
        small: "text-xl",
        default: "text-2xl",
        large: "text-4xl"
    };

    const dotSizes = {
        small: "w-1.5 h-1.5",
        default: "w-2 h-2",
        large: "w-3 h-3"
    };

    const iconSizes = {
        small: "w-4 h-4",
        default: "w-5 h-5",
        large: "w-8 h-8"
    };

    return (
        <div className={cn("flex items-baseline font-display font-black tracking-tighter cursor-default select-none group", sizeClasses[size], className)}>
            {/* Text "QREats" - Reveals width */}
            <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="overflow-hidden whitespace-nowrap flex items-baseline"
            >
                <span className="py-1">QREats</span> {/* Padding for descenders if needed */}
            </motion.div>

            {/* The Moving Element (QR Code -> Dot) */}
            <div className="relative ml-0.5 flex flex-col justify-end self-baseline">
                {/* 
                   QR Code:
                   - Starts visible
                   - Moves right (naturally by flex flow)
                   - Scales down / Fades out after delay
                */}
                <motion.div
                    initial={{ scale: 1, opacity: 1, rotate: 0 }}
                    animate={{ scale: 0, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.4, delay: 0.7, ease: "backIn" }} // Disappears just as text finishes
                    className="absolute bottom-0 left-0 origin-bottom-left"
                    style={{ marginBottom: size === 'small' ? '-2px' : size === 'large' ? '-4px' : '-3px' }} // Fine-tune vertical alignment of the icon
                >
                    <QrCode className={cn("text-orange-500", iconSizes[size])} strokeWidth={2.5} />
                </motion.div>

                {/* 
                   Square Dot:
                   - Appears after QR code disappears
                */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.0, type: "spring" }} // Appears after QR code is gone
                    className={cn("bg-orange-500 rounded-[1px]", dotSizes[size])}
                    style={{ marginBottom: size === 'small' ? '3px' : size === 'large' ? '6px' : '4px' }} // Baseline alignment manual adjustment
                />
            </div>
        </div>
    );
}
