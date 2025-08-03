import React from "react";
import { useNavigate } from "react-router-dom";
import HeroBanner from "../components/UI/HeroBanner";
import FlaggedProducts from "../components/product/FlaggedProducts";
import  "../styles/Home.css";
import homepageImage from "../assets/images/banner2.png";

const Home = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const handleShopNow = () => {
    navigate("/products");
  };

  const handleExploreCategories = () => {
    navigate("/categories");
  };

   // Put every flag you want to render in one array ↓
  const flaggedSections = [
    { flag: "isFeatured",   title: "Featured Products" },
    { flag: "isNewArrival", title: "New Arrivals" },
    { flag: "isTrending",   title: "Trending Now" },
    { flag: "isBestSeller", title: "Best Sellers" },
    { flag: "isHotDeal",    title: "Hot Deals" },
    // ⬇️ add more flags here later—no code duplication, no overlap
  ];

  return (
    <div className="home-container">
      {/* Hero Banner Section */}
      <div className="hero-wrapper">
        <HeroBanner
          title="Welcome to BlissBay"
          subtitle="Elevating Your Shopping Experience with Quality, Value, and Convenience."
          backgroundImage={homepageImage}
          ctaText="Shop Now"
          onCTAClick={handleShopNow}
          secondaryCTAText="Explore Categories"
          onSecondaryCTAClick={handleExploreCategories}
        />
      </div>

      {flaggedSections.map(({ flag, title }, index) => (
        <section
          key={flag}
          className={`bg-white rounded-xl shadow w-full ${index !== flaggedSections.length - 1 ? "" : ""}`}

        >
          <FlaggedProducts flag={flag} title={title} />
        </section>
      ))}
    </div>
  );
};

export default Home;
