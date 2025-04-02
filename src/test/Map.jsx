import * as THREE from 'three'
import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';



export default function Map(){
    const scene = useGLTF("/test.glb"); // Remplacez par le chemin de votre modèle GLB
       const ref = useRef();
   
       useEffect(() => {
           scene.scene.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                   child.castShadow = true;
                   child.receiveShadow = true;
               }
           })
       }, [scene]);
   
       return (
           <RigidBody type="fixed" colliders='trimesh' position={[0, 0, 0]}>
               <primitive ref={ref} object={scene.scene} castShadow receiveShadow />
           </RigidBody>
       )
}