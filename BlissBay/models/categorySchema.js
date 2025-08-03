import mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    ancestors: [{
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        required: true
      }
    }],
    image: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Pre-save middleware to update ancestors
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') && this.parent) {
    try {
      const parent = await this.constructor.findById(this.parent);
      if (!parent) {
        return next(new Error('Parent category not found'));
      }
      
      this.ancestors = [
        ...parent.ancestors,
        {
          _id: parent._id,
          name: parent.name,
          slug: parent.slug
        }
      ];
    } catch (error) {
      return next(error);
    }
  } else if (this.isModified('parent') && !this.parent) {
    // If parent is removed, clear ancestors
    this.ancestors = [];
  }
  next();
});

// Check if model exists before creating it
export default mongoose.models.Category || mongoose.model('Category', categorySchema);

















