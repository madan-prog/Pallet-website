import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FaBoxOpen, FaIndustry, FaCogs, FaTrain, FaCheckCircle, FaAward, FaLeaf, FaUsers, FaArrowUp, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Add hover effect styles
const aboutCardStyle = `
.about-hover-card {
  transition: transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s, border-color 0.18s, border-width 0.18s;
  will-change: transform, box-shadow, border-color, border-width;
  border: 1.5px solid #2c3240 !important;
}
.about-hover-card:hover, .about-hover-card:focus {
  transform: scale(1.035);
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 #0002, 0 0 0 2px #ffd600;
  border-color: #ffd600 !important;
  border-width: 2px !important;
  z-index: 2;
}
`;

const stats = [
  { label: 'Years of Excellence', value: 35, suffix: '+' },
  { label: 'Happy Clients', value: 500, suffix: '+' },
  { label: 'Products Delivered', value: 50000, suffix: '+' },
  { label: 'Export Compliance', value: 98.99, suffix: '%' },
];

const clients = [
  {
    name: 'Aqua Group',
    description: 'Pumping systems that demand secure, damage-proof transport',
    icon: <FaBoxOpen size={32} className="text-warning" />,
  },
  {
    name: 'TNPL',
    description: 'Tamil Nadu Newsprint and Papers Limited - Industrial-scale packaging for bulk materials',
    icon: <FaIndustry size={32} className="text-warning" />,
  },
  {
    name: 'Samudra Pumps',
    description: 'Custom crates for delicate, high-performance machinery',
    icon: <FaBoxOpen size={32} className="text-warning" />,
  },
  {
    name: 'Kin Railway',
    description: 'Sturdy pallets and protective crating for rail-grade components',
    icon: <FaTrain size={32} className="text-warning" />,
  },
];

const features = [
  {
    icon: <FaBoxOpen size={24} className="text-warning" />, title: 'Custom Designs', desc: 'Tailored for your unique product dimensions',
  },
  {
    icon: <FaCheckCircle size={24} className="text-warning" />, title: 'ISPM-15 Compliant', desc: 'Certified for global export standards',
  },
  {
    icon: <FaCogs size={24} className="text-warning" />, title: 'Heavy-Duty Strength', desc: 'Built tough, engineered for lightweight handling',
  },
  {
    icon: <FaCheckCircle size={24} className="text-warning" />, title: 'Quick Turnaround', desc: 'Fast delivery with scalable output capacity',
  },
  {
    icon: <FaAward size={24} className="text-warning" />, title: 'Sustainable Practices', desc: 'Responsible timber sourcing and eco-friendly methods',
  },
  {
    icon: <FaUsers size={24} className="text-warning" />, title: 'Expert Craftsmanship', desc: 'Precision-built solutions by skilled professionals',
  },
];

const testimonials = [
  {
    quote: "Saravana Timbers' custom crates have never let us down. Their quality and reliability are unmatched!",
    author: 'R. Kumar, Aqua Group',
  },
  {
    quote: "We trust Saravana for all our export packaging needs. Fast, professional, and always on time.",
    author: 'S. Natarajan, TNPL',
  },
  {
    quote: "Their team understands our requirements perfectly. The best in the business!",
    author: 'A. Prakash, Samudra Pumps',
  },
];

// Animation variants
const heroVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15
    }
  }
};
const heroItem = {
  hidden: { opacity: 0, y: -40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};
const statVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 }
  }
};
const statItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};
const cardCascade = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 }
  }
};
const cardItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

// Add icons for stats
const statIcons = [
  <FaAward className="text-warning mb-2" size={32} />,
  <FaUsers className="text-warning mb-2" size={32} />,
  <FaBoxOpen className="text-warning mb-2" size={32} />,
  <FaCheckCircle className="text-warning mb-2" size={32} />,
];

