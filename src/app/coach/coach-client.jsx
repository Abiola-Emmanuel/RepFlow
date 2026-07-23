"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { FiCheck, FiSend, FiChevronDown, FiX } from "react-icons/fi";
import AppNav from "@/components/AppNav";
import { applyGoalSuggestion, getCoachSoftSuggestions } from "@/app/actions/suggestions";
import { useThemeClasses } from "@/lib/theme";

const SUGGESTED_PROMPTS = [
  "How am I doing today?",
  "What should I focus on right now?",
  "Why is my water streak low?",
];

const SUGGEST_RE = /:::suggest\s+goal\s+(water_cl|pushups|situps|steps)\s+(\d+):::/i;

function getMessageText(message) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function stripSuggestionMarkers(text) {
  return text.replace(SUGGEST_RE, "").trim();
}

function parseSuggestion(text) {
  const match = text.match(SUGGEST_RE);
  if (!match) return null;
  return { key: match[1], proposed: Number(match[2]) };
}

function LoadingDots() {
  return (
    <span className="flex items-center gap-1.5" aria-label="Coach is typing" role="status">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 rounded-full bg-white/40"
          style={{
            animation: "dotWave 900ms ease-in-out infinite",
            animationDelay: `${dot * 140}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dotWave {
          0%,
          70%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          35% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

export default function CoachClient({ firstName }) {
  const theme = useThemeClasses();
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [softSuggestions, setSoftSuggestions] = useState([]);
  const [applyingId, setApplyingId] = useState("");
  const [applyStatus, setApplyStatus] = useState("");
  const chatContainerRef = useRef(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/coach/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, clearError } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";
  const showWelcome = messages.length === 0 && !isLoading;

  useEffect(() => {
    let mounted = true;

    async function loadSuggestions() {
      const result = await getCoachSoftSuggestions();
      if (!mounted) return;
      if (result.success) {
        setSoftSuggestions(result.suggestions ?? []);
      }
    }

    loadSuggestions();
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [messages, scrollToBottom]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    clearError();
    sendMessage({ text: input.trim() });
    setInput("");
  }

  function handleSuggestedPrompt(prompt) {
    if (isLoading) return;

    clearError();
    sendMessage({ text: prompt });
  }

  async function handleApplySuggestion(suggestion) {
    if (suggestion.type === "focus") {
      handleSuggestedPrompt(`Help me catch up on ${suggestion.label} today.`);
      setSoftSuggestions((prev) => prev.filter((item) => item.id !== suggestion.id));
      return;
    }

    setApplyingId(suggestion.id);
    setApplyStatus("");
    const result = await applyGoalSuggestion({
      key: suggestion.key,
      proposed: suggestion.proposed,
    });
    setApplyingId("");

    if (result.error) {
      setApplyStatus(result.error);
      return;
    }

    setApplyStatus(`Updated ${suggestion.label} goal to ${suggestion.proposed} ${suggestion.unit}.`);
    setSoftSuggestions((prev) => prev.filter((item) => item.id !== suggestion.id));
  }

  async function handleInlineSuggestion(parsed, messageId) {
    setApplyingId(messageId);
    setApplyStatus("");
    const result = await applyGoalSuggestion(parsed);
    setApplyingId("");

    if (result.error) {
      setApplyStatus(result.error);
      return;
    }

    setApplyStatus(`Goal updated to ${parsed.proposed}.`);
  }

  return (
    <main className={`flex flex-col ${theme.page}`}>
      <AppNav activePath="/coach" />

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b7ff00]">Coach</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal sm:text-5xl">
            Hey {firstName}.
          </h1>
          <p className={`mt-3 max-w-xl text-sm leading-6 ${theme.muted}`}>
            Ask about your goals, today&apos;s logs, or streaks. Replies use your real RepFlow data.
          </p>
        </div>

        {softSuggestions.length > 0 ? (
          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Suggested actions</p>
            {softSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex flex-col gap-3 rounded-lg border border-[#b7ff00]/25 bg-[#b7ff00]/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm leading-6 text-white/70">
                  {suggestion.type === "goal_bump"
                    ? `${suggestion.reason} (${suggestion.current} → ${suggestion.proposed} ${suggestion.unit})`
                    : suggestion.message}
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplySuggestion(suggestion)}
                    disabled={applyingId === suggestion.id}
                    className="inline-flex min-h-9 items-center gap-1 rounded-md bg-[#b7ff00] px-3 text-xs font-black text-black disabled:opacity-55"
                  >
                    <FiCheck />
                    {suggestion.type === "goal_bump" ? "Apply" : "Ask coach"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoftSuggestions((prev) => prev.filter((item) => item.id !== suggestion.id))}
                    className="grid size-9 place-items-center rounded-md border border-white/12 text-white/40"
                    aria-label="Dismiss suggestion"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {applyStatus ? <p className="mt-3 text-sm font-bold text-[#b7ff00]">{applyStatus}</p> : null}

        <div className={`relative mt-8 flex flex-1 flex-col overflow-hidden ${theme.card}`}>
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5"
            style={{ minHeight: "320px", maxHeight: "calc(100vh - 300px)" }}
            role="log"
            aria-live="polite"
            aria-label="Conversation with your coach"
          >
            {showWelcome ? (
              <div className="space-y-4">
                <p className="max-w-md text-sm leading-6 text-white/45">
                  Pick a prompt below or type your own question.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="rounded-md border border-white/12 px-3 py-2 text-left text-xs font-bold text-white/55 transition hover:border-[#b7ff00]/50 hover:text-[#b7ff00]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => {
              const rawText = getMessageText(message);
              if (!rawText) return null;

              const isUser = message.role === "user";
              const text = isUser ? rawText : stripSuggestionMarkers(rawText);
              const inlineSuggestion = !isUser ? parseSuggestion(rawText) : null;

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[88%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                    <span className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
                      {isUser ? "You" : "Coach"}
                    </span>
                    <div
                      className={
                        isUser
                          ? "rounded-lg bg-[#b7ff00] px-4 py-3 text-sm font-bold leading-6 text-black"
                          : "rounded-lg border border-white/8 bg-[#0f0f0f] px-4 py-3 text-sm leading-6 text-white/72"
                      }
                    >
                      {text}
                    </div>
                    {inlineSuggestion ? (
                      <button
                        type="button"
                        disabled={applyingId === message.id}
                        onClick={() => handleInlineSuggestion(inlineSuggestion, message.id)}
                        className="mt-1 inline-flex min-h-8 items-center gap-1 rounded-md border border-[#b7ff00]/40 bg-[#b7ff00]/10 px-3 text-xs font-black text-[#b7ff00] disabled:opacity-55"
                      >
                        <FiCheck />
                        Apply {inlineSuggestion.key} → {inlineSuggestion.proposed}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" ? (
              <div className="flex justify-start">
                <div className="flex flex-col gap-1">
                  <span className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
                    Coach
                  </span>
                  <div className="rounded-lg border border-white/8 bg-[#0f0f0f] px-4 py-3">
                    <LoadingDots />
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-red-400/25 bg-red-400/8 px-4 py-3 text-sm text-red-200">
                {error.message.includes("GROQ_API_KEY")
                  ? "Coach is not configured yet. Add your GROQ_API_KEY to .env and restart the dev server."
                  : error.message || "Something went wrong. Try again."}
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-2 font-bold underline underline-offset-2 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>

          {showScrollButton ? (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-[5.5rem] right-4 z-10 grid size-8 place-items-center rounded-md border border-white/12 bg-[#11130f] text-white/50 transition hover:border-[#b7ff00]/40 hover:text-[#b7ff00]"
              aria-label="Scroll to latest messages"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          ) : null}

          <form onSubmit={handleSubmit} className="border-t border-white/8 p-4">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder="Message your coach..."
                rows={1}
                disabled={isLoading}
                aria-label="Ask your coach a question"
                className="min-h-11 flex-1 resize-none rounded-md border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-5 text-white placeholder:text-white/30 outline-none transition focus:border-[#b7ff00]/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="grid size-11 shrink-0 place-items-center rounded-md bg-[#b7ff00] text-black transition hover:bg-[#c8ff33] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                aria-label="Send message"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
