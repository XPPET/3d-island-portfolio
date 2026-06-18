import { useThree, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

interface CameraControllerProps {
    trigger: boolean;
    targetPosition: [number, number, number];
    targetLookAt: [number, number, number];
}

export function CameraController({ trigger, targetPosition, targetLookAt }: CameraControllerProps) {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (trigger) {
            // Disable orbital controls if they exist
            if (controls) {
                // @ts-ignore - orbital controls might not be typed fully in the context
                (controls as any).enabled = false;
            }

            const currentLookAt = new THREE.Vector3(0, 0, 0); // Default lookat
            // If controls have a target, use that as start
            if (controls && (controls as any).target) {
                currentLookAt.copy((controls as any).target);
            }

            // Animate Position
            gsap.to(camera.position, {
                x: targetPosition[0],
                y: targetPosition[1],
                z: targetPosition[2],
                duration: 2,
                ease: "power2.inOut"
            });

            // Animate LookAt (we need to update the controls target or camera rotation manually)
            // If using OrbitControls, we animate its target
            if (controls) {
                gsap.to((controls as any).target, {
                    x: targetLookAt[0],
                    y: targetLookAt[1],
                    z: targetLookAt[2],
                    duration: 2,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        // (controls as any).update(); // standard controls update might fight with this
                    }
                });
            } else {
                // Fallback for non-orbit controls (manual lookAt tweening is harder without a proxy object)
                // simple implementation:
            }
        }
    }, [trigger, camera, controls, targetPosition, targetLookAt]);

    return null;
}
