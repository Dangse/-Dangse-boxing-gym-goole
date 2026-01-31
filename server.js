import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects the PORT environment variable (default 8080)
const PORT = parseInt(process.env.PORT || '8080', 10);

console.log(`[System] Initializing server...`);

// JSON body parsing middleware
app.use(express.json());

// Verify dist folder exists
const distPath = path.join(__dirname, 'dist');
console.log(`[System] Serving static files from: ${distPath}`);

// Serve static files from the build directory
app.use(express.static(distPath));

// API Endpoint for Gemini
app.post('/api/generate', async (req, res) => {
    try {
        const { type, info } = req.body;
        
        // Server-side check for API Key
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("[API Error] API Key is missing.");
            return res.status(500).json({ error: "Server API Key not configured" });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const promptBase = type === 'freelancer' 
            ? "권투체육관 코치 프리랜서 위촉계약서 문구 (3.3% 공제 포함):"
            : "권투체육관 직원 표준 근로계약서 초안:";
        
        const fullPrompt = `${promptBase} ${info}\n\n조건: 마크다운 기호 없이 깔끔한 평문으로 작성해줘. 중요 조항 위주로 간결하게.`;

        console.log(`[API] Generating content for type: ${type}`);
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
        });

        const text = response.text || "생성된 내용이 없습니다.";
        res.json({ text });

    } catch (error) {
        console.error("[API Error]", error);
        res.status(500).json({ error: "Failed to generate content" });
    }
});

// Handle React routing, return all other requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            console.error("[Server Error] Failed to serve index.html:", err);
            res.status(500).send("Server Error: Application not built correctly.");
        }
    });
});

// Bind to 0.0.0.0 is CRITICAL for Cloud Run/Docker
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[System] Server is running and listening on http://0.0.0.0:${PORT}`);
});