"use server";

import { generateText } from "ai";
import { buildFitnessContext } from "@/lib/ai/context";
import { getCoachModel } from "@/lib/ai/client";
import { buildSystemPromptWithContext, DAILY_INSIGHT_PROMPT } from "@/lib/ai/prompts";

export async function getDailyInsight() {
  try {
    const result = await buildFitnessContext();

    if (result.error) {
      return { error: result.error };
    }

    const { text } = await generateText({
      model: getCoachModel(),
      system: buildSystemPromptWithContext(result.context),
      prompt: DAILY_INSIGHT_PROMPT,
    });

    return { success: true, insight: text.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate insight.";
    return { error: message };
  }
}
