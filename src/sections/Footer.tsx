import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'API'],
  },
  company: {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  legal: {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security'],
  },
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Border line draw
      gsap.fromTo(
        '.footer-border',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Columns fade up
      gsap.fromTo(
        '.footer-column',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Large logo reveal
      gsap.fromTo(
        '.footer-logo',
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.footer-logo',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-white pt-20 pb-10">
      {/* Top border */}
      <div className="footer-border absolute top-0 left-6 right-6 lg:left-12 lg:right-12 h-[1px] bg-gray-200 origin-left" />

      <div className="w-full px-6 lg:px-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-16 mb-20">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 footer-column">
            <a href="#" className="font-display text-3xl lg:text-4xl mb-4 block">
              FocusBrief
            </a>
            <p className="text-black/60 mb-6 max-w-sm">
              Transforma la sobrecarga de información en acción clara. 
              Curación impulsada por IA para la mente moderna.
            </p>
            
            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 hover:scale-110"
                  style={{ transitionTimingFunction: 'var(--ease-elastic)' }}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="footer-column">
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-black/60 hover:text-black transition-colors duration-200 relative group"
                    >
                      {link}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-black transition-all duration-200 group-hover:w-full" 
                        style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Large logo */}
        <div className="footer-logo mb-10 overflow-hidden">
          <span className="font-display text-[15vw] lg:text-[12vw] leading-none text-black/5 block text-center select-none">
            FOCUSBRIEF
          </span>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-black/50">
          <p>© 2026 FocusBrief. All rights reserved.</p>
          <p>Made with clarity in mind.</p>
        </div>
      </div>
    </footer>
  );
}
