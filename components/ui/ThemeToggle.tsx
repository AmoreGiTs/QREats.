"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className={cn("w-10 h-10", className)} />
    }

    const isDark = theme === "dark"

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
            // Fallback for browsers without View Transition API
            if (!document.startViewTransition) {
                setTheme(isDark ? "light" : "dark")
                return
            }

            // Get the click position
            const x = e.nativeEvent.clientX
            const y = e.nativeEvent.clientY

            // Calculate the distance to the furthest corner
            const endRadius = Math.hypot(
                Math.max(x, innerWidth - x),
                Math.max(y, innerHeight - y)
            )

            const transition = document.startViewTransition(() => {
                setTheme(isDark ? "light" : "dark")
            })

            transition.ready.then(() => {
                const clipPath = [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ]

                document.documentElement.animate(
                    {
                        clipPath: isDark ? [...clipPath].reverse() : clipPath,
                    },
                    {
                        duration: 500,
                        easing: "ease-in",
                        pseudoElement: isDark
                            ? "::view-transition-old(root)"
                            : "::view-transition-new(root)",
                    }
                )
            })
        }

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                className
            )}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="dark"
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                    >
                        {/* Bulb Off / Dark Mode Icon */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                        >
                            {/* Bulb Outline */}
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                            <path d="M12 2v1" /> {/* Chain/Cord - subtle */}
                            <path d="M19.07 4.93L17.66 6.34C18.15 6.83 18.5 7.5 18.5 8.5C18.5 10.5 17 12 15 12H9C7 12 5.5 10.5 5.5 8.5C5.5 7.5 5.85 6.83 6.34 6.34L4.93 4.93" opacity="0.5" /> {/* Rays dim */}
                            <path d="M12 12v6" />
                            <path d="M12 12C9.5 12 8 10 8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10 14.5 12 12 12Z" />
                        </svg>
                    </motion.div>
                ) : (
                    <motion.div
                        key="light"
                        initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Bulb On / Light Mode Icon */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-orange-500 fill-orange-500/20"
                        >
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                            <path d="M12 2v2" /> {/* Top Ray */}
                            <path d="M12 12v6" />
                            <path d="M12 12C9.5 12 8 10 8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10 14.5 12 12 12Z" />
                            {/* Rays */}
                            <path d="M20 8h2" />
                            <path d="M2 8h2" />
                            <path d="M17.657 13.657l1.414 1.414" />
                            <path d="M4.929 4.929l1.414 1.414" />
                            <path d="M17.657 2.343l1.414 1.414" />
                            <path d="M4.929 11.071l1.414 1.414" />
                        </svg>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}
