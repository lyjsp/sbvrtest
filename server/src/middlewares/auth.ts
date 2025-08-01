import {NextFunction, Request, Response} from "express";
import {USER_ID_HEADER} from "../../../common/src/constants";

export const checkUserIdHeader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.headers[USER_ID_HEADER];

  // Check if the user ID header is present
  if (!userId) {
    return res.status(400).json({error: "User ID header is required."});
  }

  // Optionally, you can validate the user ID format here
  if (typeof userId !== "string" || userId.trim() === "") {
    return res.status(400).json({error: "Invalid User ID format."});
  }

  // Attach the user ID to the request object for further use
  req.user = {id: userId};
  next();
};
