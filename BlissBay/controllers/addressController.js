import mongoose from "mongoose";
import Address  from "../models/addressSchema.js";
import { addressSchema } from '../validators/addressValidator.js'; 

export const addShippingAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { street, city, state, country, isDefault } = req.body;

    // Validate using Joi schema
    const { error } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Check if the user already has a Default address, and if so, set the new address to not be primary
    if (isDefault) {
      const existingPrimary = await Address.findOne({
        userId,
        isDefault: true,
      });
      if (existingPrimary) {
        return res
          .status(400)
          .json({ error: "User already has a primary address" });
      }
    }
    
    // Create new address
    const newAddress = new Address({
      userId,
      street,
      city,
      state,
      country,
      isDefault: isDefault || false,
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create address",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};


export const getAllAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch addresses",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Ensure userId is present
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Use the static method from the Address model
    const defaultAddress = await Address.getDefaultAddress(userId);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        error: "No default address found",
      });
    }

    res.status(200).json({
      success: true,
      address: defaultAddress,
    });
  } catch (error) {
    console.error("Error fetching default address:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch default address",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid address ID format",
      });
    }

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch address",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;
    const { street, city, state, country, isDefault } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid address ID format",
      });
    }

    // Validate using Joi schema
    const { error } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the address and ensure it belongs to the user
      const address = await Address.findOne({ _id: addressId, userId })
        .session(session)
        .exec();

      if (!address) {
        return res.status(404).json({
          success: false,
          error: 'Address not found or you do not have permission to update it'
        });
      }

      // Handle updating the default address (only one address should be default at a time)
      if (isDefault === true) {
        // Unset the default flag on other addresses if a new one is marked as default
        await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } }, { session });
      }

      // Perform the update
      address.street = street;
      address.city = city;
      address.state = state;
      address.country = country;
      if (isDefault !== undefined) address.isDefault = isDefault;

      // Save the updated address
      await address.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update address',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  } catch (error) {
    console.error('Error starting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate address update process',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
    
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid address ID format' 
          });
        }
    
        // Find address and ensure it belongs to the user
        const address = await Address.findOne({ _id: addressId, userId });
    
        if (!address) {
          return res.status(404).json({
            success: false,
            error: 'Address not found or you do not have permission to update it'
          });
        }
    
        // Set as default (the pre-save middleware will handle unsetting other defaults)
        address.isDefault = true;
        await address.save();
    
        res.status(200).json({
          success: true,
          message: 'Address set as default successfully',
          address
        });
      } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to set default address',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      };
};

export const deleteAddress = async (req, res) =>{
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;
    
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid address ID format' 
          });
        }
    
        // Find the address first to check if it's the default
        const address = await Address.findOne({ _id: addressId, userId });
        
        if (!address) {
          return res.status(404).json({
            success: false,
            error: 'Address not found or you do not have permission to delete it'
          });
        }
        
       // Prevent deletion if the user has no other address
    const remainingAddresses = await Address.countDocuments({ userId });
    if (remainingAddresses <= 1) {
      return res.status(400).json({
        success: false,
        error: 'You must have at least one address on file'
      });
    }
    await address.remove();
        
    
        res.status(200).json({
          success: true,
          message: 'Address deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete address',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      };
};