import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/HeroBanner.css';

const HeroBanner = ({ title, subtitle, backgroundImage, ctaText, onCTAClick, secondaryCTAText, onSecondaryCTAClick }) => {
    const bannerStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`
      } : {};

  return (
    <section className="hero-banner" style={bannerStyle}>
      <div className="hero-banner-overlay">
        <div className="hero-banner-content">
          <h1 className="hero-banner-title">{title}</h1>
          {subtitle && <p className="hero-banner-subtitle">{subtitle}</p>}
          {ctaText && (
            <button className="hero-banner-cta" onClick={onCTAClick}>
              {ctaText}
            </button>
          )}
          <button
          className="hero-banner-cta secondary"
          onClick={onSecondaryCTAClick}
        >{secondaryCTAText}</button>
        </div>
      </div>
    </section>
  );
};

HeroBanner.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  backgroundImage: PropTypes.string,
  ctaText: PropTypes.string,
  onCTAClick: PropTypes.func,
  altText: PropTypes.string, 
  secondaryCTAText: PropTypes.string,
  onSecondaryCTAClick: PropTypes.func,
};

export default HeroBanner;
