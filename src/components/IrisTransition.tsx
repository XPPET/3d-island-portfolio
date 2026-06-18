import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface IrisTransitionProps {
    trigger: boolean;
    onComplete?: () => void;
}

export function IrisTransition({ trigger, onComplete }: IrisTransitionProps) {
    const circleRef = useRef<SVGCircleElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (trigger && circleRef.current) {
            // Animate the radius of the circle mask to 0
            gsap.to(circleRef.current, {
                attr: { r: 0 },
                duration: 1.5,
                ease: "power2.in",
                onComplete: onComplete
            });
        }
    }, [trigger, onComplete]);

    if (!trigger) return null;

    return (
        <div ref={containerRef} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Let clicks pass through until it's fully dark (though usually it's fast)
            zIndex: 1000,
        }}>
            <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <mask id="iris-mask">
                        {/* White rectangle covers everything */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {/* Black circle cuts a hole */}
                        <circle ref={circleRef} cx="50%" cy="50%" r="150%" fill="black" />
                    </mask>
                </defs>
                {/* The overlay rect that gets masked */}
                <rect x="0" y="0" width="100%" height="100%" fill="black" mask="url(#iris-mask)" />
            </svg>
        </div>
    );
}
