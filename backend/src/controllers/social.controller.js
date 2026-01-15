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

  const users = await Userfind({
    username: { $regex: username, $options: "i" },
  }).select("username avatar fullname");

  return res
    .status(200)
    .json(new APIResponse(200, users, "Users fetched successfully"));
});

const getUserStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError(404, "User not found");
  }

  const stats = {
    totalWatched: user.watchHistory.length,
    totalReviews: user.watchNumber,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    badgesCount: user.badges.length,
    favoritesCount: user.favorites.length,
  };

  return res
    .status(200)
    .json(new APIResponse(200, stats, "User stats fetched successfully"));
});

export { toggleFollow, searchUsers, getUserStatus };
