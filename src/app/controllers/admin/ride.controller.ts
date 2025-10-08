import type { Request, Response } from "express"
import Ride from "../../models/ride.model"
import { calculateAverageRating } from "../../utils/rating.util"

export const getRides = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number.parseInt((req.query.page as string) || "1"), 1)
    const limit = Math.max(Number.parseInt((req.query.limit as string) || "8"), 1) // default 8 per page
    const status = (req.query.status as string) || undefined
    const search = (req.query.search as string) || undefined

    const match: any = {}

    // Filter by status if provided
    if (status && status !== "all") {
      match.status = status
    }

    // Search across user, driver, pickup, dropoff
    if (search) {
      match.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { "driver.driverName": { $regex: search, $options: "i" } },
        { "pickupLocation.address": { $regex: search, $options: "i" } },
        { "dropoffLocation.address": { $regex: search, $options: "i" } },
      ]
    }

    // Fetch paginated rides, count, and total fees
    const [items, totalCount, totalFeesAgg] = await Promise.all([
      Ride.find(match)
        .sort({ createdAt: -1 }) // latest first
        .skip((page - 1) * limit)
        .limit(limit)
        .populate([
          { path: "user", select: "name phoneNumber" },
          { path: "driver", select: "driverName phone rating" },
        ])
        .lean(),
      Ride.countDocuments(match),
      Ride.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: { $ifNull: ["$fare", 0] } } } }]),
    ])

    const totalFees = totalFeesAgg?.[0]?.total || 0

    // Attach ratings
    const itemsWithRatings = await Promise.all(
      items.map(async (ride: any) => {
        const [userRating, driverRating] = await Promise.all([
          calculateAverageRating("User", String(ride.user?._id)),
          ride.driver?._id
            ? calculateAverageRating("Driver", String(ride.driver._id))
            : Promise.resolve({ averageRating: 0, totalRatings: 0 }),
        ])

        return {
          _id: ride._id,
          user: ride.user
            ? { _id: ride.user._id, name: ride.user.name, phoneNumber: ride.user.phoneNumber, rating: userRating }
            : null,
          driver: ride.driver
            ? {
                _id: ride.driver._id,
                driverName: ride.driver.driverName,
                phone: ride.driver.phone,
                rating: driverRating,
              }
            : null,
          pickupLocation: ride.pickupLocation,
          dropoffLocation: ride.dropoffLocation,
          status: ride.status,
          fare: ride.fare || 0,
          estimatedTime: ride.estimatedTime,
          createdAt: ride.createdAt,
        }
      }),
    )

    res.json({
      success: true,
      data: itemsWithRatings,
      meta: {
        page,
        limit,
        total: totalCount,
        totalFees,
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch rides" })
  }
}

export const getRideById = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate([
        { path: "user", select: "name phoneNumber city" },
        { path: "driver", select: "driverName phone vehicleNumber vehicleModel vehicleBrand rating" },
      ])
      .lean()

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" })
    }

    const [userRating, driverRating] = await Promise.all([
      ride.user
        ? calculateAverageRating("User", String((ride as any).user._id))
        : { averageRating: 0, totalRatings: 0 },
      ride.driver
        ? calculateAverageRating("Driver", String((ride as any).driver._id))
        : { averageRating: 0, totalRatings: 0 },
    ])

    res.json({
      success: true,
      data: {
        _id: ride._id,
        user: ride.user ? { ...(ride as any).user, rating: userRating } : null,
        driver: ride.driver ? { ...(ride as any).driver, rating: driverRating } : null,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        status: ride.status,
        fare: ride.fare || 0,
        estimatedTime: ride.estimatedTime,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
      },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch ride" })
  }
}
