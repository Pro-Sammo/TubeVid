import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateVideoThumbnail,
} from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  )
  .get(getAllVideos);


  router.route("/:videoId").get(getVideoById).delete(deleteVideo).patch(upload.single("thumbnail"), updateVideoThumbnail);


export default router;
