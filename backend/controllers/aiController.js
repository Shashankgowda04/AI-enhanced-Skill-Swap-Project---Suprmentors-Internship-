import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateRoadmap = async (req, res) => {
  try {
    const { syllabusText, title } = req.body;
    
    // Initialize the AI with your key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert educational consultant for a skill-swap platform. 
    A user has just unlocked the course: "${title}".
    Based on this syllabus/content: "${syllabusText}", 
    generate a clear, 4-week learning roadmap to help them master this skill. 
    Format the response with week-by-week bullet points.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ roadmap: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI Roadmap generation failed" });
  }
};