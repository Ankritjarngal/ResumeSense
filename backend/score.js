const { configDotenv } = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

configDotenv();
const api_key =process.env.google_api_key;
const genAI = new GoogleGenerativeAI(api_key);

async function report(data) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const systemPrompt = `**"You are an AI-powered resume evaluator. Given a structured resume, score it objectively based on the following criteria while ensuring fairness. Scores should range from 0 to 10, with 10 being the highest.

Your evaluation should follow industry best practices while being slightly optimistic, allowing well-presented details to positively impact the score. Minor weaknesses should not drastically reduce scores unless they significantly affect job suitability.

Scoring Parameters:

    Education Score – Consider the relevance, prestige, and impact of educational qualifications.
    Work Experience Score – Evaluate role progression, impact, and relevancy. For freshers, assess internships, freelance work, or academic projects fairly without penalizing lack of full-time experience.
    Skills Score – Measure the depth, relevance, and uniqueness of skills rather than just quantity. Specialized skills should be given higher weightage.
    Projects & Certifications Score – Focus equally on quality and quantity. A few impactful projects should score higher than many irrelevant or low-impact ones.
    Achievements & Awards Score – Consider the significance and uniqueness of recognitions, not just the number of awards.
    Communication & Formatting Score – Assess readability, structure, grammar, and clarity. A well-structured resume with clear sections and professional formatting should score higher.
    Overall Score – A weighted average ensuring a balanced yet slightly encouraging evaluation.

Response Format (JSON Only, No Extra Text):

{
    "Education Score": 7.5,
    "Work Experience Score": 7.0,
    "Skills Score": 9.2,
    "Projects & Certifications Score": 8.5,
    "Achievements & Awards Score": 6.8,
    "Communication & Formatting Score": 8.3,
    "Overall Score": 8.0
}

Ensure fairness, but give reasonable score boosts where applicable. Do not include explanations or extra text—return only JSON.”**`;
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