import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Leva } from 'leva';
import { EffectComposer, Noise } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { Lights } from './Light';
import { Map } from './Map';
import { CharacterCollider } from './CharacterCollider';


const controls = [
    { name: 'forward', keys: ['KeyW'] },
    { name: 'backward', keys: ['KeyS'] },
    { name: 'left', keys: ['KeyA'] },
    { name: 'right', keys: ['KeyD'] },
    { name: 'run', keys: ['KeyL'] },
];
// Composant principal du jeu
export function Game() {
  return (
      <KeyboardControls map={controls}>
          <Leva hidden />
          <Canvas
              camera={{ fov: 60, near: 0.1, far: 500, position: [0, 10, -10] }}
              style={{ width: '100vw', height: '100vh' }}
              dpr={[0.5, 0.5]}
          >
              <EffectComposer>
                  <Noise opacity={0.02} />
              </EffectComposer>
              <Physics>
                  <Lights />
                  <Map />
                  <CharacterCollider />
              </Physics>
          </Canvas>
      </KeyboardControls>
  );
}
