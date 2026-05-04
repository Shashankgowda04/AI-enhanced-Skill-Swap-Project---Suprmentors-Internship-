import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Existing Roadmap Function
export const generateRoadmap = async (req, res) => {
  try {
    const { syllabusText, title } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "API Key missing in .env" });
    }

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
    res.status(500).json({ 
      message: "AI Roadmap generation failed", 
      details: error.message 
    });
  }
};

// 2. Updated: Description Enhancer Function (With Context)
export const enhanceDescription = async (req, res) => {
  try {
    // Destructuring new context fields sent from App.jsx
    const { title, category, description, syllabusText } = req.body;

    if (!description && !title) {
      return res.status(400).json({ message: "At least a title or description is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Improved prompt to prevent mismatch between AI text and tutor's syllabus
    const prompt = `You are a professional educational marketing copywriter. 
    Rewrite the course description for a skill-sharing platform called EduSwap.
    
    CONTEXT PROVIDED BY TUTOR:
    - Title: "${title || 'Untitled Course'}"
    - Category: "${category || 'General'}"
    - Syllabus Details: "${syllabusText || 'No detailed syllabus provided'}"
    - Rough Draft/Idea: "${description}"

    STRICT GUIDELINES:
    1. Stay strictly accurate to the Syllabus and Title provided. 
    2. DO NOT invent features, modules, or outcomes that are not supported by the syllabus text.
    3. Make it engaging, professional, and catchy.
    4. Focus on the value provided to the student.
    5. Keep it concise (maximum 300 characters).
    6. Return ONLY the enhanced description text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ enhancedText: text });
  } catch (error) {
    console.error("Enhancer Error:", error);
    res.status(500).json({ 
      message: "AI Enhancement failed", 
      details: error.message 
    });
  }
};