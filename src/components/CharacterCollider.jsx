import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useControls } from 'leva';
import { useRef, useState, useEffect } from 'react';
import { Vector3, MathUtils } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Human } from '../../Human';
import { lerpAngle } from '../App';

export function CharacterCollider() {
    const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
        "Character Control",
        {
            WALK_SPEED: { value: 5 },
            RUN_SPEED: { value: 20 },
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
                0.1
            );

            rb.current.setLinvel(vel, 5);
        }

        // CAMERA
        container.current.rotation.y = MathUtils.lerp(
            container.current.rotation.y,
            rotationTarget.current,
            0.6
        );

        cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
        camera.position.lerp(cameraWorldPosition.current, .8);

        if (cameraTarget.current) {
            cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
            cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, .8);

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
