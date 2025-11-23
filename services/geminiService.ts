import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const summarizeSymptoms = async (symptoms: string, patientData: string): Promise<string> => {
  const ai = getClient();
  // Fallback if no API key is present
  if (!ai) {
      console.warn("API Key missing. Returning mock summary.");
      return "⚠️ Resumo Simulado: Paciente relata sintomas compatíveis com quadro viral agudo. Recomenda-se aferição de temperatura e exame físico detalhado.";
  }

  try {
    const prompt = `
      Atue como um assistente médico sênior realizando triagem.
      
      DADOS DO PACIENTE:
      ${patientData}
      
      RELATO DO PACIENTE:
      "${symptoms}"
      
      TAREFA:
      Gere um resumo clínico técnico, direto e conciso (máximo 3 linhas) para o médico ler antes de iniciar a videoconsulta.
      Classifique a urgência (BAIXA, MÉDIA, ALTA) no início.
      Liste as principais queixas em terminologia médica.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao processar sintomas com IA. Verifique a conexão.";
  }
};