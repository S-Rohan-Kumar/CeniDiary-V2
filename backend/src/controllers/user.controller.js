import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";
import { Movie } from "../models/movie.model.js";
import { Review } from "../models/review.model.js";
import { List } from "../models/list.model.js"; 
import {
  uploadOnCloudinary,
  deleteFromCloundnary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { emailverifyMailcontent, sendMail } from "../utils/mail.js";

const generateAccessTokenandRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError(404, "User not found");
  }
  try {
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (
    [fullname, username, email, password].some((feild) => feild?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new APIError(400, "User already exists");
  }

  let avatar;
  const avatarlocaPath = req.files?.avatar[0]?.path;
  if (!avatarlocaPath) {
    throw new APIError(400, "Avatar is required");
  }

  try {
    avatar = await uploadOnCloudinary(avatarlocaPath);
    console.log("Uploaded Sucessfully", avatar);
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new APIError(500, "Error uploading avatar");
  }

  try {
    const user = await User.create({
      fullname,
      username: username.toLowerCase(),
      email,
      password,
      avatar: avatar.url,
    });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = Date.now() + 3600000; // 1 hr
    await user.save({ validateBeforeSave: false });

    const verifyLink = `https://cenidiary-v2.onrender.com/api/v1/users/verify/${verifyToken}`;

    await sendMail({
      email: user.email,
      subject: "Verify your CeniDairy account",
      mailgencontent: emailverifyMailcontent(user.username, verifyLink),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    if (!createdUser) {
      throw new APIError(500, "Error creating user");
    }
    return res
      .status(201)
      .json(new APIResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("Error creating user", error);
    if (avatar) {
      await deleteFromCloundnary(avatar.public_id);
    }
    throw new APIError(
      500,
      "Somethig went wrong while registration and images were deleted",
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError(400, "Email and password are required");
  }

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new APIError(400, "All fields are required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APIError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    throw new APIError(401, "User not verified");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedUser) {
    throw new APIError(500, "Error logging in");
  }

  const options = {
    httpOnly: true,
    secure: true,    
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshToken) {
    throw new APIError(400, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new APIError(404, "Invalid refresh token");
    }

    if (incomingrefreshToken !== user?.refreshToken) {
      throw new APIError(400, "Refresh token mismatch");
    }

    const oprtions = {
      httponly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenandRefreshToken(user._id);

    if (!accessToken || !newRefreshToken) {
      throw new APIError(500, "Error generating tokens");
    }

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, oprtions)
      .cookie("refreshToken", newRefreshToken, oprtions)
      .json(
        new APIResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new APIError(
      500,
      "Somehting went wrong while refreshing access token",
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,    
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, null, "User logged out successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new APIError(400, "All fields are required");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new APIError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new APIError(401, "Old Password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new APIResponse(200, null, "Password changed successfully"));
});

const GetCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "watchHistory",
    "tmdbId",
  );
  return res
    .status(200)
    .json(new APIResponse(200, user, "Current user details"));
});

const updateProfile = asyncHandler(async (req, res) => {
  // 1. Get text fields from body
  const { fullname, username } = req.body;

  // 2. Prepare update object
  const updateData = {};
  if (fullname) updateData.fullname = fullname;
  if (username) updateData.username = username;

  // 3. Handle Avatar Upload if a file exists
  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
      throw new APIError(500, "Error while uploading avatar to Cloudinary");
    }
    updateData.avatar = avatar.url;
  }

  // 4. Validate that at least one field is being updated
  if (Object.keys(updateData).length === 0) {
    throw new APIError(400, "No fields provided for update");
  }

  // 5. Update the User
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, user, "Profile updated successfully"));
});

const addtoWatchHistory = asyncHandler(async (req, res) => {
  const { tmdbId } = req.body;
  if (!tmdbId) throw new APIError(400, "tmdbId is required");

  const movie = await Movie.findOne({ tmdbId: Number(tmdbId) });
  if (!movie)
    throw new APIError(404, "Movie not found in DB. Please sync first.");

  const user = await User.findById(req.user._id);

  const isAlreadyAdded = user.watchHistory.includes(movie._id);

  if (isAlreadyAdded) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchHistory: movie._id },
    });

    const deletedReview = await Review.findOneAndDelete({
      owner: req.user._id,
      movie: movie._id,
    });

    console.log(deletedReview ? "Review deleted" : "No review found to delete");
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: movie._id },
    });
  }
  const updatedUser = await User.findById(req.user._id).populate({
    path: "watchHistory",
    select: "tmdbId",
  });

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        updatedUser.watchHistory,
        isAlreadyAdded ? "Removed from history" : "Added to history",
      ),
    );
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password -refreshToken -email");

  if (!user) throw new APIError(404, "User not found");

  const processedUser = {
    ...user._doc,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    isFollowing: req.user ? user.followers.some(id => id.toString() === req.user._id.toString()) : false
  };

  const publicCollections = await List.find({ owner: user._id, isPublic: true }).populate("movies");
  const reviews = await Review.find({ owner: user._id }).populate("movie");

  return res.status(200).json(
    new APIResponse(200, {
      user: processedUser, // Now contains everything
      collections: publicCollections,
      reviews: reviews,
    }, "Profile fetched")
  );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
  GetCurrentUser,
  updateProfile,
  addtoWatchHistory,
};
