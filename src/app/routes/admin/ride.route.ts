import express from "express"
import { getRides, getRideById } from "../../controllers/admin/ride.controller"
// import { verifyAdmin } from "../../middleware/verifyAdmin"; // Uncomment if available

const adminRideRouter = express.Router()

// adminRideRouter.use(verifyAdmin); // enable when middleware exists

adminRideRouter.get("/", getRides)
adminRideRouter.get("/:id", getRideById)

export default adminRideRouter
