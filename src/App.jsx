import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Sky } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { useControls } from 'leva'
import { MathUtils, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Leva } from 'leva'
import { Human } from '../Human'
import { EffectComposer, Bloom, Vignette, DepthOfField, Noise } from '@react-three/postprocessing'
// import { Sky } from '@react-three/drei'



// Global variables
const map_asset = '/mini city test.glb'

const controls = [
    { name: 'forward', keys: ['KeyW'] },
    { name: 'backward', keys: ['KeyS'] },
    { name: 'left', keys: ['KeyA'] },
    { name: 'right', keys: ['KeyD'] },
    { name: 'run', keys: ['KeyL'] },
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




const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
};

const lerpAngle = (start, end, t) => {
    start = normalizeAngle(start);
    end = normalizeAngle(end);

    if (Math.abs(end - start) > Math.PI) {
        if (end > start) {
            start += 2 * Math.PI;
        } else {
            end += 2 * Math.PI;
        }
    }

    return normalizeAngle(start + (end - start) * t);
};



function CharacterCollider() {
    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
        "Character Control",
        {
            WALK_SPEED: { value: 5 },
            RUN_SPEED: { value : 40 },
            ROTATION_SPEED: {
                value: degToRad(.9),
                min: degToRad(0.1),
                max: degToRad(5),
                step: degToRad(0.4),
            },
        }
    );
    const rb = useRef();
    const container = useRef();
    const character = useRef();

    const [animation, setAnimation] = useState("Idle");

    const characterRotationTarget = useRef(0);
    const rotationTarget = useRef(0);
    const cameraTarget = useRef();
    const cameraPosition = useRef();
    const cameraWorldPosition = useRef(new Vector3());
    const cameraLookAtWorldPosition = useRef(new Vector3());
    const cameraLookAt = useRef(new Vector3());
    const [, get] = useKeyboardControls();
    const isClicking = useRef(false);

    useEffect(() => {
        const onMouseDown = (e) => {
            isClicking.current = true;
        };
        const onMouseUp = (e) => {
            isClicking.current = false;
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        // touch
        document.addEventListener("touchstart", onMouseDown);
        document.addEventListener("touchend", onMouseUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("touchstart", onMouseDown);
            document.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useFrame(({ camera, mouse }) => {
        if (rb.current) {
            const vel = rb.current.linvel();

            const movement = {
                x: 0,
                z: 0,
            };

            if (get().forward) {
                movement.z = 2;
            }
            if (get().backward) {
                movement.z = -2;
            }

            let speed = get().run ? RUN_SPEED : WALK_SPEED;

            if (isClicking.current) {
                if (Math.abs(mouse.x) > 0.1) {
                    movement.x = -mouse.x;
                }
                movement.z = mouse.y + 0.4;
                if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.5) {
                    speed = RUN_SPEED;
                }
            }

            if (get().left) {
                movement.x = 2;
            }
            if (get().right) {
                movement.x = -2;
            }

            if (movement.x !== 0) {
                rotationTarget.current += ROTATION_SPEED * movement.x;
            }

            if (movement.x !== 0 || movement.z !== 0) {
                characterRotationTarget.current = Math.atan2(movement.x, movement.z);
                vel.x =
                    Math.sin(rotationTarget.current + characterRotationTarget.current) *
                    speed;
                vel.z =
                    Math.cos(rotationTarget.current + characterRotationTarget.current) *
                    speed;
                if (speed === RUN_SPEED) {
                    setAnimation("Run");
                } else {
                    setAnimation("Walk");
                }
            } else {
                // Arrête le personnage immédiatement
                vel.x = 0;
                vel.z = 0;
                setAnimation("Idle");
            }
            character.current.rotation.y = lerpAngle(
                character.current.rotation.y,
                characterRotationTarget.current,
                .3
            );

            rb.current.setLinvel(vel, 5);
        }

        // CAMERA
        container.current.rotation.y = MathUtils.lerp(
            container.current.rotation.y,
            rotationTarget.current,
            1
        );

        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 1);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 1);

            camera.lookAt(cameraLookAt.current);
        }
    });

    return (
        <RigidBody colliders={false} ref={rb} position={[0, .5, -10]} lockRotations scale={1}>
            <group ref={container}>
                <group ref={cameraTarget} position-z={100} position-y={-10} position-x={1} />
                <group ref={cameraPosition} position-z={-8} position-y={5} />
                <group ref={character} castShadow receiveShadow>
                    <Human animation={'Human Armature|' + animation} scale={1} />
                </group>
            </group>
            <CapsuleCollider args={[1, 0.6]} position={[0, 1.5, 0]} scale={1} />
        </RigidBody>
    );
}


function Map() {
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
            <primitive ref={ref} scale={3} object={scene.scene} />
        </RigidBody>
    )
}

useGLTF.preload(map_asset)

function Lights() {
    return (
        <>
            <ambientLight intensity={0.3} color={"#ffeecc"} />
            <directionalLight
                intensity={2} // Augmenter la puissance pour simuler le soleil
                color={"#ffddaa"} // Lumière chaude pour un effet coucher de soleil
                position={[50, 100, -50]} // Position élevée pour simuler le soleil
                castShadow


            />
            <hemisphereLight
                skyColor={"#141b83"} // Bleu du ciel
                groundColor={"#463D36"} // Teinte du sol
                intensity={0.5}
            />
            <Sky
                skyColor={"#141b83"} // Bleu du ciel
                sunPosition={[100, 50, -100]} // Place le soleil à l’horizon
                inclination={0.49} // Angle du soleil (simule un coucher de soleil)
                turbidity={100} // Brume atmosphérique
                rayleigh={2} // Diffusion de la lumière

            />
        </>
    )
}

function Game() {
    return (
        <KeyboardControls map={controls}>
            <Leva hidden />
            <Canvas shadows
                camera={{ fov: 75, near: 0.1, far: 500, position: [0, 10, -10] }}
                style={{ width: '100vw', height: '100vh' }}
                dpr={[0.4, 0.4]}
                
            >


                <Sky />


                <EffectComposer>
                    <DepthOfField focusDistance={0} focalLength={0.05} bokehScale={3} height={480} />
                    {/* <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> */}
                    <Noise opacity={0.02} />
                    {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
                </EffectComposer>
                {/* <OrbitControls /> */}


                {/* <Physics debug > */}
                <Physics  >
                    <Lights />
                    <Map />
                    <CharacterCollider />
                </Physics>
            </Canvas>
        </KeyboardControls>
    )
}



export default App;
