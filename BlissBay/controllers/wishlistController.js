import Wishlist from "../models/wishlistSchema.js";

export const getUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    res.json(wishlist || {});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addProductToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id });
    }

    const added = await wishlist.addItem(req.params.productId);
    if (!added) {
      return res.status(409).json({ message: "Product already in wishlist" });
    }

    res.json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const removed = await wishlist.removeItem(req.params.productId);
    if (!removed) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProductFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const removed = await wishlist.hardRemoveItem(req.params.productId);
    if (!removed) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.json({ message: "Product permanently removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const restoreRemovedProduct = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).withDeleted();
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    await wishlist.restore();
    res.json({ message: "Wishlist restored" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).withDeleted();
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    await wishlist.restore();
    res.json({ message: "Wishlist restored" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUserWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).withDeleted();
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    await wishlist.permanentDelete();
    res.json({ message: "Wishlist permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const checkIfProductInWishlist = async (req, res) => {
  try {
    const exists = await Wishlist.checkProductInWishlist(
      req.user.id,
      req.params.productId
    );
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaginatedWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Wishlist.getPaginatedWishlist(
      req.user.id,
      Number(page),
      Number(limit)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
