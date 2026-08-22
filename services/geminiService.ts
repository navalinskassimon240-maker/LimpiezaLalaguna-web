
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export const getCleaningAdvice = async (history: ChatMessage[], prompt: string) => {
  try {
    // Fixed: Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: "Hola" }] },
        { role: 'model', parts: [{ text: "¡Hola! Soy la IA de LimpiezaLalaguna 🧼✨. ¿En qué puedo ayudarte?" }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `Eres la IA de LimpiezaLalaguna 🧼✨. 

REGLAS:
1. Eres experto en fórmulas químicas de limpieza y desinfección.
2. Usa un tono de Torreón, Coahuila (Lagunero), amable y profesional.
3. No uses asteriscos ni formato markdown complejo. Solo texto limpio.
4. Si preguntan por precios, diles que revisen el catálogo o que pregunten aquí mismo.
5. El creador del negocio se llama Simón. El alias para pagos es simon.navalinskas.mp.`,
      },
    });

    const result = await chat;
    // Fixed: Access the .text property directly on the response object
    let responseText = result.text || "¡Hola! ¿Cómo puedo ayudarte hoy con tu limpieza? 😊🧼";
    responseText = responseText.replace(/[*#_~`">]/g, '').replace(/"/g, '').replace(/'/g, '');
    
    return responseText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "¡Hola! Hubo un pequeño error de conexión, pero ya estoy aquí para ayudarte 😊🧼";
  }
};
