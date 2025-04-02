import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const map_asset = '/test.glb';

export function Map() {
    const scene = useGLTF(map_asset);
    const ref = useRef();

    useEffect(() => {
        scene.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    return (
        <RigidBody type="fixed" colliders='trimesh' position={[0, 0, 0]}>
            <primitive ref={ref} scale={5} object={scene.scene} castShadow receiveShadow />
        </RigidBody>
    );
}

useGLTF.preload(map_asset);