
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
const { VertexAI, GenerativeModel } = require( '@google-cloud/vertexai');

const speech = require("@google-cloud/speech");

const speechClient = new speech.SpeechClient();

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const uploadsDir = path.join(__dirname, "../uploads");
const responsesDir = path.join(__dirname, "../audio-responses");

const googleTTS = new TextToSpeechClient();
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID as string,
  location: process.env.GOOGLE_LOCATION as string,
});
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
  generation_config: {
    max_output_tokens: 1024,
    temperature: 0.4,
    top_p: 0.95,
  }
});


export const processWithVertexAI = async (text: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> => {
  try {
    console.log('Processing with Google VertexAI...');

    const messages = [
      {
        role: 'user',
        parts: [{ text: 'You are a helpful voice assistant. Provide clear, concise, and friendly responses. Keep your answers relatively brief since they will be spoken aloud. Also do not add symbols in the text as your answer will be just read aloud, so only commas and periods.' }],
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text }],
      },
    ];

    const result = await generativeModel.generateContent({
      contents: messages,
    });

    const response = await result.response;
    const responseText = response.candidates[0].content.parts[0].text || '';

    return responseText;
  } catch (error) {
    console.error('Error processing with VertexAI:', error);
    throw error;
  }
};

export async function transcribeWithGoogleSpeech(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log(`Transcribing file: ${filePath}`);
    console.log(`MIME type: ${mimeType}`);

    // Read the audio file content
    const audioContent = fs.readFileSync(filePath).toString("base64");

    // Determine the encoding based on file type
    let encoding = "LINEAR16"; // Default for WAV files
    let sampleRateHertz = 16000; // Default sample rate

    if (mimeType.includes("webm")) {
      encoding = "WEBM_OPUS";
      sampleRateHertz = 48000; // Default for WEBM/OPUS
    } else if (mimeType.includes("mp4") || mimeType.includes("mpeg")) {
      encoding = "MP3";
      sampleRateHertz = 44100; // Default for MP3
    } else if (mimeType.includes("ogg")) {
      encoding = "OGG_OPUS";
      sampleRateHertz = 48000; // Default for OGG/OPUS
    }

    // Configure request
    const request = {
      audio: {
        content: audioContent,
      },
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: "en-US",
        model: "default",
        enableAutomaticPunctuation: true,
        useEnhanced: true,
      },
    };

    console.log(`Sending request to Google Speech-to-Text API with encoding: ${encoding}`);

    // Make the API request
    const [response] = await speechClient.recognize(request);

    // Extract results
    const transcription = response.results?.map((result: any) => result.alternatives?.[0]?.transcript || "").join(" ") || "";

    console.log(`Transcription completed: ${transcription.substring(0, 100)}${transcription.length > 100 ? "..." : ""}`);

    return transcription;
  } catch (error) {
    console.error("Error transcribing with Google Speech:", error);
    throw new Error(`Google Speech transcription failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export const generateSpeechWithGoogle = async (text: string, outputPath:string): Promise<string> => {
  try {
    console.log("Generating speech with Google Cloud TTS...");


    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: 0,
        speakingRate: 1.0,
        effectsProfileId: ["handset-class-device"],
      },
    };

    const [response] = await googleTTS.synthesizeSpeech(request as any);

    if (response.audioContent) {
      await fs.writeFile(outputPath, response.audioContent, "binary");
    } else {
      throw new Error("No audio content returned from Google TTS");
    }

    return outputPath;
  } catch (error) {
    console.error("Error generating speech with Google TTS:", error);
    throw error;
  }
};
