import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from 'three'


const map_asset = '/city.glb'
export default function Map() {
    const scene = useGLTF(map_asset); // Remplacez par le chemin de votre modèle GLB
    const ref = useRef();

    useEffect(() => {
        scene.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
    })

    return (
        <RigidBody type="fixed" colliders='trimesh'>
            <primitive ref={ref} scale={1} object={scene.scene} />
        </RigidBody>
    )
}

useGLTF.preload(map_asset)