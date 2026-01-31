export const generateContractContent = async (
    type: 'freelancer' | 'labor',
    info: string
): Promise<string> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, info }),
        });

        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            } else {
                // If server returns HTML (e.g. 404 Not Found from Vite without proxy, or 502 Bad Gateway)
                const text = await response.text();
                console.error("Non-JSON Error Response:", text.slice(0, 200)); // Log first 200 chars
                throw new Error(`API 연결 오류 (${response.status}): 서버가 응답하지 않거나 올바르지 않습니다.`);
            }
        }

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data.text;
        } else {
            throw new Error("서버에서 유효하지 않은 데이터 형식을 반환했습니다.");
        }

    } catch (error: any) {
        console.error("Contract Generation Error:", error);
        throw new Error(error.message || "알 수 없는 오류가 발생했습니다.");
    }
};