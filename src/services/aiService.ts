import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticResult, ShopMetrics } from "../types";
import { Language } from "../locales";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const languageNames: Record<Language, string> = {
  en: 'English',
  zh: 'Chinese',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Filipino'
};

const getLanguageName = (lang: Language) => languageNames[lang] || 'English';

export async function diagnoseShop(metrics: ShopMetrics, lang: Language = 'en'): Promise<DiagnosticResult> {
  const languageName = getLanguageName(lang);
  
  const prompt = `
    Analyze this TikTok Shop data for a Southeast Asian seller:
    - Revenue: $${metrics.revenue}
    - Orders: ${metrics.orders}
    - Visitors: ${metrics.visitors}
    - CTR: ${metrics.ctr}%
    - Conversion Rate (CR): ${metrics.cr}%
    - Negative Review Rate: ${metrics.negativeReviewRate}%

    Provide the output in ${languageName}.
    Provide a diagnostic result in JSON format including:
    1. A summary of current performance.
    2. A list of 3-4 specific optimization actions. Each action should have:
       - id: unique string
       - type: one of ['title', 'description', 'image', 'price', 'shipping']
       - severity: ['low', 'medium', 'high']
       - issue: specific problem in ${languageName}
       - suggestion: specific fix in ${languageName}
       - reason: why this matters for SE Asian users in ${languageName}
       - originalValue: a placeholder of what it currently is
       - suggestedValue: the new value
       - status: 'pending'
       - storeName: specific store name (e.g. Jakarta Fashion Hub, Manila Gadget Shop)
       - region: specific Southeast Asian region (e.g. Java, Central Thailand)
       - linkId: a mock product ID string

    Ensure some suggestions are specific to local culture (e.g., Indonesia, Malaysia, Vietnam, Thailand, Philippines).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            overallHealth: { type: Type.NUMBER },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  originalValue: { type: Type.STRING },
                  suggestedValue: { type: Type.STRING },
                  status: { type: Type.STRING },
                  storeName: { type: Type.STRING },
                  region: { type: Type.STRING },
                  linkId: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as DiagnosticResult;
  } catch (error) {
    console.error("Diagnosis error:", error);
    // Fallback data if AI fails
    return {
      summary: lang === 'zh' ? "看来有一些优化的机会。我们建议您针对当地市场优化产品展示。" : "Looks like there are some opportunities for optimization. We recommend focusing on your product presentation for local markets.",
      overallHealth: 65,
      actions: [
        {
          id: '1',
          type: 'title',
          severity: 'high',
          issue: lang === 'zh' ? '产品标题过于通用，未使用当地关键词。' : 'Product title is too generic and doesn\'t use local keywords.',
          suggestion: lang === 'zh' ? '使用印度尼西亚热门趋势词更新标题。' : 'Update title with trending Indonesian buzzwords.',
          reason: lang === 'zh' ? '东南亚用户更倾向于突出价值和紧迫感的标题。' : 'SE Asian users prefer titles that highlight value and urgency.',
          originalValue: 'Cool T-Shirt - All Sizes',
          suggestedValue: 'Kaos Keren Distro Terlaris - Nyaman & Trendy [COD]',
          status: 'pending',
          storeName: 'Jakarta Fashion Hub',
          region: 'Indonesia (Jakarta)',
          linkId: 'TK-88294'
        }
      ]
    };
  }
}

export async function askAssistant(question: string, context: string, lang: Language = 'en'): Promise<string> {
  const languageName = getLanguageName(lang);
  const prompt = `
    You are an AI Business Strategy Assistant for a TikTok Shop seller in Southeast Asia.
    Context about the shop: ${context}
    The user asks: "${question}"
    
    Provide helpful, professional, and actionable business advice in ${languageName} (the user's preferred language).
    Focus on local market nuances, trending tactics, and data-driven insights.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return result.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    return "Error connecting to AI Assistant.";
  }
}
