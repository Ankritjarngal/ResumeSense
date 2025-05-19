const { configDotenv } = require("dotenv");
const { OpenAI } = require("openai");

configDotenv();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY ,
  baseURL: "https://openrouter.ai/api/v1",
});

async function report(data) {
  try {
    const systemPrompt = `You are an AI-powered resume evaluator. Given a structured resume, score it objectively based on the following criteria while ensuring fairness. Scores should range from 0 to 10, with 10 being the highest.

Your evaluation should follow industry best practices while being slightly optimistic, allowing well-presented details to positively impact the score. Minor weaknesses should not drastically reduce scores unless they significantly affect job suitability.

Scoring Parameters:

    Education Score – Consider the relevance, prestige, and impact of educational qualifications.

    Work Experience Score – Evaluate role progression, impact, and relevancy. For freshers, assess internships, freelance work, or academic projects fairly without penalizing lack of full-time experience.

    Skills Score – Measure the depth, relevance, and uniqueness of skills rather than just quantity. Specialized skills should be given higher weightage.

    Projects & Certifications Score – Focus equally on quality and quantity. A few impactful projects should score higher than many irrelevant or low-impact ones.

    Achievements & Awards Score – Consider the significance and uniqueness of recognitions, not just the number of awards.

    Communication & Formatting Score – Assess readability, structure, grammar, and clarity. A well-structured resume with clear sections and professional formatting should score higher.

    Overall Score – A weighted average ensuring a balanced yet slightly encouraging evaluation.

Skills Extraction Instructions:

From the resume content, extract 5-6 of the most important technical or domain-specific skills that broadly represent the candidate’s expertise. These skills will be used as keywords for internship recommendations (e.g., on Internshala). Include both general technologies (e.g., React, Node.js, SQL) and niche/specialized ones (e.g., WebRTC, MongoDB Atlas, Tailwind CSS) if present.

    Prioritize skills that are repeatedly mentioned in education, experience, and projects.

    Avoid generic soft skills (e.g., “teamwork,” “communication”).

    Do not include tools/platforms unless they are core to the candidate’s work (e.g., Firebase, AWS, Figma if used heavily).

    Ensure all selected skills are relevant and distinct.

Response Format (JSON Only, No Extra Text):

{
  "score": {
    "Education Score": 7.5,
    "Work Experience Score": 7.0,
    "Skills Score": 9.2,
    "Projects & Certifications Score": 8.5,
    "Achievements & Awards Score": 6.8,
    "Communication & Formatting Score": 8.3,
    "Overall Score": 8.0
  },
  "mainskills": "nextjs reactjs nodejs"
}
`;

    const msg = `Parsed resume: ${JSON.stringify(data)}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "deepseek/deepseek-prover-v2:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: msg }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = chatCompletion.choices[0].message.content;

    // Try to extract JSON block from response
    const jsonMatch = content.match(/```json([\s\S]*?)```/);
    let jsonString = "";

    if (jsonMatch) {
      jsonString = jsonMatch[1].trim(); // Inside ```json ```
    } else {
      const altMatch = content.match(/{[\s\S]*}/);
      if (altMatch) {
        jsonString = altMatch[0];
      } else {
        console.error("No valid JSON found in response.");
        return null;
      }
    }

    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (err) {
      console.error("Error parsing score JSON:", err);
      console.log("Original string:", jsonString);
      return null;
    }
  } catch (err) {
    console.error("Error in report generation:", err);
    return null;
  }
}

module.exports = { report };
