import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const logos = [
  { name: 'Notion', icon: 'N' },
  { name: 'Figma', icon: 'F' },
  { name: 'Slack', icon: 'S' },
  { name: 'Linear', icon: 'L' },
  { name: 'Vercel', icon: 'V' },
  { name: 'Raycast', icon: 'R' },
];

export default function LogoCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Infinite scroll animation
      const track = trackRef.current;
      if (track) {
        gsap.to(track, {
          x: '-50%',
          duration: 25,
          ease: 'none',
          repeat: -1,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 overflow-hidden bg-white border-y border-gray-100 opacity-0"
    >
      <div className="w-full px-6 lg:px-12 mb-8">
        <p className="text-center text-sm text-black/50 uppercase tracking-widest">
          Trusted by teams at
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div ref={trackRef} className="flex gap-16 lg:gap-24 whitespace-nowrap">
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex items-center gap-3 group cursor-pointer flex-shrink-0"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl lg:text-2xl font-bold text-black/40 group-hover:bg-black group-hover:text-white transition-all duration-300">
                {logo.icon}
              </div>
              <span className="text-lg lg:text-xl font-medium text-black/40 group-hover:text-black transition-colors duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
