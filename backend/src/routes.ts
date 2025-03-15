import { CookieOptions, NextFunction, Router } from "express";
import { Request, Response } from "express";
const router = Router();

router.get("/auth", async (req: any, res: Response, next: NextFunction) => {
  
    res.sendStatus(200);
  }
);


export default router;