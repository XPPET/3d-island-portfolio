import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function Rain({ count = 1000 }) {
    const rainRef = useRef<THREE.Points>(null);
    const rainPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 20; // x
        rainPositions[i * 3 + 1] = Math.random() * 20;     // y
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }

    useFrame((state, delta) => {
        if (!rainRef.current) return;
        const positions = (rainRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] -= delta * 10 + Math.random() * 5; // Fall speed
            if (positions[i * 3 + 1] < -2) {
                positions[i * 3 + 1] = 15; // Reset to top
            }
        }
        rainRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={rainRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={rainPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#aaaaaa"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
}

export function Snow({ count = 1000 }) {
    const snowRef = useRef<THREE.Points>(null);
    const snowPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        snowPositions[i * 3] = (Math.random() - 0.5) * 20;
        snowPositions[i * 3 + 1] = Math.random() * 20;
        snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    useFrame((state, delta) => {
        if (!snowRef.current) return;
        const positions = (snowRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] -= delta * 2 + Math.random();
            positions[i * 3] += (Math.random() - 0.5) * delta; // Drift
            if (positions[i * 3 + 1] < -2) {
                positions[i * 3 + 1] = 15;
            }
        }
        snowRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={snowRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={snowPositions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.8}
                sizeAttenuation={true}
            />
        </points>
    );
}
