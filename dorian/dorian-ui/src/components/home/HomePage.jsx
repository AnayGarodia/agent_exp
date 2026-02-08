import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Layers, GitBranch } from 'lucide-react';
import Navigation from '../layout/Navigation';
import Button from '../shared/Button';
import AnimatedGrid from './AnimatedGrid';
import FeatureCard from './FeatureCard';
import './HomePage.css';

const HomePage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const features = [
    {
      icon: <Sparkles size={24} />,
      title: "Visual Workflow Builder",
      description: "Design complex AI workflows with an intuitive drag-and-drop interface. No coding required."
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Deployment",
      description: "Deploy your agents in seconds. Test, iterate, and scale with confidence."
    },
    {
      icon: <Layers size={24} />,
      title: "Rich Integrations",
      description: "Connect to Gmail, Slack, databases, and APIs. Build agents that work with your tools."
    },
    {
      icon: <GitBranch size={24} />,
      title: "Conditional Logic",
      description: "Create sophisticated workflows with branching, loops, and decision trees."
    }
  ];

  return (
    <div className="homepage">
      <Navigation />
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="hero"
        style={{ opacity, scale }}
      >
        <AnimatedGrid />
        
        <div className="hero__content container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              className="hero__badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="hero__badge-icon">✦</span>
              <span>Build AI Agents Visually</span>
            </motion.div>

            <h1 className="hero__title">
              Compose AI agents.
              <br />
              <span className="hero__title-accent">Effortlessly.</span>
            </h1>

            <p className="hero__description">
              Dorian turns AI workflows into drag-and-drop blocks. Connect your Gmail, add AI steps, and automate the repetitive stuff.
            </p>

            <div className="hero__actions">
              <Button 
                variant="primary" 
                size="large"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                onClick={() => window.location.href = '/builder'}
              >
                Start Building
              </Button>
              <Button variant="secondary" size="large">
                View Demo
              </Button>
            </div>

            <motion.div 
              className="hero__stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="hero__stat">
                <div className="hero__stat-value">20+</div>
                <div className="hero__stat-label">Pre-built Blocks</div>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <div className="hero__stat-value">∞</div>
                <div className="hero__stat-label">Possibilities</div>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <div className="hero__stat-value">4</div>
                <div className="hero__stat-label">Quick Templates</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <motion.div 
            className="features__header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="features__title">Everything you need</h2>
            <p className="features__description">
              Powerful tools to build, test, and deploy AI workflows
            </p>
          </motion.div>

          <div className="features__grid">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                {...feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta__content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="cta__title">Ready to build?</h2>
            <p className="cta__description">
              Start creating AI workflows that work for you
            </p>
            <Button 
              variant="primary" 
              size="large"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              onClick={() => window.location.href = '/builder'}
            >
              Start Building Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__brand">
              <div className="footer__logo">Dorian</div>
              <p className="footer__tagline">Build AI agents. No code required.</p>
            </div>
            <div className="footer__links">
              <a href="#" className="footer__link">Documentation</a>
              <a href="#" className="footer__link">GitHub</a>
              <a href="#" className="footer__link">Community</a>
            </div>
          </div>
          <div className="footer__bottom">
            <p> 2026 Dorian. Building the future of AI agents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
