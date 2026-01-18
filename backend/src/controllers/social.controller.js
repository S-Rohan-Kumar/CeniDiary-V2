import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";

const toggleFollow = asyncHandler(async (req, res) => {
  const { targtetUserId } = req.params;
  const userId = req.user?._id;

  if (targtetUserId === userId.toString()) {
    throw new APIError(400, "You cannot follow/unfollow yourself");
  }

  const targetUser = await User.findById(targtetUserId);
  if (!targetUser) {
    throw new APIError(404, "User not found");
  }

  const isFollowing = targetUser.followers?.includes(userId);

  if (isFollowing) {
    await User.findByIdAndUpdate(userId, {
      $pull: { following: targtetUserId },
    });
    await User.findByIdAndUpdate(targtetUserId, {
      $pull: { followers: userId },
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targtetUserId },
    });
    await User.findByIdAndUpdate(targtetUserId, {
      $addToSet: { followers: userId },
    });
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        null,
        isFollowing
          ? "User unfollowed successfully"
          : "User followed successfully"
      )
    );
});

const searchUsers = asyncHandler(async (req, res) => {
  const { username } = req.query;

  if (!username) {
    throw new APIError(400, "Username query parameter is required");
  }

  const users = await User.find({
    username: { $regex: username, $options: "i" },
  }).select("username avatar fullname");

  return res
    .status(200)
    .json(new APIResponse(200, users, "Users fetched successfully"));
});

const getUserStatus = asyncHandler(async (req, res) => {
  const targetId = req.params.userId || req.user?._id; 
  
  const user = await User.findById(targetId);
  if (!user) {
    throw new APIError(404, "User not found");
  }

  const stats = {
    totalReviews: user.watchNumber || 0,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    isFollowing: user.followers?.includes(req.user?._id) 
  };

  return res.status(200).json(new APIResponse(200, stats, "Stats fetched"));
});

export { toggleFollow, searchUsers, getUserStatus };
