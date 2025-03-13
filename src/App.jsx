import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { Vector3 } from 'three/src/Three.Core.js'



// Global variables
const PlayerParams = {
    walkSpeed: 3
}

const controls = [
    { name: 'forward', keys: ['KeyW'] },
    { name: 'backward', keys: ['KeyS'] },
    { name: 'left', keys: ['KeyA'] },
    { name: 'right', keys: ['KeyD'] },
]

function App() {
    return (
        <Game></Game>
    );
}

function Character({ animation }) {
    const { scene, animations } = useGLTF('/human.glb'); // Remplacez par le chemin de votre modèle GLB
    const ref = useRef();
    const { actions } = useAnimations(animations, ref);

    useEffect(() => {
        actions?.['Human Armature|' + animation]?.stop(); // Arrête l'animation en cours
        actions['Human Armature|' + animation]?.reset().fadeIn(0.24).play();
        return () => actions?.['Human Armature|' + animation]?.fadeOut(0.24);
    }, [animation]);

    return <primitive ref={ref} object={scene} castShadow receiveShadow scale={0.7} />;
}

function CharacterCollider() {
    const rb = useRef();
    const [, get] = useKeyboardControls();
    const [animation, setAnimation] = useState("Idle");

    const container = useRef();
    const cameraPosition = useRef();
    const cameraTarget = useRef();

    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());



    useFrame(({ camera }) => {
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 0.4);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.4);
            camera.lookAt(cameraLookAt.current);
        }



        // container.current.rotation.y += .01;
        // rb.current.rotation.y += .01;
        // Mise à jour de la caméra en fonction de la souris
        // camera.rotation.x -= mouse.current.y * sensitivity;
        // camera.rotation.y -= mouse.current.x * sensitivity;

        if (rb.current) {
            const vel = rb.current.linvel();
            let moveX = 0
            let moveZ = 0


            if (get().forward) {
                moveZ += PlayerParams.walkSpeed;
            }
            if (get().backward) {
                moveZ -= PlayerParams.walkSpeed;
            }
            if (get().left) {
                moveX += PlayerParams.walkSpeed;
            }
            if (get().right) {
                moveX -= PlayerParams.walkSpeed;
            }

            rb.current.setLinvel({ x: moveX, y: 0, z: moveZ }, true);
            setAnimation(moveX !== 0 || moveZ !== 0 ? "Walk" : "Idle");
        }
    });

    return (

        <RigidBody colliders={false} ref={rb} position={[0, .5, -10]} lockRotations scale={.55}>
            <group ref={container}>
                <group ref={cameraTarget} position-z={20} />
                <group ref={cameraPosition} position-z={-5} position-y={4} />
                <Character animation={animation} />
                <CapsuleCollider args={[1, 0.6]} position={[0, 1.62, 0]} scale={1}/>
            </group>
        </RigidBody>
    );
}


function Map() {
    const scene = useGLTF('/map.glb'); // Remplacez par le chemin de votre modèle GLB
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
            <primitive ref={ref} object={scene.scene} />
        </RigidBody>
    )
}

function Lights() {
    return (
        <>
            <ambientLight intensity={0.8} color={0xfffcf4} castShadow/>
            <directionalLight
                intensity={.5}
                color={0xFFF2DF}
                position={[25, 18, -25]}
                rotation={[0, 3, 20]}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-15}
                shadow-camera-right={15}
                shadow-camera-top={15}
                shadow-camera-bottom={-15}
            />
        </>
    )
}

function Game() {
    return (
        <KeyboardControls map={controls}>
            <Canvas
                camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 10, -10] }}
                style={{ width: '100vw', height: '100vh' }}
            >
                {/* <OrbitControls /> */}
              
                <Physics debug>
                <Lights />
                    <Map />
                    <CharacterCollider />
                </Physics>
            </Canvas>
        </KeyboardControls>
    )
}

export default App;
