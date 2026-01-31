import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background zoom
      gsap.fromTo(
        '.cta-bg',
        { scale: 1.1, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Title scale animation
      gsap.fromTo(
        '.cta-title-line',
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Subtitle and CTA
      gsap.fromTo(
        '.cta-subtitle',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.cta-button',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 50%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Scroll-driven scale
      gsap.to('.cta-title-line', {
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-48 overflow-hidden"
    >
      {/* Background */}
      <div className="cta-bg absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/30" />
        
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full px-6 lg:px-12 text-center"
      >
        <h2 className="font-display text-h2 text-white mb-6">
          <span className="cta-title-line block">READY</span>
          <span className="cta-title-line block">TO FOCUS?</span>
        </h2>

        <p className="cta-subtitle text-lg lg:text-xl text-white/70 max-w-md mx-auto mb-10">
          Únete a miles de personas recuperando su atención hoy
        </p>

        <div className="cta-button flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-7 text-lg font-medium group transition-all duration-300 hover:scale-105 shadow-2xl"
            style={{ 
              transitionTimingFunction: 'var(--ease-elastic)',
              boxShadow: '0 0 40px rgba(255,255,255,0.3)',
              animation: 'cta-pulse 3s ease-in-out infinite',
            }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        <p className="cta-subtitle mt-6 text-sm text-white/50">
          No se requiere tarjeta de crédito
        </p>
      </div>

      <style>{`
        @keyframes cta-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 60px rgba(255,255,255,0.5); }
        }
      `}</style>
    </section>
  );
}
