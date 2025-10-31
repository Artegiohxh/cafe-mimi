import { useEffect, useRef } from 'react';

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Функция для обновления размеров canvas
    const updateCanvas = () => {
      // Используем высоту документа, чтобы покрыть всю страницу
      const width = window.innerWidth;
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight
      );
      
      canvas.width = width;
      canvas.height = height;
      
      // Обновляем размер контейнера
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      
      // Генерируем шум согласно параметрам из Figma
      // Noise size: 0.5, Density: 100%, Color: #000000, Opacity: 12%
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      // Генерируем монохромный шум
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          
          const noise = Math.random();
          const value = Math.floor(noise * 255);
          
          data[index] = value;     // R
          data[index + 1] = value; // G
          data[index + 2] = value; // B
          data[index + 3] = 255;   // Alpha (opacity применяется через CSS)
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    updateCanvas();
    
    // Обновляем при изменении размера окна и при скролле (если контент динамический)
    const handleResize = () => updateCanvas();
    window.addEventListener('resize', handleResize);
    
    // Используем MutationObserver для отслеживания изменений высоты документа
    // Throttle для уменьшения частоты обновлений
    let mutationTimeout: number | null = null;
    const observer = new MutationObserver(() => {
      if (mutationTimeout !== null) return;
      mutationTimeout = window.setTimeout(() => {
        updateCanvas();
        mutationTimeout = null;
      }, 500); // Обновляем максимум раз в 500ms
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: false, // Только прямые дочерние элементы
      attributes: false // Не отслеживаем изменения атрибутов
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="noise-overlay">
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

