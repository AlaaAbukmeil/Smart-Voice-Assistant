"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//jshint esversion:6
const routes_1 = __importDefault(require("./routes"));
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(cookieParser());
const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
}));
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/api/web/", routes_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () { });
