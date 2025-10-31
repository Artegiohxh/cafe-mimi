export default function Header() {
  return (
    <header className="w-full px-4 md:px-8 lg:px-16 pt-4 md:pt-8 lg:pt-16">
      <nav className="w-full hidden lg:flex items-center justify-evenly px-[50px] py-3 rounded-[32px] border border-brand-black bg-transparent">
        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          продукция
        </a>
        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          составы
        </a>
        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          где купить
        </a>

        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/b7e715ab5e522f677cbf119cdf39ecbaa0bcca60?width=228"
          alt="cafe mimi logo"
          className="w-28 h-24 object-contain flex-shrink-0"
        />

        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          покупателям
        </a>
        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          экология
        </a>
        <a
          href="#"
          className="font-display font-bold text-base text-[#333F48] italic leading-[16px] tracking-[-0.16px] whitespace-nowrap hover:text-brand-yellow transition-colors"
        >
          обратная связь
        </a>
      </nav>

      <nav className="w-full lg:hidden flex flex-col gap-4">
        <div className="flex items-center justify-center py-2">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b7e715ab5e522f677cbf119cdf39ecbaa0bcca60?width=228"
            alt="cafe mimi logo"
            className="w-20 h-16 md:w-24 md:h-20 object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-4 md:gap-6 px-6 py-3 rounded-[32px] border border-brand-black bg-transparent flex-wrap">
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            продукция
          </a>
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            составы
          </a>
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            где купить
          </a>
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            покупателям
          </a>
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            экология
          </a>
          <a
            href="#"
            className="font-display font-bold text-xs md:text-sm text-brand-black italic tracking-tight whitespace-nowrap"
          >
            обратная связь
          </a>
        </div>
      </nav>
    </header>
  );
}
