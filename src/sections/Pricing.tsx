import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pricingPlans } from '@/data/mockData';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.pricing-title',
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

      // Cards 3D flip animation
      const cards = cardsRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        cards.forEach((card, index) => {
          const rotateDirection = index === 0 ? -45 : index === 2 ? 45 : 0;
          const scaleStart = index === 1 ? 0.8 : 1;

          gsap.fromTo(
            card,
            {
              rotateY: rotateDirection,
              opacity: 0,
              scale: scaleStart,
            },
            {
              rotateY: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: index === 1 ? 'elastic.out(1, 0.8)' : 'expo.out',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
              delay: index * 0.15,
            }
          );
        });
      }

      // Features stagger
      gsap.fromTo(
        '.feature-item',
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-24">
          <h2 className="font-display text-h2 text-center mb-6 pricing-title">
            PRICING
          </h2>
          <p className="text-center text-lg lg:text-xl text-black/60 max-w-md mx-auto">
            Elige tu nivel de enfoque
          </p>
        </div>

        {/* Pricing cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card relative rounded-3xl p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl ${
                plan.isPopular
                  ? 'bg-black text-white scale-105 shadow-2xl z-10'
                  : 'bg-white border border-gray-100 hover:border-black/10'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  POPULAR
                </div>
              )}

              {/* Plan header */}
              <div className="mb-8">
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    plan.isPopular ? 'text-white' : 'text-black'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.isPopular ? 'text-white/70' : 'text-black/60'
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl lg:text-5xl font-bold ${
                      plan.isPopular ? 'text-white' : 'text-black'
                    }`}
                  >
                    {plan.price === 0 ? 'Custom' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span
                      className={`text-sm ${
                        plan.isPopular ? 'text-white/70' : 'text-black/60'
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`feature-item flex items-start gap-3 text-sm ${
                      plan.isPopular ? 'text-white/90' : 'text-black/70'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.isPopular ? 'text-white' : 'text-black'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full rounded-full py-6 font-medium transition-all duration-300 hover:scale-105 ${
                  plan.isPopular
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-black text-white hover:bg-black/90'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-elastic)' }}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
