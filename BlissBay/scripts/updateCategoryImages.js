// scripts/updateCategoryImages.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/categorySchema.js"; // Adjust path if needed

dotenv.config();

const categoryImages = {
  "Sports & Outdoors":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjh-UM1sTSprNOZ3M01kf8UUVtWTfFCHAgvw&s", //mnhgdfz
  Headphones:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZumOEcys1KYPH2K1ElnX-UtC-ljcgQOZpZQ&s",
  Furniture:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkrRwc9q-Lbfd6UfeAbE7-IKB43Pjvccr0_A&s",
  "Beauty & Health":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT6TmubWlOw6I6OF60wHgHwL3aY-7gcXdrPA&s",
  Smartphones:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiSUGcZQaCuu2zutpBHLwQLTA3eN16X37lAA&s",
  Watches:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVKqBwKVJ1HhXpWUGJNwqozOp6ZGZCVK0Isg&s",
  Toys: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZb7HUIpiVr_e_p1cj1MU-PBWjEn5ddGnSeg&s",
  Laptops:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0atWyVqJAkx-CrYW-tI0auSdwpxN9Yr25Pw&s",
  "Tools & Home Improvement":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeUaB92og6ZGN9zijgnH_mBJ8Yu3RbqKZnag&s",
  Accessories:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4AkLL6Qj_VbYiH42-h9OJnAl-sRorGwuq4Q&s",
  Books:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmH8IenjgyQePLLn1tvJOiML6bg7BxD-IpEw&s",
  Gaming:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR4ijEGt548At95jMEKQo7kxd5KJSDSqU7jQ&s",
  "Office Supplies":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAAjyxmtgfJ1lJIuJiTCScc--xwACP4lCmzw&s",
  Photography:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRD0K4SmGTyTyfUjLmRy8VyRrBeR1Z6XYqyA&s",
  Clothing:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH2V5GBp4kPVi-Q-jV5CmAD6d1AP8i4yXn5g&s",
  Music:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Y8PBANDXdWTiX93ly9yBw4jz-473oXUezg&s",
  Automotive:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH93RALRquu_PdIYJf-6K4x6roBqaYvBgY_g&s",
  "Baby Products":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnQzIF1XxM0SswpSTGq1meV7eOdZ1Ga3zStQ&s",
  "Food & Beverages":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMaBSHhE0d5nt6FgBJCe9eZmNoSfXxZvzOpg&s",
  "Art & Crafts":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh6UtUjUZaOJKXaLLTr9506chj7k7c1Rjdwg&s",
  "Home Appliances":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8_g1tsVfapZl7-t6vGIIro5th6XNZpsf3jQ&s",
  Groceries:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwBXBihB_Wb6zVCpcWVu4eLpciChTr4rU4sA&s",
  "Pet Supplies":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQe2OSiNsz_rPDA_7MKXe806QaWNykQy9gyQ&s",
  "Health & Fitness":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9Ioc-aF307GxMhP-VpyNW8hIM-XTgnR-Fxg&s",
  Shoes:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfi1MOtG1Bs09Yq0ccgNHa0gEEIQyfTeFnJg&s",
};

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const updates = await Promise.all(
      Object.entries(categoryImages).map(async ([name, image]) => {
        return Category.findOneAndUpdate({ name }, { image });
      })
    );
    console.log(`✅ Updated ${updates.length} categories with images`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating category images:", err);
    process.exit(1);
  }
};

updateImages();
