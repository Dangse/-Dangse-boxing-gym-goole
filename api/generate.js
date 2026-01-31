import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // Enable simple CORS if needed (Vercel usually handles same-origin fine)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, info } = req.body;
        
        // Vercel Environment Variable Check
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY is missing in Vercel Environment Variables");
            return res.status(500).json({ error: "Server Configuration Error: API Key Missing" });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const promptBase = type === 'freelancer' 
            ? "권투체육관 코치 프리랜서 위촉계약서 문구 (3.3% 공제 포함):"
            : "권투체육관 직원 표준 근로계약서 초안:";
        
        const fullPrompt = `${promptBase} ${info}\n\n조건: 마크다운 기호 없이 깔끔한 평문으로 작성해줘. 중요 조항 위주로 간결하게.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
        });

        const text = response.text || "생성된 내용이 없습니다.";
        return res.status(200).json({ text });

    } catch (error) {
        console.error("Vercel API Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}