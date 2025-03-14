import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
export const Map = () => {
    const map = useGLTF("/map.glb")
    useEffect(() => {
        map.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    });

    return (
        <primitive object={map.scene} />
    );
};

useGLTF.preload("/map.glb")