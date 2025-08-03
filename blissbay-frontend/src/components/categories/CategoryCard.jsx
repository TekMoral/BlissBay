// components/categories/CategoryCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    return (
      <Link
        to={`/category/${category.slug}`}
        className="group relative w-full overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="aspect-video">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
  
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold truncate drop-shadow">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-white/90 text-sm line-clamp-2 mt-1 drop-shadow-sm">
              {category.description}
            </p>
          )}
        </div>
      </Link>
    );
  };
  

CategoryCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default CategoryCard;
