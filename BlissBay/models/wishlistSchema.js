import mongoose from 'mongoose';

const { Schema } = mongoose;

const wishlistItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const wishlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [wishlistItemSchema],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add pre-save hook to update the updatedAt field
wishlistSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Query helper to include soft-deleted items
wishlistSchema.query.withDeleted = function () {
  return this.find({ $or: [{ isDeleted: false }, { isDeleted: true }] });
};

// Method to add a product to the wishlist
wishlistSchema.methods.addItem = async function (productId) {
  // Check if the product already exists and is not deleted
  const existingItem = this.items.find(
    (item) => item.productId.toString() === productId && !item.isDeleted
  );

  if (existingItem) {
    return false; // Product already in wishlist
  }

  // Check if the product was previously deleted
  const deletedItem = this.items.find(
    (item) => item.productId.toString() === productId && item.isDeleted
  );

  if (deletedItem) {
    // Restore the deleted item
    deletedItem.isDeleted = false;
    deletedItem.deletedAt = null;
    deletedItem.addedAt = Date.now();
  } else {
    // Add new item
    this.items.push({ productId });
  }

  await this.save();
  return true;
};

// Method to soft remove a product from the wishlist
wishlistSchema.methods.removeItem = async function (productId) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId && !item.isDeleted
  );

  if (!item) {
    return false; // Product not found or already deleted
  }

  item.isDeleted = true;
  item.deletedAt = Date.now();

  await this.save();
  return true;
};

// Method to permanently remove a product from the wishlist
wishlistSchema.methods.hardRemoveItem = async function (productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter((item) => item.productId.toString() !== productId);

  if (initialLength === this.items.length) {
    return false; // Product not found
  }

  await this.save();
  return true;
};

// Method to restore the entire wishlist
wishlistSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;

  // Restore all deleted items
  this.items.forEach((item) => {
    if (item.isDeleted) {
      item.isDeleted = false;
      item.deletedAt = null;
    }
  });

  await this.save();
  return true;
};

// Method to permanently delete the wishlist
wishlistSchema.methods.permanentDelete = async function () {
  await this.model('Wishlist').deleteOne({ _id: this._id });
  return true;
};

// Static method to check if a product is in a user's wishlist
wishlistSchema.statics.checkProductInWishlist = async function (userId, productId) {
  const wishlist = await this.findOne({
    userId,
    items: {
      $elemMatch: {
        productId,
        isDeleted: false,
      },
    },
  });

  return !!wishlist;
};

// Static method to get paginated wishlist items
wishlistSchema.statics.getPaginatedWishlist = async function (userId, page, limit) {
  const wishlist = await this.findOne({ userId })
    .populate({
      path: 'items.productId',
      match: { isDeleted: false },
      select: 'name price description images', // Adjust fields as needed
    });

  if (!wishlist) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: page,
    };
  }

  // Filter out deleted items and items where product couldn't be populated
  const activeItems = wishlist.items
    .filter((item) => !item.isDeleted && item.productId)
    .sort((a, b) => b.addedAt - a.addedAt);

  const totalItems = activeItems.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedItems = activeItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage: page,
  };
};

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
