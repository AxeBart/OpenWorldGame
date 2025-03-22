import { Sky } from '@react-three/drei';

export function Lights() {
    return (
        <>
            <ambientLight intensity={0.3} color={"#ffeecc"} />
            <directionalLight
                intensity={2} // Augmenter la puissance pour simuler le soleil
                color={"#ffddaa"} // Lumière chaude pour un effet coucher de soleil
                position={[50, 100, -50]} // Position élevée pour simuler le soleil
                castShadow
                shadow-mapSize-width={512}
                shadow-mapSize-height={512}
                shadow-camera-left={-800}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
                shadow-camera-near={0.1}
                shadow-camera-far={500} />
            <hemisphereLight
                skyColor={"#141b83"} // Bleu du ciel
                groundColor={"#463D36"} // Teinte du sol
                intensity={0.5} />
            <Sky

                sunPosition={[100, 50, -100]} // Place le soleil à l’horizon
                inclination={0.49} // Angle du soleil (simule un coucher de soleil)
                turbidity={100} // Brume atmosphérique
                rayleigh={2} // Diffusion de la lumière
            />
        </>
    );
}
