import express from "express";
import { getUser } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/get").get(getUser);

export default router;