export default function About() {
  // Scroll-to-top button logic
  const [showScroll, setShowScroll] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navigate = useNavigate();

  return (
    <>
      <style>{aboutCardStyle}</style>
      <div className="text-light pt-0 min-vh-100" style={{ background: '#21252b', position: 'relative' }}>
        {/* Floating Years of Excellence Badge */}
        <div style={{position: 'absolute', top: 30, right: 30, zIndex: 10}}>
          <span className="badge bg-warning text-dark fs-5 fw-bold shadow-lg px-4 py-2" style={{borderRadius: '2rem', boxShadow: '0 2px 12px #0004'}}>
            <FaAward className="me-2 mb-1" />35+ Years of Excellence
          </span>
        </div>
        {/* Hero Section */}
        <section className="position-relative py-5" style={{overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, background: "url('/images/about-bg.png') center/cover no-repeat", opacity: 0.25, zIndex: 0}} />
          <motion.div className="container position-relative pt-5" style={{zIndex: 1}}
            variants={heroVariants}
            initial="hidden"
            animate="show"
          >
            <motion.h1 variants={heroItem} className="display-3 fw-bold mb-2">
              <span className="text-warning">Precision Timber</span><br />
              <span className="text-light">Packaging</span>
            </motion.h1>
            <motion.div variants={heroItem} className="h4 fw-bold text-secondary mb-3">
              Built in India. Trusted Worldwide.
            </motion.div>
            <motion.p variants={heroItem} className="lead mx-auto" style={{maxWidth: 700}}>
              At Saravana Timbers, we specialize in custom-built wooden boxes, crates, and heavy-duty pallets engineered for strength, reliability, and export-grade durability. We've been helping India's top industries move their goods with confidence—across borders and beyond expectations.
            </motion.p>
          </motion.div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Testimonial Section */}
        <section className="py-5" style={{ background: 'linear-gradient(90deg, #232b39 60%, #ffd60022 100%)' }}>
          <div className="container">
            <motion.h2 className="display-6 fw-bold text-center mb-4 text-warning"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              What Our Clients Say
            </motion.h2>
            <div className="row justify-content-center">
              {testimonials.map((t, i) => (
                <motion.div className="col-md-4 mb-4" key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="card border-0 shadow-lg h-100 p-4 about-hover-card" style={{ background: '#232b39', borderRadius: '1.5rem', border: '1px solid #ffd60055' }}>
                    <div className="mb-2 text-warning"><FaQuoteLeft size={22} /></div>
                    <div className="mb-3 text-light" style={{ fontSize: '1.1rem', minHeight: 80 }}>{t.quote}</div>
                    <div className="text-end text-warning fw-bold"><FaQuoteRight size={18} className="me-2" />{t.author}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Mission Statement */}
        <section className="py-5">
          <div className="container">
            <motion.div
              className="rounded-4 p-4 p-md-5 text-center mx-auto"
              style={{
                maxWidth: 1200,
                background: "linear-gradient(90deg, #fbc02d 0%, #f9d423 100%)"
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="h2 fw-bold text-dark mb-3">
                Built for Export. Built to Last.
              </h2>
              <p className="lead text-dark mb-0">
                From high-performance export packaging to tailor-made B2B crate solutions, every piece we produce is precision-crafted to meet global quality standards, optimized for heavy loads, long hauls, and tough environments.
              </p>
            </motion.div>
          </div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Eco-Friendly Wooden Packaging Section */}
        <section className="py-5">
          <div className="container">
            <div className="p-4 p-md-5 mx-auto" style={{
              maxWidth: 1200,
              background: 'rgba(35,43,57,0.85)',
              border: '1.5px solid #FFD600',
              borderRadius: '1.5rem',
              boxShadow: '0 4px 32px #FFD60022, 0 1.5px 6px #0002',
              color: '#f3f3f3',
              textAlign: 'center',
              marginTop: 32,
              marginBottom: 32,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 44, color: '#43a047', marginBottom: 8 }}>
                  <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C16 3 6 10 6 18C6 23.5228 10.4772 28 16 28C21.5228 28 26 23.5228 26 18C26 10 16 3 16 3Z" fill="#43a047"/><path d="M16 3C16 3 6 10 6 18C6 23.5228 10.4772 28 16 28C21.5228 28 26 23.5228 26 18C26 10 16 3 16 3Z" fill="#66bb6a" fillOpacity="0.3"/></svg>
                </span>
                <h3 className="fw-bold mb-2" style={{ color: '#43a047', fontSize: '2.1rem', fontWeight: 900, letterSpacing: 0.5 }}>
                  Why Choose Wooden Packaging?
                </h3>
                <div style={{ width: 80, height: 4, background: 'linear-gradient(90deg, #FFD600 60%, #43a047 100%)', borderRadius: 2, margin: '0 auto 18px auto' }} />
              </div>
              <p style={{ fontSize: '1.15rem', color: '#e0e6ed', marginBottom: 0, marginTop: 8 }}>
                One of the primary reasons wooden packaging is gaining traction is its eco-friendliness. Unlike plastic, wood is a renewable resource that can be sustainably harvested. This means that when you choose wooden packaging, you are supporting a cycle that promotes reforestation and responsible forestry practices. Additionally, wooden packaging is biodegradable, reducing the burden on landfills and contributing to a cleaner environment.
              </p>
              <p style={{ fontSize: '1.15rem', color: '#e0e6ed', marginBottom: 0, marginTop: '1.1rem' }}>
                Furthermore, modern consumers are drawn to products that reflect their values. The shift towards sustainability is a key selling point. Companies that adopt wooden packaging not only enhance their brand image but also tap into a growing market of environmentally conscious consumers. By opting for wooden solutions, you position your business as a leader in sustainability, appealing to a demographic that prioritizes eco-friendly choices.
              </p>
            </div>
          </div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Stats Section */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, #232b39 60%, #ffd60011 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Animated background dots */}
          <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0}}>
            <svg width="100%" height="100%" style={{opacity: 0.08}}>
              <circle cx="15%" cy="30%" r="60" fill="#FFD600" />
              <circle cx="80%" cy="70%" r="40" fill="#FFD600" />
              <circle cx="50%" cy="10%" r="30" fill="#FFD600" />
            </svg>
          </div>
          <div className="container position-relative" style={{zIndex: 1}}>
            <motion.h2 className="display-5 fw-bold text-center mb-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <span className="text-warning">Proven</span> Excellence
            </motion.h2>
            <div className="text-center text-secondary mb-4" style={{fontSize: '1.15rem'}}>
              <span>Our track record speaks for itself—trusted by hundreds, delivering thousands.</span>
            </div>
            <motion.div className="row g-4 mb-6 justify-content-center" variants={statVariants} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {stats.map((stat, i) => (
                <motion.div className="col-6 col-md-3" key={stat.label} variants={statItem}>
                  <div className="card border-0 text-center h-100 p-4 about-hover-card" style={{ background: 'rgba(35,43,57,0.85)', borderRadius: '1.5rem', border: '1.5px solid #FFD600', boxShadow: '0 4px 32px #FFD60022, 0 1.5px 6px #0002', backdropFilter: 'blur(4px)' }}>
                    <div>{statIcons[i]}</div>
                    <div className="display-5 fw-bold text-warning mb-1">
                      <CountUp
                        end={stat.value}
                        duration={1.5}
                        suffix={stat.suffix}
                        enableScrollSpy
                        scrollSpyOnce
                      />
                    </div>
                    <div className="fw-medium text-light">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="d-flex justify-content-center mb-5" style={{marginTop: '2.5rem'}}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="badge rounded-pill bg-dark border border-warning text-warning px-4 py-2 fs-6 fw-semibold">
                <FaAward className="me-2" />Trusted by Industry Leaders
              </span>
            </motion.div>
            <motion.h2 className="h3 fw-bold text-center mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Our wooden packaging solutions power the supply chains of <span className="text-warning">leading organizations</span>
            </motion.h2>
            <motion.div className="row g-4" variants={cardCascade} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {clients.map((client, i) => (
                <motion.div className="col-md-6" key={client.name} variants={cardItem}>
                  <div className="card border-0 h-100 p-4 d-flex flex-row align-items-start gap-3 about-hover-card" style={{ background: '#232b39', borderRadius: '1.5rem', border: '1px solid #ffd60055', boxShadow: '0 2px 12px #FFD60022' }}>
                    <div className="bg-warning bg-opacity-25 rounded-3 p-3 d-flex align-items-center justify-content-center">
                      {client.icon}
                    </div>
                    <div>
                      <h5 className="fw-bold text-light mb-1">{client.name}</h5>
                      <p className="mb-0 text-light small">{client.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Why Choose Us */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, #ffd60011 0%, #232b39 100%)', position: 'relative' }}>
          <div className="container">
            <div className="text-center mb-2">
              <FaCheckCircle className="text-warning mb-2" size={36} />
            </div>
            <motion.h2 className="display-5 fw-bold text-center mb-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <span className="text-warning">Why Choose</span> Saravana Timbers?
            </motion.h2>
            <div className="text-center text-secondary mb-4" style={{fontSize: '1.15rem'}}>
              <span>Six key reasons why we're the preferred choice for precision timber packaging</span>
            </div>
            <motion.div className="row g-4" variants={cardCascade} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {features.map((feature, i) => (
                <motion.div className="col-md-6 col-lg-4" key={feature.title} variants={cardItem}>
                  <div className="card border-0 h-100 p-4 about-hover-card" style={{ background: 'rgba(35,43,57,0.85)', borderRadius: '1.5rem', border: '1.5px solid #FFD600', boxShadow: '0 4px 32px #FFD60022, 0 1.5px 6px #0002', backdropFilter: 'blur(4px)', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="bg-warning bg-opacity-25 rounded-3 p-2 d-flex align-items-center justify-content-center">
                        {feature.icon}
                      </div>
                      <h5 className="fw-bold text-light mb-0">{feature.title}</h5>
                    </div>
                    <p className="mb-0 text-light small">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <hr className="my-5" style={{ borderTop: '2px solid #2c3240', opacity: 1 }} />

        {/* Call to Action */}
        <section className="py-5 bg-warning text-center">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="display-5 fw-bold text-dark mb-3">
                Ready to Ship with Confidence?
              </h2>
              <p className="lead text-dark mb-4 mx-auto" style={{maxWidth: 700}}>
                Whether you're shipping pumps, paper rolls, or railway components—our precision-built wooden solutions ensure your cargo reaches safely, every time. Let's build something that carries your products—and your reputation—further.
              </p>
              <motion.div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <button className="btn btn-dark btn-lg fw-bold px-5 py-3 d-flex align-items-center gap-2" style={{ boxShadow: '0 2px 12px #0004', transition: 'background 0.2s' }}
                  onClick={() => navigate('/quotation')}
                >
                  <FaBoxOpen className="me-2" />Get Custom Quote
                </button>
                <button className="btn btn-outline-dark btn-lg fw-bold px-5 py-3 d-flex align-items-center gap-2" style={{ borderWidth: 2, transition: 'background 0.2s, color 0.2s' }}
                  onClick={() => navigate('/catalogue')}
                >
                  <FaAward className="me-2" />View Our Work
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Scroll to Top Button */}
        {showScroll && (
          <button onClick={scrollToTop} style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 100, background: '#ffd600', color: '#232b39', border: 'none', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 12px #0006', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, cursor: 'pointer', transition: 'background 0.2s' }} title="Scroll to top">
            <FaArrowUp />
          </button>
        )}
      </div>
    </>
  );
}