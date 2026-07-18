import { Reveal } from "@/components/motion/Reveal";
import type { SiteConfig } from "@/types/site-config";

export function TestimonialsSection({ config }: { config: SiteConfig }) {
  const copy = config.homepage.testimonials;
  const testimonials = config.testimonials;

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="surface-section section-block">
      <div className="site-container space-y-8">
        <div className="section-header">
          <div className="section-header-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="section-title">{copy.title}</h2>
          </div>
        </div>

        <ul className="home-testimonials-grid" data-reveal-stagger>
          {testimonials.map((item) => (
            <li key={`${item.name}-${item.quote.slice(0, 24)}`} className="home-testimonial" data-reveal="slide-up">
              <blockquote className="home-testimonial-quote">“{item.quote}”</blockquote>
              <p className="home-testimonial-name">{item.name}</p>
              {item.role ? <p className="home-testimonial-role">{item.role}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
