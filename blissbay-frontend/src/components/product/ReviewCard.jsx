// src/components/reviews/ReviewCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns'; // npm install date-fns

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-4 h-4 ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const {
    user,
    rating,
    comment,
    createdAt,
    isVerified = false,
    images = []
  } = review;

  return (
    <article className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Review Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={`${user.name}'s avatar`}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            {isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified Purchase
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={rating} />
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="mt-4">
        <p className="text-gray-700 whitespace-pre-line">{comment}</p>
      </div>

      {/* Review Images */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Actions */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <button
          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          aria-label="Mark as helpful"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Helpful</span>
        </button>
        <button
          className="hover:text-gray-700 transition-colors"
          aria-label="Report review"
        >
          Report
        </button>
      </div>
    </article>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string.required,
      avatar: PropTypes.string
    }).isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    isVerified: PropTypes.bool,
    images: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired
};

export default ReviewCard;
