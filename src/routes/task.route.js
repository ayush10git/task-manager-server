import express from "express";
import {
  createTask,
  deleteTasks,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.route("/create").post(createTask);
router.route("/:id").get(getTasks).put(updateTask);
router.route("/delete").delete(deleteTasks);

export default router;
