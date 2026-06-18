import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export function Character({ url }: { url: string }) {
    const meshRef = useRef<THREE.Group>(null);
    const [, getKeys] = useKeyboardControls();
    const { scene } = useGLTF(url);

    useFrame((state, delta) => {
        const { forward, backward, left, right } = getKeys();
        const speed = 5;
        const velocity = new THREE.Vector3(0, 0, 0);

        // Υπολογισμός κατεύθυνσης
        if (forward) velocity.z -= speed * delta;
        if (backward) velocity.z += speed * delta;
        if (left) velocity.x -= speed * delta;
        if (right) velocity.x += speed * delta;

        // Ενημέρωση θέσης του χαρακτήρα
        if (meshRef.current) {
            meshRef.current.position.add(velocity);

            // Προαιρετικό: Στροφή του χαρακτήρα προς την κατεύθυνση κίνησης
            if (velocity.length() > 0) {
                const angle = Math.atan2(velocity.x, velocity.z);
                meshRef.current.rotation.y = angle;
            }
        }
    });

    return <primitive ref={meshRef} object={scene} scale={0.5} position={[0, 0, 0]} castShadow />;
}