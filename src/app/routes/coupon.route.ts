import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { createCoupon, getAllCoupons, updateCouponById, deleteCouponById, estimateFare } from "../controllers/fare.controller";
import { auth } from "../middleware/auth";

const router = Router();


router.post('/admin/create', verifyAdmin, createCoupon);
router.get('/admin/all', verifyAdmin, getAllCoupons);
router.put('/admin/:id', verifyAdmin, updateCouponById);
router.delete('/admin/:id', verifyAdmin, deleteCouponById);

router.post('/estimate-fare', auth, estimateFare);

export default router;