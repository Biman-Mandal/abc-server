import express from "express";
import { driverLogin } from "../controllers/driverAuth.controller";

const driverAuthRoute = express.Router();

driverAuthRoute.post("/login", driverLogin);

export default driverAuthRoute;
