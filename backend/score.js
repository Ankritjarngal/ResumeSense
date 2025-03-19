const { configDotenv } = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

configDotenv();
const api_key = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(api_key);

async function report(data) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const systemPrompt = `"You are an AI-powered resume scorer. Given a structured resume, evaluate it based on the following parameters and provide scores ONLY. Scores should range from 0 to 10, with 10 being the highest. The scoring should be fair but slightly lenient, allowing minor improvements to positively impact the score. Consider industry standards while ensuring candidates receive constructive scoring.

Scoring Parameters:

 How well does the resume match the given job description?
Education Score – Evaluate the educational qualifications, their relevance, and prestige.
Work Experience Score – Consider years of experience, role progression, and relevancy.
Skills Score – Assess the skills section based on quantity, quality, and relevance.
Projects & Certifications Score – Evaluate the listed projects and certifications for their impact.
Achievements & Awards Score – Consider professional recognitions and awards.
Communication & Formatting Score – Assess readability, grammar, and overall presentation.
Overall Score – A weighted average of all factors, ensuring a balanced evaluation.*
Response Format (JSON Only, No Extra Text):
make sure when evaluating the projects dont just go for the quantity but the quality too
give equal importance to the quality and quanity,
if the candidate has done a lot of projects but they are not of good quality then the score should be low
if the candidate has done few projects but they are of good quality then the score should be high
if the candidate is a fresher dont judge the experience score that harshly

json
Copy
Edit
{
    "Education Score": 7.5,
    "Work Experience Score": 6.5,
    "Skills Score": 9.0,
    "Projects & Certifications Score": 8.0,
    "Achievements & Awards Score": 5.5,
    "Communication & Formatting Score": 8.0,
    "Overall Score": 7.5
}
Ensure fairness, but allow slight score boosts where applicable. Do not include any explanations or extra text—return only JSON.


`;
        const msg = `parsed resume: ${JSON.stringify(data)}`;
        
        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "user", parts: [{ text: msg }] }
            ],
            generationConfig: { maxOutputTokens: 2048 },
        });
        
        return result.response.text();
    } catch (err) {
        console.error("Error in report generation:", err);
        return null;
    }
}
module.exports = { report };