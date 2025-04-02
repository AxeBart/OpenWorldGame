import { Canvas, useFrame } from "@react-three/fiber"
import { Sky } from "@react-three/drei"
import { Physics } from "@react-three/rapier"


// les composant du monde 
import Map from "./Map"

export default function Test() {

    return (
        <Canvas
            camera={{ fov: 60, near: 0.1, far: 100, position: [0, 5, -10] }}
            style={{ width: '100vw', height: '100vh' }}
            dpr={[0.5, 0.5]}

        >
            <Sky
                skyColor={"#141b83"} // Bleu du ciel
                sunPosition={[100, 200, -400]} // Place le soleil à l’horizon
                inclination={60} // Angle du soleil (simule un coucher de soleil)
                turbidity={1000} // Brume atmosphérique
                rayleigh={0.5} // Diffusion de la lumière
            />

            <Physics debug>

                <Map></Map>
            </Physics>



        </Canvas>
    )
}

function Logic() {
    useFrame(() => {

    })
    return (
        <primitive></primitive>
    )
}