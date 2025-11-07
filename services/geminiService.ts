

import { GoogleGenAI, Type } from "@google/genai";
import { Category, DigitizedFile } from "../types";

let aiClient: GoogleGenAI | null = null;

/**
 * Initializes the Gemini AI client with a provided API key.
 * This must be called before any other service function.
 * @param apiKey The Google Gemini API key.
 */
export const initializeAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("Attempted to initialize AI client with an empty API key.");
    }
    aiClient = new GoogleGenAI({ apiKey });
};

/**
 * Retrieves the initialized AI client.
 * Throws an error if the client has not been initialized.
 * @returns The initialized GoogleGenAI client instance.
 */
export const getAiClient = () => {
    if (aiClient) {
        return aiClient;
    }
    throw new Error("Gemini AI Client has not been initialized. Please provide an API key.");
};

/**
 * A centralized error handler for Gemini API calls. It checks for common
 * authentication/permission issues and throws a more user-friendly error.
 * @param error The original error caught from the API call.
 */
const handleApiError = (error: any): never => {
    console.error("Error with Gemini API call:", error);
    const errorMessage = error.toString();
    // Check for keywords indicating an API key issue.
    if (errorMessage.includes("API key not valid") || 
        errorMessage.includes("permission denied") || 
        errorMessage.includes("API_KEY_INVALID")) {
        throw new Error("Invalid Gemini API Key. Please enter a valid key to continue.");
    }
    throw new Error(`Failed to process request with Gemini. Details: ${errorMessage}`);
}


const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const processImageAndSummarize = async (
    fileBase64: string, 
    fileType: string,
    metadataTitles: string[]
): Promise<{ 
    ocrText: string; 
    summary: string; 
    metadata: Record<string, string>;
    originalLanguage: string;
}> => {
  const ai = getAiClient();
  
  const imagePart = fileToGenerativePart(fileBase64, fileType);
  const hasMetadata = metadataTitles && metadataTitles.length > 0;

  const metadataPrompt = hasMetadata ? `4.  **Metadata Extraction:** From the extracted text, identify and extract values for the following metadata fields: ${metadataTitles.join(', ')}. If a value for a field is not found, return an empty string for it.` : '';
  
  const prompt = `
    Analyze the attached image and perform the following tasks based on its content:
    1.  **Optical Character Recognition (OCR):** Extract all text from the image accurately. Preserve the original language.
    2.  **Language Identification:** Identify the primary language of the extracted text. Return the name of the language in Greek (e.g., "Ελληνικά", "Γερμανικά", "Αγγλικά").
    3.  **Summarization:** Based on the extracted text, generate a concise summary in Greek, no longer than 3-4 sentences.
    ${metadataPrompt}

    Provide the output as a single JSON object conforming to the provided schema. Ensure all requested fields are present in the JSON.
  `;
  
  // Base schema properties
  const schemaProperties: { [key: string]: any } = {
    ocrText: {
      type: Type.STRING,
      description: "The full text extracted from the image.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise summary of the text in Greek.",
    },
    originalLanguage: {
        type: Type.STRING,
        description: "The primary language of the extracted text, written in Greek (e.g., Ελληνικά, Γερμανικά, Αγγλικά). If unknown, use 'Άγνωστη'."
    }
  };

  // Dynamically add metadata properties to the schema if they exist
  if (hasMetadata) {
    const metadataProperties = metadataTitles.reduce((acc, title) => {
        acc[title] = { type: Type.STRING, description: `The extracted value for ${title}.` };
        return acc;
    }, {} as Record<string, { type: Type, description: string }>);

    schemaProperties.metadata = {
      type: Type.OBJECT,
      description: "An object containing extracted metadata values, with keys matching the requested metadata titles.",
      properties: metadataProperties
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [imagePart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    // Ensure complex types are always initialized
    if (!result.metadata) result.metadata = {};
    if (!result.originalLanguage) result.originalLanguage = "Άγνωστη";

    return result;
  } catch (error) {
    handleApiError(error);
  }
};

export const translateText = async (text: string, targetLanguage: 'English' | 'Greek'): Promise<string> => {
    const ai = getAiClient();

    const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text. Text: """${text}"""`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        handleApiError(error);
    }
};

export const generateMetadataTitlesAI = async (pastedText: string): Promise<string[]> => {
    const ai = getAiClient();

    const prompt = `
    Based on the following sample text, identify and suggest relevant metadata titles or fields.
    For example, from an invoice, you might suggest "Invoice Number", "Date", "Total Amount", "Vendor Name".
    The output should be a JSON array of strings, where each string is a suggested metadata title in Greek.
    
    Sample Text:
    ---
    ${pastedText}
    ---
    
    Return ONLY the JSON array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    }
                }
            }
        });
        
        const jsonString = response.text;
        return JSON.parse(jsonString);

    } catch (error) {
        handleApiError(error);
    }
};

export const performSmartSearch = async (
    query: string, 
    files: DigitizedFile[]
): Promise<{ id: string; reason: string }[]> => {
    const ai = getAiClient();

    const simplifiedFiles = files.map(f => ({
        id: f.id,
        filename: f.originalFilename,
        summary: f.summary,
        ocrText: f.ocrText.substring(0, 1000), // Truncate to avoid excessive token usage
        originalLanguage: f.originalLanguage,
    }));

    const prompt = `
        You are an intelligent document search assistant.
        A user has provided the following query: "${query}"

        Search through the following list of documents and identify the ones that are most relevant to the user's query.
        Consider the filename, summary, the extracted text (ocrText), and the originalLanguage.
        
        Documents:
        ---
        ${JSON.stringify(simplifiedFiles)}
        ---

        Return a JSON array of objects. Each object must contain the 'id' of the matching document and a brief 'reason' (in Greek) explaining why it matches the query.
        Only return documents that are a strong match. If no documents match, return an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonString = response.text;
        return JSON.parse(jsonString);

    } catch (error) {
        handleApiError(error);
    }
};

export const reEvaluateLanguage = async (text: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Analyze the following text and determine its primary language. Return your answer in Greek.
    
    Text to analyze: """${text.substring(0, 2000)}"""`; // Truncate to save tokens

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        language: {
                            type: Type.STRING,
                            description: 'The name of the language in Greek (e.g., "Ελληνικά", "Γερμανικά"). If unknown, use "Άγνωστη".'
                        }
                    }
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        let language = result.language?.trim() || 'Άγνωστη';
        
        if (language.length > 0) {
            language = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
        }
        
        return language;
    } catch (error) {
        handleApiError(error);
    }
};