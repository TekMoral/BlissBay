import Review from '../models/reviewRatingSchema.js';
import Product from '../models/productSchema.js';
import mongoose from 'mongoose';

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


export const createReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const newReview = new Review({ userId, productId, rating, comment });
    await newReview.save({ session });

    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]).session(session);

    product.averageRating = stats[0]?.averageRating || 0;
    await product.save({ session });

    await session.commitTransaction();

    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    session.endSession();
  }
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

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating && !comment) {
      return res.status(400).json({
        error: 'At least one field (rating or comment) is required for update'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!review.productId) {
      return res.status(400).json({ error: 'Review is missing a product reference' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to edit this review' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    const reviews = await Review.find({ productId: review.productId }).lean();
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const product = await Product.findById(review.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.averageRating = averageRating;
    await product.save();

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this review' });
    }

    await review.deleteOne();

    const reviews = await Review.find({ productId: review.productId }).select('rating').lean();
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    const product = await Product.findById(review.productId);
    if (product) {
      product.averageRating = averageRating;
      await product.save();
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSingleReviewWithComments = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await getReviewWithComments(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Error fetching review with comments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
