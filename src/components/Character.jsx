import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect } from 'react';

// Composant pour le personnage
export function Character({ animation }) {
    const { scene, animations } = useGLTF('/human.glb');
    const ref = useRef();
    const { actions } = useAnimations(animations, ref);

    useEffect(() => {
        actions?.['Human Armature|' + animation]?.stop();
        actions['Human Armature|' + animation]?.reset().fadeIn(0.24).play();
        return () => actions?.['Human Armature|' + animation]?.fadeOut(0.24);
    }, [animation]);

    return <primitive ref={ref} object={scene} castShadow receiveShadow />;
}