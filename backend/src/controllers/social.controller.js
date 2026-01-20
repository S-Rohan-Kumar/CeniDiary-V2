import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";

const toggleFollow = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params; // Fixed typo from 'targtetUserId'
  const userId = req.user?._id;

  if (targetUserId === userId.toString()) {
    throw new APIError(400, "You cannot follow/unfollow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new APIError(404, "User not found");
  }

  const isFollowing = targetUser.followers.some(
    (followerId) => followerId.toString() === userId.toString()
  );

  if (isFollowing) {
    await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });
  } else {
    await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } });
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } });
  }

  return res.status(200).json(
    new APIResponse(
      200,
      { isFollowing: !isFollowing },
      isFollowing ? "Unfollowed successfully" : "Followed successfully"
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
