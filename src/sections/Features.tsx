import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Inbox, Brain, Pill, AlertCircle, Check } from 'lucide-react';
import { features } from '@/data/mockData';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, React.ElementType> = {
  inbox: Inbox,
  brain: Brain,
  capsule: Pill,
  priority: AlertCircle,
};

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title character stagger animation
      const titleChars = titleRef.current?.querySelectorAll('.title-char');
      if (titleChars) {
        gsap.fromTo(
          titleChars,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Cards 3D flip animation
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { rotateX: 45, opacity: 0, y: 60 },
            {
              rotateX: 0,
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              delay: index * 0.1,
            }
          );
        });
      }

      // Parallax on scroll
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card) => {
        gsap.to(card, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-24">
          <h2
            ref={titleRef}
            className="font-display text-h2 text-center mb-6"
          >
            {'FEATURES'.split('').map((char, i) => (
              <span key={i} className="title-char inline-block">
                {char}
              </span>
            ))}
          </h2>
          <p className="text-center text-lg lg:text-xl text-black/60 max-w-md mx-auto fade-up">
            Cuatro pilares de claridad cognitiva
          </p>
        </div>

        {/* Feature cards grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Inbox;
            const offsetY = index % 2 === 1 ? 'lg:translate-y-12' : '';

            return (
              <div
                key={feature.id}
                className={`feature-card group relative bg-white rounded-3xl border border-gray-100 p-8 lg:p-10 hover:shadow-2xl hover:border-black/10 transition-all duration-500 ${offsetY}`}
                style={{
                  transformStyle: 'preserve-3d',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl lg:text-3xl font-semibold mb-3 group-hover:tracking-wide transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-black/60 mb-6 text-base lg:text-lg">
                  {feature.description}
                </p>

                {/* Details list */}
                <ul className="space-y-3">
                  {feature.details.slice(0, 4).map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-black/70 group-hover:translate-x-1 transition-transform duration-200"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <Check className="w-4 h-4 text-black/40 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
