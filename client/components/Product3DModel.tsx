import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Model({ scrollRotation, mousePosition, setIsLoading }: { scrollRotation: number; mousePosition: { x: number; y: number }; setIsLoading?: (loading: boolean) => void }) {
  // Загружаем DRACO-сжатую модель и указываем путь к декодеру
  const { scene } = useGLTF('/models/bottlemodel-draco-hq.glb', '/draco/');
  const rotationGroupRef = useRef<THREE.Group>(null); // Группа для вращения вокруг локальной оси Y
  const tiltGroupRef = useRef<THREE.Group>(null); // Группа для наклонов
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  // Начальное смещение по оси Y для правильного расположения надписей
  const initialYOffset = -Math.PI * (45 + 20) / 180; // -65 градусов для показа надписей
  
  // Наклон назад на 75 градусов и вправо на 50 градусов
  const tiltX = -Math.PI * 40/ 180; // -75 градусов (наклон назад)
  const tiltZ = -Math.PI * 26 / 180; // -50 градусов (наклон вправо)
  
  // Вращение вокруг локальной вертикальной оси модели
  const targetYRotation = useRef(initialYOffset);
  const currentYRotation = useRef(initialYOffset);
  
  // Плавная интерполяция позиции мыши для предотвращения резких движений
  const smoothMousePosition = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!scene || clonedSceneRef.current) return;
    
    // Клонируем сцену один раз при загрузке
    clonedSceneRef.current = scene.clone();
    
    // Используем requestAnimationFrame чтобы убедиться что модель загружена и готова
    const frameId = requestAnimationFrame(() => {
      if (!clonedSceneRef.current) return;
      
      const box = new THREE.Box3().setFromObject(clonedSceneRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Масштабируем модель чтобы она помещалась в кадр с учетом высоты
      const maxDim = Math.max(size.x, size.y, size.z);
      // Масштаб модели - уменьшен немного
      const modelScale = maxDim > 0 ? (2.0 / maxDim) * 1.85 : 1; // Множитель 1.85
      
      // Смещение вправо на 100 пикселей (увеличено до 0.3 для заметного сдвига)
      const rightOffset = 0.5;
      
      // Смещение вверх чтобы модель не обрезалась снизу при наклоне
      // Учитываем наклон модели (44 градуса назад и 30 градусов вправо)
      const verticalOffset = 0.15; // Небольшой сдвиг вверх
      
      setScale(modelScale);
      setPosition([
        -center.x * modelScale + rightOffset, 
        -center.y * modelScale + verticalOffset, 
        -center.z * modelScale
      ]);
      
      // Уведомляем о завершении загрузки
      if (setIsLoading) {
        setIsLoading(false);
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [scene, setIsLoading]);

  useFrame(() => {
    if (!rotationGroupRef.current || !tiltGroupRef.current) return;

    // Плавная интерполяция позиции мыши для предотвращения резких движений
    const mouseLerpFactor = 0.05; // Медленная интерполяция для плавности
    smoothMousePosition.current.x += (mousePosition.x - smoothMousePosition.current.x) * mouseLerpFactor;
    smoothMousePosition.current.y += (mousePosition.y - smoothMousePosition.current.y) * mouseLerpFactor;

    // Вычисляем вращение на основе сглаженной позиции мыши
    // smoothMousePosition.x от 0 до 1, переводим в диапазон -0.2 до 0.2 радиан
    const mouseRotationX = (smoothMousePosition.current.x - 0.5) * 0.4; // Вращение по X при наведении
    const mouseRotationZ = (smoothMousePosition.current.y - 0.5) * 0.4; // Вращение по Z при наведении
    
    // Обновляем вращение Y на основе скролла с учетом начального смещения
    targetYRotation.current = scrollRotation + initialYOffset;
    
    // Плавная интерполяция для smooth движения вращения Y
    const lerpFactor = 0.1;
    currentYRotation.current += (targetYRotation.current - currentYRotation.current) * lerpFactor;
    
    // Применяем наклоны к внешней группе (tiltGroupRef) с добавлением реакции на мышь
    tiltGroupRef.current.rotation.x = tiltX + mouseRotationZ;
    tiltGroupRef.current.rotation.z = tiltZ + mouseRotationX;
    tiltGroupRef.current.rotation.y = 0;
    
    // Вращение вокруг локальной вертикальной оси модели
    // Применяем только вращение Y к внутренней группе
    // Благодаря вложенности, модель сначала наклоняется (tiltGroupRef),
    // затем вращается вокруг Y (rotationGroupRef)
    // Это создает вращение вокруг локальной вертикальной оси
    rotationGroupRef.current.rotation.x = 0;
    rotationGroupRef.current.rotation.y = currentYRotation.current;
    rotationGroupRef.current.rotation.z = 0;
  });

  if (!clonedSceneRef.current) return null;

  return (
    <group ref={tiltGroupRef}>
      {/* Внешняя группа применяет наклоны (X и Z) - сначала наклоняем модель */}
      <group ref={rotationGroupRef} position={position}>
        {/* Внутренняя группа вращается вокруг локальной вертикальной оси Y */}
        {/* Благодаря вложенности: сначала наклоны, затем вращение вокруг Y */}
        <primitive 
          object={clonedSceneRef.current} 
          scale={scale}
        />
      </group>
    </group>
  );
}

// Предзагрузка DRACO-сжатой модели
useGLTF.preload('/models/bottlemodel-draco-hq.glb', '/draco/');

interface Product3DModelProps {
  scrollPosition: number;
}

// Компонент для отображения загрузки
function ModelLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#DAB5FB" opacity={0.3} transparent />
    </mesh>
  );
}

export default function Product3DModel({ scrollPosition }: Product3DModelProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isLoading, setIsLoading] = useState(true);

  // Отслеживаем движение мыши через события Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 до 1
    const y = (e.clientY - rect.top) / rect.height; // 0 до 1
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    // Возвращаем в центр при уходе мыши
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  // Вычисляем вращение на основе позиции скролла (0-1 где 0 = верх страницы, 1 = после hero)
  // Вращаем от 0 до 2*PI (полный оборот вокруг вертикальной оси Y)
  const scrollRotation = scrollPosition * Math.PI * 2;

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', background: 'transparent', pointerEvents: 'auto' }}
      >
        <Suspense fallback={<ModelLoader />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.4} />
          <directionalLight position={[-5, 5, -5]} intensity={0.25} />
          <pointLight position={[0, 10, 0]} intensity={0.15} />
          <Model scrollRotation={scrollRotation} mousePosition={mousePosition} setIsLoading={setIsLoading} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}

