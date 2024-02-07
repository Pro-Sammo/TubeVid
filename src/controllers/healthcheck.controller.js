import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json({ success: true, message: "Application is healthy" });
});

export { healthcheck };
