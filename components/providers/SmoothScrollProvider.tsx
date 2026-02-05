'use client'

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.2,
            smoothWheel: true,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        }}>
            {children}
        </ReactLenis>
    )
}
