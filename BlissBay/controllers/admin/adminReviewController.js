import mongoose from "mongoose";
import Review from "../../models/reviewRatingSchema.js";


export const getReviewWithComments = async (reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error('Invalid review ID format');
  }

  const review = await Review.findById(reviewId)
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        select: 'name avatar'
      }
    })
    .lean();

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

export const showReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page: queryPage = '1', limit: queryLimit = '10', rating, sort } = req.query;

    const page = Math.max(1, parseInt(queryPage) || 1);
    const limit = Math.max(1, parseInt(queryLimit) || 10);

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    let filter = { product: productId };
    if (rating) {
      const ratingValue = parseInt(rating);
      if (ratingValue >= 1 && ratingValue <= 5) {
        filter.rating = ratingValue;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid rating value. Use 1-5.'
        });
      }
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 }
    };
    const sortOption = sortOptions[sort] || sortOptions.newest;

    const [reviews, totalReviews, ratingStats] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name avatar')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Review.countDocuments(filter),

      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 },
            ratingCounts: { $push: '$rating' }
          }
        }
      ])
    ]);

    const ratingDistribution =
      ratingStats.length > 0
        ? {
            5: ratingStats[0].ratingCounts.filter((r) => r === 5).length,
            4: ratingStats[0].ratingCounts.filter((r) => r === 4).length,
            3: ratingStats[0].ratingCounts.filter((r) => r === 3).length,
            2: ratingStats[0].ratingCounts.filter((r) => r === 2).length,
            1: ratingStats[0].ratingCounts.filter((r) => r === 1).length
          }
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNextPage: page * limit < totalReviews,
          hasPrevPage: page > 1
        },
        stats: {
          averageRating:
            ratingStats.length > 0
              ? parseFloat(ratingStats[0].averageRating.toFixed(1))
              : 0,
          totalRatings: ratingStats[0]?.totalRatings || 0,
          distribution: ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
