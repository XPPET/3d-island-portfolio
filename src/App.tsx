import { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls, useGLTF, Float, ContactShadows, Environment, PerspectiveCamera, KeyboardControls, Sky, Stars, Cloud } from '@react-three/drei';
import { Character } from './Character';
import { MusicPlayer } from './components/MusicPlayer';
import { useWeather } from './hooks/useWeather';
import { Rain, Snow } from './components/WeatherEffects';
import { IrisTransition } from './components/IrisTransition';
import { CameraController } from './components/CameraController';

// Component for static models
// Component for GLTF models
function GltfModel({ url, scale = 1, position = [0, 0, 0] }: any) {
    const gltf = useGLTF(url) as any;
    return <primitive object={gltf.scene} scale={scale} position={position} castShadow receiveShadow />;
}

// Component for OBJ models with Materials
function ObjModel({ url, mtl, scale = 1, position = [0, 0, 0] }: any) {
    const materials = useLoader(MTLLoader, mtl) as any;
    const obj = useLoader(OBJLoader, url, (loader: any) => {
        materials.preload();
        loader.setMaterials(materials);
    });
    return <primitive object={obj} scale={scale} position={position} castShadow receiveShadow />;
}

export default function App() {
    const [autoRotate, setAutoRotate] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { weather, loading } = useWeather();

    // Determine environment based on weather code
    // 0: Clear sky, 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog
    // 51, 53, 55: Drizzle
    // 61, 63, 65: Rain
    // 71, 73, 75: Snow
    // 95, 96, 99: Thunderstorm

    const isNight = weather?.is_day === 0;
    const isRaining = weather && (weather.weathercode >= 51 && weather.weathercode <= 67 || weather.weathercode >= 80 && weather.weathercode <= 82 || weather.weathercode >= 95);
    const isSnowing = weather && (weather.weathercode >= 71 && weather.weathercode <= 77 || weather.weathercode >= 85 && weather.weathercode <= 86);
    const isCloudy = weather && (weather.weathercode >= 3 || isRaining || isSnowing);

    const getEnvironmentPreset = () => {
        if (isNight) return "night";
        if (isRaining || isSnowing) return "park";
        if (isCloudy) return "city";
        return "sunset";
    };

    const map = [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
    ];

    return (
        <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(to bottom, #87CEEB, #E0F7FA)" }}>
            <KeyboardControls map={map}>
                <Canvas shadows>
                    {/* Camera Setup */}
                    <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={40} />

                    {/* Lighting */}
                    <ambientLight intensity={0.6} />
                    <pointLight position={[20, 30, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
                    <hemisphereLight intensity={0.5} groundColor="#fffff0" />

                    <Suspense fallback={null}>
                        <CameraController
                            trigger={isTransitioning}
                            targetPosition={[0, 0.5, 2]}
                            targetLookAt={[0, 0.5, 0]}
                        />
                        {/* THE ISLAND */}
                        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
                            <ObjModel url="/Untitled.obj" mtl="/Untitled.mtl" scale={1} position={[0, -2, 0]} />
                        </Float>

                        {/* THE CHARACTER - Placeholder removed */}
                        {/* <Character url="/Bathroom_Bathtub.glb" /> */}

                        {/* Environment/Atmosphere */}
                        <Environment preset={getEnvironmentPreset() as any} blur={0.5} />
                        {!isNight && !isRaining && (
                            <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} mieCoefficient={0.005} mieDirectionalG={0.8} />
                        )}
                        {isNight && (
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        )}

                        {/* Clouds */}
                        {(isCloudy || isRaining || isSnowing) && (
                            <>
                                <Cloud opacity={0.7} speed={0.4} bounds={[10, 2, 1.5]} segments={40} position={[-5, 5, -10]} color={isRaining || isSnowing ? "#888888" : "#F0F8FF"} />
                                <Cloud opacity={0.7} speed={0.4} bounds={[10, 2, 1.5]} segments={40} position={[5, 5, -15]} color={isRaining || isSnowing ? "#888888" : "#F0F8FF"} />
                                <Cloud opacity={isRaining || isSnowing ? 0.8 : 0.5} speed={0.6} bounds={[20, 4, 2]} segments={30} position={[0, 8, 0]} color={isRaining || isSnowing ? "#555555" : "#E0E0E0"} />
                            </>
                        )}
                        {!isCloudy && !isRaining && !isSnowing && (
                            <>
                                <Cloud opacity={0.5} speed={0.4} bounds={[10, 2, 1.5]} segments={20} position={[-5, 0, -10]} color="#F0F8FF" />
                                <Cloud opacity={0.5} speed={0.4} bounds={[10, 2, 1.5]} segments={20} position={[5, 2, -15]} color="#F0F8FF" />
                            </>
                        )}

                        {isRaining && <Rain count={2000} />}
                        {isSnowing && <Snow count={1000} />}

                        <ContactShadows position={[0, -2.1, 0]} opacity={0.5} scale={30} blur={2} far={10} color="#000000" />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        target={[0, -2, 0]}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2.1}
                        enablePan={false}
                        minDistance={5}
                        maxDistance={30}
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.8}
                        onStart={() => setAutoRotate(false)}
                    />
                </Canvas>
            </KeyboardControls>

            {/* UI Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                padding: '2rem'
            }}>
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
                        My Portfolio
                    </h1>
                    <div style={{ display: 'flex', gap: '1.5rem', pointerEvents: 'auto' }}>
                        {['About', 'Projects', 'Contact'].map((item) => (
                            <button key={item} style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: 'none',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                backdropFilter: 'blur(5px)',
                                transition: 'transform 0.2s',
                            }}
                                onClick={() => {
                                    if (item === 'Projects') {
                                        setIsTransitioning(true);
                                        setAutoRotate(false);
                                    }
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </header>

                <div style={{ position: 'absolute', top: '80px', right: '2rem', padding: '10px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', borderRadius: '10px', color: '#333' }}>
                    {loading ? "Loading Weather..." : (
                        <div>
                            <div>{Math.round(weather?.temperature || 0)}°C</div>
                            <div style={{ fontSize: '0.8rem' }}>
                                {isNight ? "Night" : "Day"} • {isRaining ? "Rain" : isSnowing ? "Snow" : isCloudy ? "Cloudy" : "Clear"}
                            </div>
                        </div>
                    )}
                </div>

                <MusicPlayer />

                <IrisTransition
                    trigger={isTransitioning}
                    onComplete={() => {
                        window.location.href = 'https://github.com/XPPET';
                    }}
                />

                {/* <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                }}>
                    Use WASD or Arrows to float
                </div> */}
            </div>
        </div>
    );
}