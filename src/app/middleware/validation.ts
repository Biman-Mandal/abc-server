import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateSafetyToolkit = [
  body("image")
    .notEmpty()
    .withMessage("Image is required")
    .isURL()
    .withMessage("Image must be a valid URL")
    .matches(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    .withMessage("Image must be a valid image URL (jpg, jpeg, png, gif, webp, svg)"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

export { validateSafetyToolkit }