import { useEffect, useRef, useState } from 'react';

// Лёгкий шум: генерируем маленький тайл 128x128 один раз и повторяем фоном
export default function NoiseOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const size = 128; // маленький тайл
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const url = canvas.toDataURL('image/png');
    container.style.backgroundImage = `url(${url})`;
    container.style.backgroundRepeat = 'repeat';
    container.style.backgroundSize = 'auto'; // нативное тайлинг

    // Обновляем высоту при изменении размера окна или скролле (только при необходимости)
    let rafId: number | null = null;
    const updateHeight = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        container.style.height = `${docHeight}px`;
        rafId = null;
      });
    };

    // Инициализируем высоту
    updateHeight();
    
    // Обновляем только при ресайзе окна (редкое событие)
    window.addEventListener('resize', updateHeight, { passive: true });

    const handleNewsPinToggle: EventListener = (event) => {
      const customEvent = event as CustomEvent<{ isPinned: boolean }>;
      setIsFixed(Boolean(customEvent.detail?.isPinned));
    };

    window.addEventListener("news-pin-toggle", handleNewsPinToggle);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener("news-pin-toggle", handleNewsPinToggle);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: isFixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        pointerEvents: 'none',
        opacity: 0.06,
        mixBlendMode: 'normal',
        zIndex: 20000,
        willChange: 'transform',
        transform: 'translateZ(0)', // GPU ускорение
        contain: 'layout style paint', // Оптимизация рендеринга
      }}
    />
  );
}

