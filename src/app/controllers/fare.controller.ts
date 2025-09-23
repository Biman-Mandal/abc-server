import { Request, Response, NextFunction } from "express";
import Coupon from "../models/coupon.model";
import { ICoupon } from "../interfaces/coupon.interface";

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const couponData: ICoupon = req.body;
    const newCoupon = await Coupon.create(couponData);
    res.status(201).json({ success: true, message: "Coupon created successfully", data: newCoupon });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
        return;
    } catch (error) {
        next(error);
    }
};

export const updateCouponById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedData: Partial<ICoupon> = req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedCoupon) {
            res.status(404).json({ success: false, message: "Coupon not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Coupon updated successfully", data: updatedCoupon });
        return;
    } catch (error) {
        next(error);
    }
};

export const deleteCouponById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            res.status(404).json({ success: false, message: "Coupon not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Coupon deleted successfully" });
        return;
    } catch (error) {
        next(error);
    }
};

const calculateFare = (distanceInKm: number, vehicleType: 'bike' | 'car') => {
    const baseFare = vehicleType === 'bike' ? 20 : 40;
    const perKmRate = vehicleType === 'bike' ? 5 : 12;
    return baseFare + (distanceInKm * perKmRate);
};

export const estimateFare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { distance, vehicleType, couponCode } = req.body;
        if (!distance || !vehicleType) {
            res.status(400).json({ success: false, message: "Distance and vehicle type are required" });
            return;
        }

        let estimatedFare = calculateFare(distance, vehicleType);
        let discount = 0;
        let finalFare = estimatedFare;
        let couponApplied = false;
        let message = "Fare estimated successfully.";

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gte: new Date() } });
            if (coupon) {
                if (estimatedFare >= (coupon.minRideValue || 0)) {
                    if (coupon.discountType === 'Flat') {
                        discount = coupon.discountValue;
                    } else if (coupon.discountType === 'Percentage') {
                        discount = (estimatedFare * coupon.discountValue) / 100;
                        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                            discount = coupon.maxDiscount;
                        }
                    }
                    finalFare = estimatedFare - discount;
                    couponApplied = true;
                } else {
                    message = "Coupon is valid, but minimum ride value not met.";
                }
            } else {
                message = "Invalid or expired coupon code.";
            }
        }
        
        finalFare = finalFare < 0 ? 0 : Math.round(finalFare);

        res.status(200).json({
            success: true,
            message,
            data: {
                estimatedFare: Math.round(estimatedFare),
                discount: Math.round(discount),
                finalFare,
                couponApplied,
            }
        });
        return;

    } catch (error) {
        next(error);
    }
};