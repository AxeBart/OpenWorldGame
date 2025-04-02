import { useState, useRef, useEffect } from 'react';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { degToRad } from 'three/src/math/MathUtils';
import { Character } from './Character';
import { MathUtils } from 'three/src/math/MathUtils';

// Contrôles du personnage


// Normalisation de l'angle
const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
};

// Interpolation d'angle
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

// Composant pour le collider du personnage
export function CharacterCollider() {
    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
        "Character Control",
        {
            WALK_SPEED: { value: 10 },
            RUN_SPEED: { value: 40 },
            ROTATION_SPEED: {
                value: degToRad(.9),
                min: degToRad(0.1),
                max: degToRad(5),
                step: degToRad(0.4),
            },
        }
    );

    const [shaking, setShaking] = useState(false);
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
        document.addEventListener("touchstart", onMouseDown);
        document.addEventListener("touchend", onMouseUp);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("touchstart", onMouseDown);
            document.removeEventListener("touchend", onMouseUp);
        };
    }, []);

    useFrame(({ camera }) => {
        if (rb.current) {
            const vel = rb.current.linvel();
            const movement = { x: 0, z: 0 };

            if (get().forward) movement.z = 2;
            if (get().backward) movement.z = -2;
            let speed = get().run ? RUN_SPEED : WALK_SPEED;

            if (get().left) movement.x = 2;
            if (get().right) movement.x = -2;

            if (movement.x !== 0) {
                rotationTarget.current += ROTATION_SPEED * movement.x;
            }

            if (movement.x !== 0 || movement.z !== 0) {
                characterRotationTarget.current = Math.atan2(movement.x, movement.z);
                vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed;
                vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed;
                setAnimation(speed === RUN_SPEED ? "Run" : "Walk");
            } else {
                vel.x = 0;
                vel.z = 0;
                setAnimation("Idle");
            }

            character.current.rotation.y = lerpAngle(character.current.rotation.y, characterRotationTarget.current, .3);
            rb.current.setLinvel(vel, true);
        }

        container.current.rotation.y = MathUtils.lerp(container.current.rotation.y, rotationTarget.current, .5);
        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, 1);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 1);
            camera.lookAt(cameraLookAt.current);
        }
    });

    return (
        <RigidBody colliders={false} mass={40000} ref={rb} position={[0, 5, -10]} lockRotations scale={2}>
            <group ref={container}>
                <group ref={cameraTarget} position-z={100} position-y={10} position-x={1} />
                <group ref={cameraPosition} position-z={-8} position-y={6} />
                <group ref={character} onClick={() => { console.log("clicked ! human") }} castShadow receiveShadow>
                    <Character animation={animation} />
                </group>
            </group>
            <CapsuleCollider args={[1, 0.6]} position={[0, 2, 0]} scale={1.5} />
        </RigidBody>
    );
}
