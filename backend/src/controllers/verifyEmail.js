import { APIResponse } from "../utils/api-response.js";
import {APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";

const verifyEmail = asyncHandler( async (req,res) =>  {
    const {token} = req.params;

    const user = await User.findOne({
        verifyToken : token,
        verifyTokenExpiry : { $gt : Date.now() }
    });

    if(!user){
        throw new APIError(400 , "Invalid or expired token");
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save({ validateBeforeSave : false });

    return res.status(200).json(
        new APIResponse(200 , "Email verified successfully")
    );

})

export { verifyEmail };