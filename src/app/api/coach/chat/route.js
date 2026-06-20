import { convertToModelMessages, streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { buildFitnessContext } from "@/lib/ai/context";
import { getCoachModel } from "@/lib/ai/client";
import { buildSystemPromptWithContext } from "@/lib/ai/prompts";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  const lastContent =
    typeof lastMessage?.content === "string"
      ? lastMessage.content
      : lastMessage?.parts
          ?.filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("") ?? "";

  if (!lastContent.trim()) {
    return new Response("Message cannot be empty", { status: 400 });
  }

  if (lastContent.length > MAX_MESSAGE_LENGTH) {
    return new Response("Message too long", { status: 400 });
  }

  const trimmedMessages = messages.slice(-MAX_MESSAGES);

  try {
    const contextResult = await buildFitnessContext();

    if (contextResult.error) {
      return new Response(contextResult.error, { status: 401 });
    }

    const result = streamText({
      model: getCoachModel(),
      system: buildSystemPromptWithContext(contextResult.context),
      messages: await convertToModelMessages(trimmedMessages),
    });

    return result.toUIMessageStreamResponse({ originalMessages: trimmedMessages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coach unavailable";
    return new Response(message, { status: 500 });
  }
}
