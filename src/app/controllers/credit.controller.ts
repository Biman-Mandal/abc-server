import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import Credit from "../models/credit.model"
import Ride from "../models/ride.model"
import { getIoInstance } from "../socket/socket";

/**
 * Helper to read platform fee percent (e.g. 0.5 means 0.5%)
 */
function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT ?? "0.5"
  const percent = Number(raw)
  return Number.isFinite(percent) ? percent : 0.5
}

/**
 * POST /credit/ride/:rideId/settle
 * - Requires the ride to be completed
 * - Uses ride.fare for calculation
 * - Deducts platform fee (from .env PLATFORM_FEE_PERCENT) and credits net to driver wallet
 * - Records two transactions: add_credit (net) and ride_deduction (fee), both linked to rideId
 * - Emits "payment:success" to user and driver
 */
export const settleRidePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rideId } = req.params

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rideId.",
      })
    }

    const ride = await Ride.findById(rideId).lean()
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found.",
      })
    }

    if (ride.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Ride is not completed yet.",
      })
    }

    if (!ride.driver) {
      return res.status(400).json({
        success: false,
        message: "No driver assigned to this ride.",
      })
    }

    const fare = typeof ride.fare === "number" ? ride.fare : 0
    if (fare <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fare amount for this ride.",
      })
    }

    const feePercent = getPlatformFeePercent() // e.g. 0.5 = 0.5%
    const feeAmount = Number((fare * (feePercent / 100)).toFixed(2))
    const netAmount = Number((fare - feeAmount).toFixed(2))

    // Atomic upsert/update of credit wallet
    const wallet = await Credit.findOneAndUpdate(
      { driver: ride.driver },
      {
        $inc: { balance: netAmount },
        $push: {
          transactions: {
            $each: [
              {
                amount: netAmount,
                type: "add_credit",
                timestamp: new Date(),
                rideId: ride._id,
              },
              ...(feeAmount > 0
                ? [
                    {
                      amount: feeAmount,
                      type: "ride_deduction",
                      timestamp: new Date(),
                      rideId: ride._id,
                    },
                  ]
                : []),
            ],
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    )

    // Emit payment success to user and driver
    // Assumes socket.io instance stored in app: app.set("io", io)
    const payload = {
      rideId: String(ride._id),
      userId: String(ride.user),
      driverId: String(ride.driver),
      fare,
      platformFeePercent: feePercent,
      platformFee: feeAmount,
      netAmount,
      status: "success",
    }
    console.log(ride.user)
    console.log(ride.driver)
    // Targeted rooms if your app uses rooms like `user:<id>` and `driver:<id>`
    const io = getIoInstance();
    io.to(ride.user.toString()).emit("payment:success", payload)
    io.to(ride.driver.toString()).emit("payment:success", payload)

    return res.status(200).json({
      success: true,
      message: "Ride payment settled and credited to driver.",
      data: {
        platformFeePercent: feePercent,
        platformFee: feeAmount,
        netAmount,
        wallet,
      },
    })
  } catch (error) {
    next(error)
  }
}
