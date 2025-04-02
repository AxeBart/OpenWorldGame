import { Sky } from '@react-three/drei';

// Composant pour les lumières
export function Lights() {
    return (
        <>
            <directionalLight
                intensity={2}
                color={"#FFFFFF"}
                position={[50, 10, 0]}
                castShadow
                shadow-mapSize-width={720}
                shadow-mapSize-height={720}
                shadow-camera-near={1}
                shadow-camera-far={500}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
            <hemisphereLight
                skyColor={"#141b83"}
                groundColor={"#463D36"}
                intensity={3}
            />
            <Sky
                skyColor={"#000000"}
                sunPosition={[100, 200, -400]}
                inclination={60}
                turbidity={3000}
                rayleigh={0.5}
            />
        </>
    );
}
