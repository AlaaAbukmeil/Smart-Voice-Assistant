import { CookieOptions, NextFunction, Router } from "express";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
// import { generateSpeechWithGoogle, processWithVertexAI, transcribeWithGoogleSpeech } from "./main";
const express = require("express");

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"));
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get("/auth", async (req: any, res: Response, next: NextFunction) => {
  res.sendStatus(200);
});

router.post("/audio", upload.single("audio"), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    // let path_test = "/Users/alaaabukmeil/Desktop/csci3280/backend/uploads/audio-1742041930487-6160692.webm"
    // let transcription = await transcribeWithGoogleSpeech(req.file.path, "webm");
    // let llm = await processWithVertexAI(transcription);
    const filename = "response-" + Date.now() + ".mp3";
    const rootDir = path.resolve(__dirname, "../"); // Go up one level from dist
    const audioPath = path.join(rootDir, "audio-responses", filename);

    // let speech = await generateSpeechWithGoogle(llm, audioPath);
    const audioUrl = `/audio-responses/${filename}`;
    res.status(200).json({
      message: "Audio received successfully!",
      // file: {
      //   filename: req.file.filename,
      //   size: req.file.size,
      //   mimetype: req.file.mimetype,
      //   path: req.file.path,
      // },
      transcription: "this is testing testing testing",
      url_audio: "/audio-responses/response-1742044993856.mp3",
    });
  } catch (error) {
    console.error("Error handling audio upload:", error);
    res.status(500).json({
      error: "Failed to process audio file",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
router.use("/audio-responses", express.static(path.join(__dirname, "../audio-responses")));

export default router;
