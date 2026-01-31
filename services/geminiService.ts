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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Server error");
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Contract Generation Error:", error);
        throw error;
    }
};