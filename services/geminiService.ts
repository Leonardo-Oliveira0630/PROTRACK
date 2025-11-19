
import { GoogleGenAI } from "@google/genai";
import { Job, Sector } from "../types";

const getClient = () => {
  let apiKey = "";
  
  try {
    // Safely try to get key from Vite env
    if (import.meta && (import.meta as any).env) {
      apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY;
    }
  } catch (e) {
    console.warn("Could not access import.meta.env");
  }

  // Fallback check
  if (!apiKey) {
    // For testing purposes only, avoid checking in real keys to git
    // apiKey = "YOUR_FALLBACK_KEY";
  }

  if (!apiKey) {
    // Return null gracefully so the UI can show a specific message instead of crashing
    console.warn("API Key do Google (VITE_GOOGLE_API_KEY) não configurada.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generateProductionInsights = async (jobs: Job[], sectors: Sector[]) => {
  const client = getClient();
  if (!client) {
    return ["Configure a API Key (VITE_GOOGLE_API_KEY) para receber insights de IA."];
  }

  // Prepare data summary for the prompt
  const jobSummary = jobs.map(j => ({
    code: j.code,
    patient: j.patientName,
    type: j.prosthesisType,
    status: j.status,
    urgency: j.urgency,
    currentSector: sectors.find(s => s.id === j.currentSectorId)?.name || "Em trânsito",
    daysSinceCreation: Math.floor((Date.now() - new Date(j.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  }));

  const prompt = `
    Você é um Gerente de Produção de um Laboratório de Prótese Dentária Digital (Dental Lab) de alta tecnologia.
    Analise os dados de produção atuais:
    ${JSON.stringify(jobSummary, null, 2)}
    
    Objetivo: Otimizar o fluxo de CAD/CAM, Fresagem e Cerâmica.
    
    Retorne um JSON com a chave 'insights' contendo um array de 3 strings curtas, técnicas e acionáveis.
    Foque em: Casos atrasados (especialmente implantes/protocolos), gargalos na Fresagem ou CAD, e priorização de urgências.
    Use terminologia técnica odontológica adequada (ex: 'Gargalo no CAD', 'Priorizar caso de Zircônia', 'Atraso em Protocolo').
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return ["Não foi possível gerar insights no momento."];
    
    const data = JSON.parse(text);
    return data.insights || ["Sem insights disponíveis."];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Erro ao conectar com a IA de análise."];
  }
};
