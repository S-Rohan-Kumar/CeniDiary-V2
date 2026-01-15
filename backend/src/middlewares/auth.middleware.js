import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/async-handler.js"
import { APIError } from "../utils/api-error.js"


export const verifyJWT = asyncHandler(async (req,_,next) => {
    const token = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new APIError(401,"Unauthorized")
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user= await User.findById(decoded?._id).select("-password -refreshToken")

        if(!user){
            throw new APIError(401,"Unauthorized")
        }

        req.user = user

        next()

    } catch (error) {
        throw new APIError(401,error?.message || "Invalid Access token")
    }

})