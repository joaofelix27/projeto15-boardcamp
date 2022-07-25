import { Router } from "express";
import categoriesRouter from "./categoriesRouter.js";
import customerRouter from "./customerRouter.js";

const router = Router();
router.use(categoriesRouter);
router.use(customerRouter)

export default router;  