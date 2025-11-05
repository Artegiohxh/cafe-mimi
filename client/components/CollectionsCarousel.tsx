import React, { useRef, useState, useEffect } from 'react';

interface CollectionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  descriptionPosition?: 'top' | 'bottom' | 'top-right' | 'bottom-right';
  descriptionClassName?: string;
}

interface CollectionsCarouselProps {
  collections: CollectionCard[];
}

export default function CollectionsCarousel({ collections }: CollectionsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Обновление трансформаций: имитируем движение карточек по дуге
  const updateCardTransforms = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const maxDistance = containerRect.width / 2;

    cardsRef.current.forEach((card) => {
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;

      const distanceFromCenter = cardCenterX - containerCenterX;
      const progress = distanceFromCenter / maxDistance; // -1 .. 1
      const direction = Math.sign(progress) || 0;
      const normalizedDistance = Math.min(1, Math.abs(progress));
      const curveFactor = Math.pow(normalizedDistance, 1.1);

      const translateY = curveFactor * 180; // опускаем боковые карточки сильнее
      const translateZ = -curveFactor * 160; // уводим назад по оси Z
      const rotateY = progress * 12; // лёгкий поворот к центру
      const rotateZ = direction * curveFactor * 14; // наклон вокруг оси Z
      const rotateX = -curveFactor * 7; // чуть заваливаем назад
      const scale = 1 - curveFactor * 0.15; // центральная — крупнее

      card.style.transform = `translate3d(0, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
      card.style.transformOrigin = 'center top';
      card.style.zIndex = String(Math.round((1 - normalizedDistance) * 100));
    });
  };

  // Animation loop только при видимости, иначе стоп
  useEffect(() => {
    const start = () => {
      if (animationFrameRef.current == null) {
        const animate = () => {
          updateCardTransforms();
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    const stop = () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries[0]?.isIntersecting;
      if (vis) start(); else stop();
    }, { threshold: 0.05 });
    io.observe(el);
    const handleResize = () => updateCardTransforms();
    window.addEventListener('resize', handleResize);
    return () => {
      io.disconnect();
      window.removeEventListener('resize', handleResize);
      stop();
    };
  }, [collections]);

  // Inertia scroll effect
  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.1) {
      const animate = () => {
        if (!containerRef.current) return;

        const friction = 0.95;
        const newVelocity = velocity * friction;
        
        containerRef.current.scrollLeft -= newVelocity;
        setVelocity(newVelocity);

        if (Math.abs(newVelocity) > 0.1) {
          rafIdRef.current = requestAnimationFrame(animate);
        } else {
          setVelocity(0);
          rafIdRef.current = null;
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isDragging, velocity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setVelocity(0);
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Увеличиваем чувствительность
    containerRef.current.scrollLeft = scrollLeft - walk;

    // Вычисляем скорость для инерции
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    if (timeDelta > 0) {
      const distance = e.pageX - lastXRef.current;
      const newVelocity = (distance / timeDelta) * 16; // Нормализуем к ~60fps
      setVelocity(newVelocity);
    }
    
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setVelocity(0);
    lastXRef.current = touch.pageX;
    lastTimeRef.current = Date.now();
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const touch = e.touches[0];
    const x = touch.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;

    // Вычисляем скорость для инерции
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    if (timeDelta > 0) {
      const distance = touch.pageX - lastXRef.current;
      const newVelocity = (distance / timeDelta) * 16;
      setVelocity(newVelocity);
    }
    
    lastXRef.current = touch.pageX;
    lastTimeRef.current = Date.now();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="w-full"
      style={{
        position: 'relative',
        overflow: 'visible',
        perspective: '1400px',
        transformStyle: 'preserve-3d',
        paddingTop: '160px',
        paddingBottom: '160px',
        marginTop: '-160px',
        marginBottom: '-160px',
      }}
    >
      <div
        ref={containerRef}
        className={`px-8 md:px-16 lg:px-[64px] scrollbar-hide collections-carousel ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-6 md:gap-8 lg:gap-8 w-max"
          style={{
            gap: '32px',
            alignItems: 'flex-start',
            overflow: 'visible',
            paddingTop: '80px',
            paddingBottom: '80px',
          }}
        >
        {collections.map((collection, index) => (
        <div
          key={collection.id}
          ref={(el) => { cardsRef.current[index] = el; }}
          className="relative w-full md:w-[calc(50%-16px)] lg:w-[576px] h-[500px] md:h-[600px] lg:h-[727px] border border-[#333F48] flex-shrink-0 transition-transform duration-75 ease-out bg-[#DAB5FB]"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            overflow: 'visible',
          }}
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#DAB5FB]">
            <img
              src={collection.image}
              alt={collection.alt}
              className="w-full h-full object-cover pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
              draggable={false}
            />
          </div>
          <div className="absolute top-6 left-6 md:top-8 md:left-8">
            <h3 className={`font-display font-extrabold text-[#F8FF2B] text-2xl md:text-3xl lg:text-[42px] lg:leading-[42px] tracking-[-0.06em] lg:tracking-[-2.52px] ${collection.title.includes('\n') ? 'max-w-[200px] md:max-w-[250px]' : ''}`}>
              {collection.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < collection.title.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </h3>
            {collection.descriptionPosition === 'top' && (
              <p className={`font-display font-bold italic text-[#333F48] text-base md:text-lg lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px] mt-16 md:mt-20 lg:mt-[76px] ${collection.descriptionClassName || 'max-w-[240px] md:max-w-[276px]'}`}>
                {collection.description}
              </p>
            )}
          </div>
          {collection.descriptionPosition === 'bottom' && (
            <div className={`absolute bottom-6 left-6 md:bottom-8 md:left-8 ${collection.descriptionClassName || ''}`}>
              <p className={`font-display font-bold italic text-[#333F48] text-base md:text-lg lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px] ${collection.id === 'super-fruit' ? 'w-full' : 'max-w-[240px] md:max-w-[285px]'}`}>
                {collection.description}
              </p>
            </div>
          )}
          {collection.descriptionPosition === 'top-right' && (
            <div className={`absolute top-20 right-6 md:top-24 md:right-8 lg:top-[119px] lg:right-8 ${collection.descriptionClassName || ''}`}>
              <p className="font-display font-bold italic text-[#333F48] text-base md:text-lg lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px] max-w-[200px] md:max-w-[240px]">
                {collection.description}
              </p>
            </div>
          )}
          {collection.descriptionPosition === 'bottom-right' && (
            <div className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 ${collection.descriptionClassName || ''}`}>
              <p className="font-display font-bold italic text-[#333F48] text-base md:text-lg lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px]">
                {collection.description}
              </p>
            </div>
          )}
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

