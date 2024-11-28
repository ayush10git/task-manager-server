import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, priority, status, startTime, endTime, userId } = req.body;

  if (!title || !priority || !status || !startTime || !endTime) {
    throw new ApiError(400, "All fields are required");
  }

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const startTimeUTC = new Date(startTime).toISOString();
  const endTimeUTC = new Date(endTime).toISOString();

  const newTask = await Task.create({
    title,
    priority,
    status,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    userId,
  });

  await User.findByIdAndUpdate(
    userId,
    { $push: { tasks: newTask._id } },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newTask, "Task Created Successfully"));
});

const getTasks = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId).populate("tasks");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user.tasks, "Tasks fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { id: taskId } = req.params;
  const { title, priority, status, startTime, endTime } = req.body;

  if (!taskId) {
    throw new ApiError(400, "Task ID is required");
  }

  const startTimeUTC = new Date(startTime).toISOString();
  const endTimeUTC = new Date(endTime).toISOString();

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { title, priority, status, startTime: startTimeUTC, endTime: endTimeUTC },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new ApiError(400, "Task IDs must be provided in an array");
  }

  const deleteResult = await Task.deleteMany({ _id: { $in: taskIds } });

  if (deleteResult.deletedCount === 0) {
    throw new ApiError(404, "No tasks found to delete");
  }

  await User.updateMany(
    { tasks: { $in: taskIds } },
    { $pull: { tasks: { $in: taskIds } } }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: deleteResult.deletedCount },
        "Tasks deleted successfully"
      )
    );
});

export { createTask, getTasks, updateTask, deleteTasks };
