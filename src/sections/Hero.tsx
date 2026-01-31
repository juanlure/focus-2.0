import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // Title animation
      tl.fromTo(
        '.hero-title-line',
        { clipPath: 'inset(100% 0 0 0)', y: 30 },
        { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.8, stagger: 0.15 }
      );

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );

      // CTA
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.3'
      );

      // Device
      tl.fromTo(
        deviceRef.current,
        { opacity: 0, rotateY: 25, x: 50 },
        { opacity: 1, rotateY: 0, x: 0, duration: 1 },
        '-=0.8'
      );

      // Floating cards
      tl.fromTo(
        '.floating-card',
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
        '-=0.5'
      );

      // Scroll-triggered parallax
      gsap.to('.hero-title-line', {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(deviceRef.current, {
        y: -40,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Floating animation for cards
  useEffect(() => {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
      gsap.to(card, {
        y: '+=12',
        duration: 2.5 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-white pt-24 lg:pt-0"
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-gradient-radial from-gray-100 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-gradient-radial from-gray-50 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Outline background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="font-display text-[35vw] text-transparent whitespace-nowrap select-none"
          style={{
            WebkitTextStroke: '1px rgba(0,0,0,0.03)',
          }}
        >
          FOCUSBRIEF
        </span>
      </div>

      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-6 lg:px-12 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Content */}
            <div className="max-w-2xl">
              <div ref={titleRef} className="mb-6">
                <h1 className="font-display text-h1 leading-none">
                  <span className="hero-title-line block">FOCUS</span>
                  <span className="hero-title-line block">BRIEF</span>
                </h1>
              </div>

              <p
                ref={subtitleRef}
                className="text-lg lg:text-xl text-black/60 mb-8 max-w-md leading-relaxed opacity-0"
              >
                Transforma la sobrecarga de información en acción clara. 
                Curación impulsada por IA para la mente moderna.
              </p>

              <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 opacity-0">
                <Button
                  size="lg"
                  onClick={() => navigate('/app/dashboard')}
                  className="bg-black text-white hover:bg-black/90 rounded-full px-8 py-6 text-base font-medium group transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ transitionTimingFunction: 'var(--ease-elastic)' }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/app/dashboard')}
                  className="rounded-full px-8 py-6 text-base font-medium border-black/20 hover:bg-black/5 transition-all duration-300"
                >
                  Ver Demo
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-4 opacity-60">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-black/60">
                  Únete a <span className="font-semibold text-black">10,000+</span> personas recuperando su atención
                </p>
              </div>
            </div>

            {/* Right: Device Mockup */}
            <div
              ref={deviceRef}
              className="relative perspective-1000 opacity-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Main device */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 lg:p-8 transform lg:rotate-y-[-5deg] transition-transform duration-700 hover:rotate-y-0">
                {/* Device header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">FocusBrief</p>
                      <p className="text-xs text-black/50">5 cápsulas nuevas</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                </div>

                {/* Capsule cards */}
                <div className="space-y-3">
                  {[
                    { title: 'IA Revolution 2026', priority: 'high', color: 'bg-red-500' },
                    { title: 'Market Update Q4', priority: 'medium', color: 'bg-yellow-500' },
                    { title: 'Team Sync Notes', priority: 'low', color: 'bg-green-500' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color} mt-2 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          <p className="text-xs text-black/50 mt-1">3 acciones • 30s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <div
                ref={cardsRef}
                className="absolute -top-4 -right-4 lg:-right-8 floating-card opacity-0"
              >
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Procesado</p>
                      <p className="text-[10px] text-black/50">Hace 2 min</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 lg:-left-8 floating-card opacity-0">
                <div className="bg-black text-white rounded-2xl shadow-lg p-4">
                  <p className="text-xs font-medium">Tiempo ahorrado</p>
                  <p className="text-2xl font-display">2.5h</p>
                </div>
              </div>

              <div className="absolute top-1/2 -right-4 lg:-right-12 floating-card opacity-0">
                <div className="bg-white rounded-2xl shadow-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                    <span className="text-xs font-medium">Listo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
