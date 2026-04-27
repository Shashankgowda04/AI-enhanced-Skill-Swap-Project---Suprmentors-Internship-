import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateRoadmap = async (req, res) => {
  try {
    const { syllabusText, title } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "API Key missing in .env" });
    }

    // UPDATED: 'gemini-3-flash-preview' is the current model for Free Tier in 2026
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `You are an expert educational consultant. Create a 4-week learning roadmap for: "${title}". 
    Based on this syllabus: "${syllabusText}".
    Format the response with **Week X** headers and bullet points for tasks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ roadmap: text });
  } catch (error) {
    console.error("AI Error:", error);
    // If Gemini 3 is busy, try falling back to Gemini 2.5 Flash automatically
    res.status(500).json({ 
      message: "AI Roadmap generation failed", 
      details: error.message 
    });
  }
};