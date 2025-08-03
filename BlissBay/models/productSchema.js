import mongoose from 'mongoose';
import Order from '../models/orderSchema.js';
import Cart from '../models/cartSchema.js';
import Wishlist from '../models/wishlistSchema.js';
import Review from '../models/reviewRatingSchema.js';
import Category from '../models/categorySchema.js';

const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discountedPrice: Number,
  stock: { type: Number, default: 0 },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User' },
  images: [{type: String, required: true}],
  brand: String,
  ratings: Number,
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  attributes: { color: String, weight: Number },
  createdAt: { type: Date, default: Date.now },
  isFeatured: {
  type: Boolean,
  default: false
},
isPopular: {
  type: Boolean,
  default: false
},
isNewArrival: {
  type: Boolean,
  default: false
},
isBestSeller: {
  type: Boolean,
  default: false
},
isTrending: {
  type: Boolean,
  default: false
},
isHotDeal: {
  type: Boolean,
  default: false
},
isLimitedOffer: {
  type: Boolean,
  default: false
},
isFlashSale: {
  type: Boolean,
  default: false
},
isBackInStock: {
  type: Boolean,
  default: false
},
isExclusive: {
  type: Boolean,
  default: false
},
isCoupon: {
  type: Boolean,
  default: false
},
isLowStock: {
  type: Boolean,
  default: false
},
isFreeShipping: {
  type: Boolean,
  default: false
}

});

// Helper function to check references
async function checkProductReferences(productId) {
  const [
    activeOrders,
    cartItems,
    wishlistItems,
    reviews,
    categoryRefs
  ] = await Promise.all([
    Order.exists({
      'items.productId': productId,
      status: { $in: ['PENDING', 'PROCESSING', 'SHIPPED'] }
    }),
    Cart.find({ 'items.productId': productId }),
    Wishlist.find({ 'items.productId': productId }),
    Review.find({ productId }),
    Category.find({ products: productId })
  ]);

  return {
    hasActiveOrders: !!activeOrders,
    cartReferences: cartItems.length > 0,
    wishlistReferences: wishlistItems.length > 0,
    reviewCount: reviews.length,
    categoryReferences: categoryRefs.length > 0
  };
}

// Pre-middleware for findOneAndDelete and findByIdAndDelete
productSchema.pre('findOneAndDelete', async function(next) {
  const productId = this.getQuery()._id;
  try {
    const references = await checkProductReferences(productId);

    if (references.hasActiveOrders) {
      const softDeleteUpdates = {
        status: 'INACTIVE',
        deletedAt: new Date(),
        isVisible: false,
        lastModifiedAt: new Date()
      };

      const product = await this.model.findOneAndUpdate(
        { _id: productId },
        softDeleteUpdates,
        { new: true }
      );

      const updateOperations = [
        Review.updateMany(
          { productId },
          {
            status: 'INACTIVE',
            deletedAt: new Date(),
            lastModifiedAt: new Date()
          }
        )
      ];

      if (references.cartReferences) {
        updateOperations.push(
          Cart.updateMany(
            { 'items.productId': productId },
            {
              $set: {
                'items.$.status': 'UNAVAILABLE',
                'items.$.lastModifiedAt': new Date(),
                'items.$.removedReason': 'PRODUCT_DELETED'
              }
            }
          )
        );
      }

      if (references.wishlistReferences) {
        updateOperations.push(
          Wishlist.updateMany(
            { 'items.productId': productId },
            {
              $set: {
                'items.$.status': 'UNAVAILABLE',
                'items.$.lastModifiedAt': new Date(),
                'items.$.removedReason': 'PRODUCT_DELETED'
              }
            }
          )
        );
      }

      if (references.categoryReferences) {
        updateOperations.push(
          Category.updateMany(
            { products: productId },
            {
              $pull: { products: productId },
              $set: { lastModifiedAt: new Date() }
            }
          )
        );
      }

      await Promise.all(updateOperations);

      this._softDeleteInfo = {
        references,
        product
      };

      next(new Error('SOFT_DELETE'));
    } else {
      const cleanupOperations = [
        Review.deleteMany({ productId }),

        Cart.updateMany(
          { 'items.productId': productId },
          {
            $pull: {
              items: { productId }
            }
          }
        ),

        Wishlist.updateMany(
          { 'items.productId': productId },
          {
            $pull: {
              items: { productId }
            }
          }
        ),

        Category.updateMany(
          { products: productId },
          {
            $pull: { products: productId },
            $set: { lastModifiedAt: new Date() }
          }
        )
      ];

      await Promise.all(cleanupOperations);
      next();
    }
  } catch (error) {
    next(error);
  }
});

productSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    console.log(`Product ${doc._id} successfully deleted`);
  }
});

export default mongoose.models.Product || mongoose.model('Product', productSchema)

















