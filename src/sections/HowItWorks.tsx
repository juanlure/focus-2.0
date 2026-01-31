import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { steps } from '@/data/mockData';
import { MessageSquare, Cpu, Zap, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<number, React.ElementType> = {
  1: MessageSquare,
  2: Cpu,
  3: Zap,
};

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.hiw-title',
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

      // Scroll-driven step progression
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 30%',
        end: 'bottom 70%',
        onUpdate: (self) => {
          const progress = self.progress;
          const newStep = Math.min(Math.floor(progress * 3), 2);
          setActiveStep(newStep);

          if (progressRef.current) {
            progressRef.current.style.width = `${(progress * 100)}%`;
          }
        },
      });

      // Step content animations
      steps.forEach((_, index) => {
        gsap.fromTo(
          `.step-content-${index}`,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${20 + index * 25}% 50%`,
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-24">
          <h2 className="font-display text-h2 text-center mb-6 hiw-title">
            HOW IT WORKS
          </h2>
          <p className="text-center text-lg lg:text-xl text-black/60 max-w-md mx-auto">
            Tres pasos hacia la claridad
          </p>
        </div>

        {/* Steps container */}
        <div className="max-w-5xl mx-auto">
          {/* Progress bar */}
          <div className="relative h-1 bg-gray-100 rounded-full mb-16 overflow-hidden">
            <div
              ref={progressRef}
              className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>

          {/* Steps grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = iconMap[step.id] || MessageSquare;
              const isActive = index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.id}
                  className={`step-content-${index} relative`}
                >
                  {/* Step number and icon */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black/40'
                      } ${isCurrent ? 'scale-110 shadow-xl' : ''}`}
                      style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                    >
                      <Icon className="w-7 h-7" />
                      <span
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                          isActive ? 'bg-black text-white' : 'bg-gray-200 text-black/40'
                        }`}
                      >
                        {step.id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl lg:text-3xl font-semibold mb-2 transition-colors duration-500 ${
                          isActive ? 'text-black' : 'text-black/40'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-base transition-colors duration-500 ${
                          isActive ? 'text-black/60' : 'text-black/30'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <ul className="space-y-3 ml-20">
                    {step.details.map((detail, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                          isActive
                            ? 'text-black/70 translate-x-0'
                            : 'text-black/30 translate-x-[-10px]'
                        }`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                        <Check
                          className={`w-4 h-4 flex-shrink-0 transition-colors duration-500 ${
                            isActive ? 'text-black' : 'text-black/20'
                          }`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Connector line (not on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-12 h-[2px]">
                      <div
                        className={`h-full transition-all duration-700 ${
                          isActive && index < activeStep
                            ? 'bg-black'
                            : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
