import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { testimonials } from '@/data/mockData';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.testimonials-title',
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards entrance
      gsap.fromTo(
        '.testimonial-card',
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Auto-scroll animation
      const container = scrollContainerRef.current;
      if (container) {
        const scrollWidth = container.scrollWidth - container.clientWidth;
        
        gsap.to(container, {
          scrollLeft: scrollWidth,
          duration: 30,
          ease: 'none',
          repeat: -1,
          yoyo: true,
          repeatDelay: 2,
        });

        // Pause on hover
        container.addEventListener('mouseenter', () => {
          gsap.to(container, { timeScale: 0, duration: 0.5 });
        });
        container.addEventListener('mouseleave', () => {
          gsap.to(container, { timeScale: 1, duration: 0.5 });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <h2 className="font-display text-h2 text-center mb-6 testimonials-title">
            WHAT USERS SAY
          </h2>
          <p className="text-center text-lg lg:text-xl text-black/60 max-w-md mx-auto">
            Historias de los enfocados
          </p>
        </div>

        {/* Horizontal scrolling testimonials */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="testimonial-card flex-shrink-0 w-[320px] lg:w-[400px] snap-start"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-gray-50 rounded-3xl p-8 lg:p-10 h-full hover:bg-gray-100 hover:shadow-xl transition-all duration-500 group">
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-black/10 mb-6 group-hover:text-black/20 transition-colors duration-300" />

                {/* Quote text */}
                <p className="text-lg lg:text-xl font-medium mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-black/60">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
