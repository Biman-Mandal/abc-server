import express from "express"
import { settleRidePayment } from "../controllers/credit.controller"
import { auth } from "../middleware/auth"

const creditRouter = express.Router()

/**
 * Settle a completed ride's payment and credit the driver's wallet.
 * PLATFORM_FEE_PERCENT (0.5 = 0.5%) should be configured in environment variables.
 */
creditRouter.post("/ride/:rideId/settle", auth, settleRidePayment)

export default creditRouter
