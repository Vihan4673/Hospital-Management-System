import express, {NextFunction} from "express";
import {APIError} from "../errors/APIError";
import jwt, {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";

    export const authenticateToken = (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        console.log("token awoo")
        const authHeader =  req.headers["authorization"]
        console.log("auth header", authHeader);
        const token = authHeader && authHeader.split(" ")[1]
        console.log("token backend:", token)
        if(!token){
            throw new APIError(401, "Access token not found")
        }

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!,
            (err:any, decoded: any) => {
                if (err){
                    console.log("err", err)
                    if (err instanceof TokenExpiredError) {
                        return next(new APIError(403, "Access token Expire"))
                    }
                    if(err instanceof JsonWebTokenError){
                        return next(new APIError(403, "Invalid access token"))
                    }else{
                        return next(new APIError(403, "Error verifying access token"))
                    }
                }



                if (!decoded || typeof decoded === "string"){
                        throw new APIError(500, "Access token payload error")
                }
                next()

            }
        )
    }catch(err) {
        console.log(err)
        next(err)
    }
}