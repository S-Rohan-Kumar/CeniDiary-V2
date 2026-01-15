import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";
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

    const verifyLink = `http://localhost:5000/api/v1/users/verify/${verifyToken}`;

    await sendMail({
      email: user.email,
      subject: "Verify your CeniDairy account",
      mailgencontent: emailverifyMailcontent(user.username, verifyLink),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
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
      "Somethig went wrong while registration and images were deleted"
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
    "-password -refreshToken"
  );

  if (!loggedUser) {
    throw new APIError(500, "Error logging in");
  }

  const options = {
    httponly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "User logged in successfully"
      )
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
      process.env.REFRESH_TOKEN_SECRET
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
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new APIError(
      500,
      "Somehting went wrong while refreshing access token"
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
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
  return res
    .status(200)
    .json(new APIResponse(200, req.user, "Current user details"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new APIError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "Please provide the avatar");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new APIError(500, "Somethign went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new APIResponse(200, user, "User avatar updated successfully"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
  GetCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
};
