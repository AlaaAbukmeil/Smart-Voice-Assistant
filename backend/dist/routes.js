"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/auth", async (req, res, next) => {
    res.sendStatus(200);
});
exports.default = router;
