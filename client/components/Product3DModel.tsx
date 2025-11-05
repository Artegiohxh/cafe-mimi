import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ scrollRef, mouseRef, setIsLoading }: { scrollRef: React.MutableRefObject<number>; mouseRef: React.MutableRefObject<{ x: number; y: number }>; setIsLoading?: (loading: boolean) => void }) {
  // Загружаем оптимизированную GLB модель (DRACO + WebP)
  const { scene } = useGLTF('/models/mimi-bottle-final-opt.glb', '/draco/');
  const rotationGroupRef = useRef<THREE.Group>(null); // Группа для вращения вокруг локальной оси Y
  const tiltGroupRef = useRef<THREE.Group>(null); // Группа для наклонов
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  // Начальный поворот модели вокруг оси Y (видимая сторона при загрузке)
  // Уменьшайте/увеличивайте значение (в градусах), чтобы повернуть модель влево/вправо
  const initialYOffset = -Math.PI * -80 / 180; // пример: -65°
  
  // Наклоны модели:
  // tiltX — наклон «назад/вперёд», tiltZ — наклон «влево/вправо»
  const tiltX = -Math.PI * 40/ 180; // базовый наклон «назад»
  const tiltZ = -Math.PI * 26 / 180; // базовый наклон «вправо»
  
  // Вращение вокруг локальной вертикальной оси модели
  const targetYRotation = useRef(initialYOffset);
  const currentYRotation = useRef(initialYOffset);
  
  // Плавная интерполяция позиции мыши для предотвращения резких движений
  const smoothMousePosition = useRef({ x: 0.9, y: 0.9 });

  const initializedOnceRef = useRef(false);
  useEffect(() => {
    if (!scene || initializedOnceRef.current) return;
    initializedOnceRef.current = true;

    // Клонируем для рендера (не модифицируем оригинал из кэша загрузчика)
    clonedSceneRef.current = scene.clone(true);
    const frameId = requestAnimationFrame(() => {
      const source = clonedSceneRef.current ?? scene;

      // Приводим материалы к освещаемым (если GLB содержит Unlit / MeshBasic)
      // и одновременно уменьшаем влияние HDRI для заметности источников света
      source.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const currentMat = child.material as any;
          // Если материал без освещения (MeshBasic), заменим на стандартный
          if (currentMat?.isMeshBasicMaterial) {
            const nextMat = new THREE.MeshStandardMaterial({
              map: currentMat.map ?? null,
              color: currentMat.color ?? new THREE.Color(0xA5ABF7),
              transparent: !!currentMat.transparent,
              opacity: currentMat.opacity ?? 1,
              metalness: 0.9,
              roughness: 0.9,
            });
            child.material = nextMat;
          }
          const mat = child.material as any;
          if ('envMapIntensity' in mat) {
            mat.envMapIntensity = 0.2; // слабее влияние окружения (HDRI)
          }
          mat.needsUpdate = true;
        }
      });
      // Считаем бокс по текущему источнику; если размер ещё не готов — повторим на следующем кадре
      const box = new THREE.Box3().setFromObject(source);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      if (!isFinite(maxDim) || maxDim <= 0) {
        // Подождём один кадр, пока геометрия рассчитает bounding box
        requestAnimationFrame(() => initializedOnceRef.current = false);
        return;
      }
      // Масштаб модели в кадре: множитель 1.85 — делайте больше/меньше, чтобы менять размер
      const modelScale = maxDim > 0 ? (2.0 / maxDim) * 1.85 : 1;

      // Положение модели:
      const rightOffset = 0.5;   // сдвиг по X вправо (+) / влево (-)
      const verticalOffset = 0.25; // сдвиг по Y вверх (+) / вниз (-)

      setScale(modelScale);
      setPosition([
        -center.x * modelScale + rightOffset,
        -center.y * modelScale + verticalOffset,
        -center.z * modelScale,
      ]);

      if (setIsLoading) setIsLoading(false);
    });

    return () => cancelAnimationFrame(frameId);
  }, [scene, setIsLoading]);

  useFrame(() => {
    if (!rotationGroupRef.current || !tiltGroupRef.current) return;

    // Плавная интерполяция позиции мыши для предотвращения резких движений
    const mouseLerpFactor = 0.05; // Чувствительность реакции на мышь (меньше — плавнее)
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    smoothMousePosition.current.x += (mx - smoothMousePosition.current.x) * mouseLerpFactor;
    smoothMousePosition.current.y += (my - smoothMousePosition.current.y) * mouseLerpFactor;
    
    // Вычисляем вращение на основе сглаженной позиции мыши
    // smoothMousePosition.x от 0 до 1, переводим в диапазон -0.2 до 0.2 радиан
    const mouseRotationX = (smoothMousePosition.current.x - 0.5) * 0.4; // Амплитуда реакции по X
    const mouseRotationZ = (smoothMousePosition.current.y - 0.5) * 0.4; // Амплитуда реакции по Z
    
    // Обновляем вращение Y на основе скролла с учетом начального смещения
    targetYRotation.current = scrollRef.current + initialYOffset;
    
    // Плавная интерполяция для smooth движения вращения Y
    const lerpFactor = 0.1; // Скорость «догоняющего» вращения (скролл → ось Y)
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

  if (!scene) return null;

  return (
    <group ref={tiltGroupRef}>
      {/* Внешняя группа применяет наклоны (X и Z) - сначала наклоняем модель */}
      <group ref={rotationGroupRef} position={position}>
        {/* Внутренняя группа вращается вокруг локальной вертикальной оси Y */}
        {/* Благодаря вложенности: сначала наклоны, затем вращение вокруг Y */}
      <primitive object={clonedSceneRef.current ?? scene} scale={scale} />
      </group>
    </group>
  );
}

// Предзагрузка GLB
useGLTF.preload('/models/mimi-bottle-final-opt.glb', '/draco/');

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
  const [isLoading, setIsLoading] = useState(true);

  // Мышь: обновляем через rAF в ref, без React setState
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseRafRef = useRef<number | null>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height; // 0..1
    if (mouseRafRef.current != null) cancelAnimationFrame(mouseRafRef.current);
    mouseRafRef.current = requestAnimationFrame(() => {
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
      mouseRafRef.current = null;
    });
  };
  const handleMouseLeave = () => {
    mouseRef.current.x = 0.5;
    mouseRef.current.y = 0.5;
  };

  // Скролл: считаем внутри компонента и сохраняем в ref, без React setState
  const scrollRef = useRef(0);
  const scrollTickRef = useRef<number | null>(null);
  useEffect(() => {
    const onScroll = () => {
      if (scrollTickRef.current != null) return;
      scrollTickRef.current = requestAnimationFrame(() => {
        // Нормируем 0..1 по высоте окна (можно заменить на высоту hero)
        const norm = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
        scrollRef.current = norm * Math.PI * 2; // 0..2PI
        scrollTickRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (scrollTickRef.current != null) cancelAnimationFrame(scrollTickRef.current);
      if (mouseRafRef.current != null) cancelAnimationFrame(mouseRafRef.current);
    };
  }, []);

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '100%', cursor: 'grab' }}
    >
      {/* Canvas / Камера:
          - camera.position: отдалить/приблизить камеру
          - camera.fov: угол обзора (меньше — «телефото», больше — «ширик»)
          - gl.antialias: сглаживание, gl.alpha: прозрачный фон
          - shadows: включить тени; dpr: плотность пикселей (качество/перф)
          - onCreated: PBR-рендер как в glTF Viewer (ACES, sRGB, физ. свет, экспозиция) */}
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          (gl as any).outputColorSpace = THREE.SRGBColorSpace; // three r152+
          (gl as any).physicallyCorrectLights = true;
          gl.toneMappingExposure = 0.6;
        }}
        style={{ width: '100%', height: '100%', background: 'transparent', pointerEvents: 'auto' }}
      >
        <Suspense fallback={<ModelLoader />}>
        {/* Свет: меняйте intensity и position, чтобы подчеркнуть объём */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[14, 45, 5]} intensity={0.9} />
        <directionalLight position={[45, 5, -5]} intensity={0.9} />
        <pointLight position={[0, 10, 0]} intensity={0.4} />
          <Model scrollRef={scrollRef} mouseRef={mouseRef} setIsLoading={setIsLoading} />
        {/* Окружение/HDRI: ближе к glTF Viewer; blur смягчает отражения */}
        <Environment preset="studio" blur={0.9} />
        </Suspense>
      </Canvas>
    </div>
  );
}

