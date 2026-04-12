import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

type AiChatResponse = { response?: string; error?: string; detail?: string }

/**
 * Gemini / server-side AI assistant (public endpoint; sends Bearer if logged in).
 */
export async function sendAiChatMessage(message: string): Promise<string> {
  const data = (await apiClient.post<AiChatResponse>(API_ENDPOINTS.AI.CHAT, {
    message,
  })) as AiChatResponse
  if (data?.response != null && typeof data.response === "string") {
    return data.response
  }
  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : "AI request failed")
  }
  throw new Error("Empty response from AI")
}
