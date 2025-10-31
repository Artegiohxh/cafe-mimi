import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import NoiseOverlay from "@/components/NoiseOverlay";
import Product3DModel from "@/components/Product3DModel";
import CollectionsCarousel from "@/components/CollectionsCarousel";

export default function Index() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const aboutImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  
  const animate = () => {
    if (!aboutImageRef.current) return;
    
    // Плавная интерполяция
    const lerp = 0.15;
    const dx = targetRotationRef.current.x - currentRotationRef.current.x;
    const dy = targetRotationRef.current.y - currentRotationRef.current.y;
    
    // Останавливаем анимацию если изменения минимальны
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    
    currentRotationRef.current.x += dx * lerp;
    currentRotationRef.current.y += dy * lerp;
    
    // Убираем масштабирование - только поворот для плавной анимации
    // Используем translate3d для GPU ускорения
    aboutImageRef.current.style.transform = `translate3d(0, 0, 0) perspective(1000px) rotateX(${currentRotationRef.current.x}deg) rotateY(${currentRotationRef.current.y}deg)`;
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  const handleAboutImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    targetRotationRef.current.x = (y - 0.5) * 15;
    targetRotationRef.current.y = (0.5 - x) * 15;
  };
  
  const handleAboutImageMouseLeave = () => {
    targetRotationRef.current.x = 0;
    targetRotationRef.current.y = 0;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!heroSectionRef.current) return;
      
      const heroHeight = heroSectionRef.current.offsetHeight;
      const heroTop = heroSectionRef.current.offsetTop;
      const scrollY = window.scrollY;
      
      // Вычисляем насколько проскроллили внутри hero секции
      const scrollInHero = Math.max(0, scrollY - heroTop);
      
      // Нормализуем позицию скролла от 0 до 1 (где 1 = полностью проскроллили hero секцию)
      const normalized = Math.min(scrollInHero / heroHeight, 1);
      setScrollPosition(normalized);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Вызываем сразу для начальной позиции

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#DAB5FB]" style={{ overflow: 'visible', overflowX: 'clip', overflowY: 'visible' }}>
      <NoiseOverlay />
      <Header />

      <section ref={heroSectionRef} className="relative w-full min-h-[600px] md:min-h-[800px] lg:min-h-[1010px] overflow-visible hero-section-wrapper">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/648551db6df8db9acc54b6c653e4aa75ef05a6a2?width=1560"
          alt="hero vector"
          className="hero-vector"
        />

        {/* Модель внутри hero-секции, но с высоким z-index */}
        <div 
          className="absolute model-container"
          style={{ 
            aspectRatio: '1 / 1.35', 
            zIndex: 10000
          }}
        >
          <Product3DModel scrollPosition={scrollPosition} />
        </div>

        <div className="hero-section-inner">

        </div>

        <div className="relative z-20 px-8 md:px-16 lg:px-[64px] pt-8 md:pt-12 lg:pt-14">
          <div className="max-w-6xl flex flex-col gap-12 md:gap-16 lg:gap-[84px]">
            <h1 className="font-body font-normal text-5xl md:text-7xl lg:text-[160px] lg:leading-[132px] tracking-[-0.08em] lg:tracking-[-12.8px]">
              <span className="text-[#F8FF2B]">
                приятный
                <br />
                доступный
                <br />
                твой
                <br />
              </span>
              <span className="text-[#333F48]">self-care</span>
            </h1>
            <p className="font-display font-bold italic text-[#333F48] text-lg md:text-2xl lg:text-[32px] lg:leading-[36px] tracking-[-0.04em] lg:tracking-[-1.28px] max-w-[300px] md:max-w-[400px] lg:max-w-[478px]">
              Для тех, кто хочет наслаждаться жизнью здесь и сейчас
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-[46px_0_32px_0] overflow-hidden border-t border-b border-[#333F48] bg-[#DAB5FB]">
        <div className="flex items-center gap-5 animate-scroll">
          <h2 className="font-body font-normal text-[#F8FF2B] text-4xl md:text-6xl lg:text-[120px] lg:leading-[120px] tracking-[-0.06em] lg:tracking-[-7.2px] whitespace-nowrap text-center">
            моменты только для себя
          </h2>
          <h2 className="font-body font-normal text-[#F8FF2B] text-4xl md:text-6xl lg:text-[120px] lg:leading-[120px] tracking-[-0.06em] lg:tracking-[-7.2px] whitespace-nowrap text-center">
            моменты только для себя
          </h2>
          <h2 className="font-body font-normal text-[#F8FF2B] text-4xl md:text-6xl lg:text-[120px] lg:leading-[120px] tracking-[-0.06em] lg:tracking-[-7.2px] whitespace-nowrap text-center">
            моменты только для себя
          </h2>
        </div>
      </section>

      <section className="w-full px-8 md:px-16 lg:px-[64px] py-16 md:py-20 lg:py-[100px] overflow-visible">
        <div className="w-full grid grid-cols-1 lg:grid-cols-6 lg:gap-[32px] gap-8 lg:items-end overflow-visible">
          <div 
            ref={containerRef}
            className="w-full lg:col-span-3 about-image-container"
            onMouseMove={handleAboutImageMouseMove}
            onMouseLeave={handleAboutImageMouseLeave}
          >
            <img
              ref={aboutImageRef}
              src="https://api.builder.io/api/v1/image/assets/TEMP/6b2c5983187b31e97e87dc474073c6d87b6c07e8?width=1760"
              alt="star"
              className="w-full h-auto about-image"
            />
          </div>

          <div className="w-full lg:col-span-3 flex flex-col gap-16 md:gap-20 lg:gap-[100px]">
            <div className="flex flex-col gap-6 md:gap-8">
              <h2 className="font-body font-normal text-[#333F48] text-3xl md:text-5xl lg:text-[64px] lg:leading-[62px] tracking-[-0.04em] lg:tracking-[-2.56px]">
                Наши текстуры — как объятия, ароматы — как любимый трек
              </h2>
              <p className="font-display font-bold italic text-[#333F48] text-lg md:text-xl lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px] max-w-[576px]">
                Каждый продукт cafe mimi наполнен любовью до краев — чтобы ты
                ощущала себя особенной
              </p>
            </div>

            <div className="flex items-end gap-4 md:gap-6">
              <div className="font-display font-bold italic text-[#333F48] text-lg md:text-xl lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] lg:tracking-[-0.96px]">
                Коллекции
                <br />
                продуктов
              </div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/5359fd0613cd08a5b3f1699f17691bd11cb0cf12?width=230"
                alt="arrow"
                className="w-20 md:w-24 lg:w-[115px] h-auto"
                style={{ strokeWidth: "4px", stroke: "#333F48" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full pb-16 md:pb-20 lg:pb-[100px]">
        <CollectionsCarousel
          collections={[
            {
              id: 'super-food',
              title: 'Super Food',
              description: 'Специально разработанные рецептуры с использованием суперфудов. Здесь много витаминов и полезных веществ',
              image: '/images/collections/Super Food.png',
              alt: 'Super Food collection',
              descriptionPosition: 'top',
            },
            {
              id: 'originals',
              title: 'Originals',
              description: 'Самая широкая коллекция. Бомбочки для ванн, гели для душа, крема для тела, рук и ног, скрабы для волос',
              image: '/images/collections/Originals.png',
              alt: 'Originals collection',
              descriptionPosition: 'bottom',
            },
            {
              id: 'colours',
              title: 'Colours',
              description: 'Яркий коктейль-бустер. Понятные и эффективные ингредиенты с ароматом сочных фруктов и ягод',
              image: '/images/collections/Colours.png',
              alt: 'Colours collection',
              descriptionPosition: 'top-right',
              descriptionClassName: 'lg:top-[119px] max-w-[200px] md:max-w-[240px]',
            },
            {
              id: 'super-fruit',
              title: 'Super Fruit',
              description: 'Продукты с натуральными растительными экстрактами и маслами экзотических фруктов и ягод',
              image: '/images/collections/Super Fruit.png',
              alt: 'Super Fruit collection',
              descriptionPosition: 'bottom',
              descriptionClassName: 'left-8 right-8 bottom-8',
            },
            {
              id: 'sun',
              title: 'Sun',
              description: 'Защита от UVA/UVB лучей. Смягчают кожу, предотвращают появление сухости и шелушения',
              image: '/images/collections/Sun.png',
              alt: 'Sun collection',
              descriptionPosition: 'top-right',
              descriptionClassName: 'lg:top-[80px] max-w-[240px] md:max-w-[280px] lg:max-w-[302px]',
            },
            {
              id: 'your-face-your-case',
              title: 'Your Face\nYour Case',
              description: 'Коллекция средств для ухода за кожей лица. Для любых типов и состояний кожи: от обезвоженной до проблемной',
              image: '/images/collections/Your Face Your Case.png',
              alt: 'Your Face Your Case collection',
              descriptionPosition: 'bottom-right',
              descriptionClassName: 'lg:bottom-[32px] max-w-[240px] md:max-w-[280px] lg:max-w-[302px]',
            },
          ]}
        />
      </section>
    </div>
  );
}
