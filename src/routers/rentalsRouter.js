import { Router } from "express";
import { deleteRentals, getRentals, postRentals, returnRentals } from "../controllers/rentalsControllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals",getRentals);

rentalsRouter.post("/rentals", postRentals);
rentalsRouter.post("/rentals/:id/return", returnRentals);

rentalsRouter.delete("/rentals/:id",deleteRentals);

export default rentalsRouter;