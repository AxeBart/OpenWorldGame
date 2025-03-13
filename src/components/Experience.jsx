import { OrbitControls } from "@react-three/drei";
import { Map } from "./map";
import { Environment } from "@react-three/drei";
import { useEffect } from "react";
// import { insertCoin } from "playroomkit";


export const Experience = () => {
  const start = async () => {
    // console.log("start")
    // await insertCoin()
  }

  useEffect(() => {
    start()
  }, [])
  return (
    <>
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <ambientLight intensity={0.3} />
      <OrbitControls />
      <Map />
      <Environment preset="sunset" />
    </>
  );
};
