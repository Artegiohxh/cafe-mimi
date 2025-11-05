import { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  mainImage: string;
  peaceImages: string[];
  links: { name: string; url: string }[];
}

const products: Product[] = [
  {
    id: 1,
    title: "Крем-баттер для рук MANGO GO",
    description: "Обладает плотной текстурой, мгновенно тает на коже, обеспечивает глубокое питание, интенсивно смягчает и увлажняет кожу. Результат: мягкая, гладкая и увлажненная кожа",
    price: "99 ₽",
    mainImage: "/images/news/mango/main.png",
    peaceImages: [
      "/images/news/mango/peace1.png",
      "/images/news/mango/peace2.png",
      "/images/news/mango/peace3.png",
      "/images/news/mango/peace4.png",
    ],
    links: [
      { name: "Ozon", url: "#" },
      { name: "Greencosmetics", url: "#" },
    ],
  },
  {
    id: 2,
    title: "Шипучая соль для ванн MILK BATH",
    description: "Молочные протеины оказывают интенсивное питание и увлажнение. Экстракт ежевики тонизирует и восстанавливают кожу. Морская соль насыщает кожу бесценными минералами, выводит токсины",
    price: "79 ₽",
    mainImage: "/images/news/fizz/main.png",
    peaceImages: [
      "/images/news/fizz/peace1.png",
      "/images/news/fizz/peace2.png",
      "/images/news/fizz/peace3.png",
      "/images/news/fizz/peace4.png",
    ],
    links: [
      { name: "Ozon", url: "#" },
      { name: "Greencosmetics", url: "#" },
    ],
  },
  {
    id: 3,
    title: "Гейзер для ванны чернично-малиновый",
    description: "Ароматное шипучее средство для расслабления и ухода за кожей. Соблазнительный аромат ягод поможет вам забыть о всех тревогах дня и подарит игривое настроение",
    price: "119 ₽",
    mainImage: "/images/news/geizer/main.png",
    peaceImages: [
      "/images/news/geizer/piece1.png",
      "/images/news/geizer/piece2.png",
      "/images/news/geizer/piece3.png",
      "/images/news/geizer/piece4.png",
    ],
    links: [
      { name: "Ozon", url: "#" },
      { name: "Greencosmetics", url: "#" },
    ],
  },
];

interface ProductCardProps {
  product: Product;
  isVisible: boolean;
}

