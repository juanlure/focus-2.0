import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade up animation
      gsap.utils.toArray<HTMLElement>('.fade-up').forEach((elem) => {
        gsap.fromTo(
          elem,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: elem,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Clip reveal animation
      gsap.utils.toArray<HTMLElement>('.clip-reveal-anim').forEach((elem) => {
        gsap.fromTo(
          elem,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: elem,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Stagger children
      gsap.utils.toArray<HTMLElement>('.stagger-container').forEach((container) => {
        const children = container.querySelectorAll('.stagger-item');
        gsap.fromTo(
          children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Parallax effect
      gsap.utils.toArray<HTMLElement>('.parallax').forEach((elem) => {
        const speed = elem.dataset.speed || '0.5';
        gsap.to(elem, {
          y: `${parseFloat(speed) * 100}`,
          ease: 'none',
          scrollTrigger: {
            trigger: elem,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
};

export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return ref;
};
