import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products";
import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/admin";
import { asyncHandler } from "../utils/routeWrapper";

const router = express.Router();

// Public routes
router.get("/", asyncHandler(getAllProducts));
router.get("/:id", asyncHandler(getProductById));

// Admin only routes
router.post("/", authenticate, isAdmin, asyncHandler(createProduct));
router.put("/:id", authenticate, isAdmin, asyncHandler(updateProduct));
router.delete("/:id", authenticate, isAdmin, asyncHandler(deleteProduct));

export default router;