function ProductCard({ product, isVisible }: ProductCardProps) {
  const peace1Ref = useRef<HTMLImageElement>(null);
  const peace2Ref = useRef<HTMLImageElement>(null);
  const peace3Ref = useRef<HTMLImageElement>(null);
  const peace4Ref = useRef<HTMLImageElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const peaceElements = [
      peace1Ref.current,
      peace2Ref.current,
      peace3Ref.current,
      peace4Ref.current,
    ].filter(Boolean) as HTMLImageElement[];
    const mainImage = mainImageRef.current;

    if (!isVisible) {
      // Сбрасываем анимацию когда товар скрыт
      peaceElements.forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, {
          y: 100,
          opacity: 0,
        });
      });
      if (mainImage) {
        gsap.killTweensOf(mainImage);
        // Определяем начальную позицию для сброса в зависимости от продукта
        let startY = 150;
        if (product.id === 2) {
          startY = 390;
        } else if (product.id === 3) {
          startY = 330;
        }
        gsap.set(mainImage, {
          xPercent: -50,
          yPercent: -50,
          y: startY,
          opacity: 0,
          rotation: -30,
          scale: 2,
        });
      }
      return;
    }

    // Анимация main изображения с вращением
    if (mainImage) {
      // Определяем финальную позицию в зависимости от продукта
      // Используем xPercent/yPercent для центрирования (-50%), затем добавляем смещения в пикселях
      let finalXPercent = -50;
      let finalYPercent = -50;
      let finalX = 0; // Смещение в пикселях по X
      let finalY = 0; // Смещение в пикселях по Y
      let finalRotation = 15;
      let startY = 150; // Начальная позиция снизу в пикселях
      
      if (product.id === 2) {
        finalX = -60; // Смещение влево на 60px
        finalY = 240; // Смещение вниз на 240px
        startY = 390; // Начальная позиция еще ниже для товара 2
      } else if (product.id === 3) {
        finalX = -60; // Смещение влево на 60px
        finalY = 180; // Смещение вниз на 180px
        startY = 330; // Начальная позиция еще ниже для товара 3
      }

      // Устанавливаем начальную позицию (снизу, с вращением)
      gsap.set(mainImage, {
        xPercent: -50,
        yPercent: -50,
        y: startY,
        opacity: 0,
        rotation: -30,
        scale: 2,
      });

      // Анимация прилета снизу вверх к финальной позиции с вращением
      gsap.to(mainImage, {
        xPercent: finalXPercent,
        yPercent: finalYPercent,
        x: finalX,
        y: finalY,
        opacity: 1,
        rotation: finalRotation,
        scale: 2,
        duration: 1,
        delay: 0.2,
        ease: "power2.out",
      });
    }

    // Анимация для каждого элемента с рандомной задержкой
    peaceElements.forEach((el, index) => {
      // Рандомная задержка от 0 до 0.5 секунды
      const randomDelay = Math.random() * 0.5;
      
      // Устанавливаем начальную позицию (снизу)
      gsap.set(el, {
        y: 100,
        opacity: 0,
      });

      // Анимация вылета снизу вверх с bounce эффектом
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: randomDelay + index * 0.1, // Добавляем небольшую последовательность
        ease: "bounce.out",
      });
    });

    return () => {
      // Очистка при размонтировании
      peaceElements.forEach((el) => {
        gsap.killTweensOf(el);
      });
      if (mainImage) {
        gsap.killTweensOf(mainImage);
      }
    };
  }, [isVisible, product.id]);

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-8 items-start lg:items-stretch transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-20"
      }`}
    >
      {/* Левая зона: заголовок — 2 колонки */}
      <div className="lg:col-span-2 flex justify-center lg:justify-start">
        <h3 className="font-body font-normal text-[#333F48] text-3xl md:text-5xl lg:text-[64px] lg:leading-[62px] tracking-[-0.04em] lg:tracking-[-2.56px] max-w-[576px] text-center lg:text-left">
          {product.title}
        </h3>
      </div>

      {/* Центральная зона: визуал — 2 колонки */}
      <div className="lg:col-span-2 relative flex justify-center items-center min-h-[400px] md:min-h-[500px] lg:min-h-[758px] lg:h-full">
        <div className="relative w-full max-w-[576px] h-[400px] md:h-[500px] lg:h-[758px]">
          <svg
            className="absolute left-[5%] md:left-[10%] top-0 w-[45%] md:w-[50%] lg:w-[494px] h-auto"
            viewBox="0 0 484 492"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M365.232 31.7499L265.559 224.241L467.414 145.234L273.634 242.376L483.377 297.106L269.506 261.795L407.022 429.356L254.753 275.078L267.516 491.468L235.01 277.153L118.145 459.718L217.818 267.227L15.9626 346.234L209.743 249.092L0.000224142 194.362L213.87 229.673L76.3545 62.1121L228.623 216.39L215.861 -1.92256e-05L248.367 214.315L365.232 31.7499Z"
              fill="#FFFB1E"
            />
          </svg>

          <img
            ref={peace1Ref}
            src={product.peaceImages[0]}
            alt=""
            className="absolute left-0 md:left-[-5%] top-[3%] md:top-[-5%] w-[35%] md:w-[36%] lg:w-[207px] h-auto rounded-[50px] md:rounded-[60px] lg:rounded-[77px]"
          />

          <img
            ref={mainImageRef}
            src={product.mainImage}
            alt={product.title}
            className="absolute left-1/2 md:left-[15%] top-[33%] top-1/2 w-[70%] md:w-[75%] lg:w-[624px] h-auto scale-[2]"
            style={{
              transformOrigin: 'center center',
            }}
          />

          <img
            ref={peace2Ref}
            src={product.peaceImages[1]}
            alt=""
            className="absolute right-[5%] md:right-[-28%] top-[6%] md:top-[-8%] w-[35%] md:w-[36%] lg:w-[219px] h-auto rounded-[50px] md:rounded-[60px] lg:rounded-[77px]"
          />

          <img
            ref={peace3Ref}
            src={product.peaceImages[2]}
            alt=""
            className="absolute left-0 md:left-[-45%] bottom-[5%] md:bottom-[28%] w-[35%] md:w-[36%] lg:w-[211px] h-auto rounded-[50px] md:rounded-[60px] lg:rounded-[77px]"
          />

          <img
            ref={peace4Ref}
            src={product.peaceImages[3]}
            alt=""
            className="absolute right-[2%] md:right-[5%] bottom-[5%] md:bottom-[18%] w-[35%] md:w-[36%] lg:w-[219px] h-auto rounded-[50px] md:rounded-[60px] lg:rounded-[77px]"
          />
        </div>
      </div>

      {/* Правая зона: описание/кнопки — 2 колонки */}
      <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 items-center lg:items-start text-center lg:text-left lg:h-full lg:justify-end">
        <p className="font-display font-bold italic text-[#333F48] text-lg md:text-xl lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] max-w-[576px]">
          {product.description}
        </p>

        <div className="font-body font-normal text-[#333F48] text-4xl md:text-5xl lg:text-[64px] lg:leading-[62px] tracking-[-0.04em] lg:tracking-[-2.56px]">
          {product.price}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
          {product.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className="font-display font-bold italic text-[#333F48] text-lg md:text-xl lg:text-[24px] lg:leading-[30px] tracking-[-0.04em] px-4 md:px-6 py-3 md:py-4 border border-[#333F48] hover:bg-[#333F48] hover:text-white transition-colors"
            >
              {link.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function News() {
  const [visibleProductIndex, setVisibleProductIndex] = useState(0);
  const visibleProductIndexRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    visibleProductIndexRef.current = visibleProductIndex;
  }, [visibleProductIndex]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const productsCount = products.length;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => "+=" + window.innerHeight * productsCount,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        const event = new CustomEvent("news-pin-toggle", {
          detail: { isPinned: self.isActive },
        });
        window.dispatchEvent(event);
      },
      onUpdate: (self) => {
        const progress = self.progress;
        const index = Math.min(
          productsCount - 1,
          Math.floor(progress * productsCount + 0.001)
        );

        if (index !== visibleProductIndexRef.current) {
          visibleProductIndexRef.current = index;
          setVisibleProductIndex(index);
        }
      },
      onLeave: () => {
        visibleProductIndexRef.current = productsCount - 1;
        setVisibleProductIndex(productsCount - 1);
      },
      onLeaveBack: () => {
        visibleProductIndexRef.current = 0;
        setVisibleProductIndex(0);
      },
    });

    const handleResize = () => {
      trigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.dispatchEvent(
        new CustomEvent("news-pin-toggle", { detail: { isPinned: false } })
      );
      trigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full relative"
    >
      <div className="max-w-[1920px] mx-auto px-8 md:px-16 lg:px-[64px] py-16 md:py-20 lg:py-[100px]">
        {/* Заголовок - sticky, всегда видимый */}
        <div className="sticky top-8 z-50 flex justify-center mb-6 md:mb-8 lg:mb-10">
          <img
            src="/images/news/mango/title.svg"
            alt="Что-то новенькое"
            className="h-6 md:h-7 lg:h-8 w-auto"
          />
        </div>

        {/* Контейнер продуктов - высота по контенту */}
        <div className="relative" style={{ minHeight: "calc(100vh - 200px)", paddingTop: "10vh" }}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className="relative"
              style={{
                opacity: visibleProductIndex === index ? 1 : 0,
                pointerEvents: visibleProductIndex === index ? 'auto' : 'none',
                transition: 'opacity 0.7s ease-out',
                position: visibleProductIndex === index ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <ProductCard
                product={product}
                isVisible={visibleProductIndex === index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
