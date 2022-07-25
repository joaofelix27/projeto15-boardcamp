import { Router } from "express";
import {
  getCustomer,
  getCustomerById,
  postCustomer,
  putCustomer,
} from "../controllers/customerControllers.js";

const customerRouter = Router();

customerRouter.get("/customers", getCustomer);

customerRouter.post("/customers", postCustomer);
customerRouter.get("/customers/:id", getCustomerById);

customerRouter.put("/customers/:id", putCustomer);

export default customerRouter;
