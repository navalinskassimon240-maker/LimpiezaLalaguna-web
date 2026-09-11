import React, { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const QUICK_ACTIONS = [
  "🧼 Quitar una mancha",
  "🏠 Limpiar mi casa",
  "🚗 Limpiar el auto",
  "✨ Tengo otra consulta",
];

export function LagunitaAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text:
        "¡Hola! 👋 Soy Lagunita, el asistente de Limpieza La Laguna.\n\n" +
        "Contame qué necesitás limpiar o qué mancha querés sacar y te ayudo. ✨",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  async function sendMessage(customText?: string) {
    const text = (customText ?? input).trim();
    if (!text || loading) return;

    const previousMessages = messages;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const history = previousMessages
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Error HTTP ${response.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data?.text ||
            "Uy 😕 No pude responder en este momento. Probá nuevamente.",
        },
      ]);
    } catch (error) {
      console.error("Lagunita IA:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Uy 😕 No pude conectarme en este momento. Probá de nuevo en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes lagunitaFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes lagunitaPulse {
          0% { transform: scale(1); opacity: .5; }
          100% { transform: scale(1.42); opacity: 0; }
        }

        @keyframes lagunitaOpen {
          from { opacity: 0; transform: translateY(22px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes lagunitaDot {
          0%, 80%, 100% { transform: translateY(0); opacity: .3; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .lagunita-launcher { animation: lagunitaFloat 3s ease-in-out infinite; }
        .lagunita-pulse { animation: lagunitaPulse 2s infinite; }
        .lagunita-window { animation: lagunitaOpen .24s ease-out; }
        .lagunita-dot:nth-child(1) { animation: lagunitaDot 1.2s infinite; }
        .lagunita-dot:nth-child(2) { animation: lagunitaDot 1.2s .15s infinite; }
        .lagunita-dot:nth-child(3) { animation: lagunitaDot 1.2s .30s infinite; }

        @media (max-width: 640px) {
          .lagunita-launch-wrap {
            left: 14px !important;
            bottom: 14px !important;
          }

          .lagunita-window {
            left: 12px !important;
            bottom: 12px !important;
            width: calc(100vw - 24px) !important;
            height: min(560px, calc(100vh - 24px)) !important;
          }

          .lagunita-label-sub {
            display: none !important;
          }
        }
      `}</style>

      {!open && (
        <div
          className="lagunita-launch-wrap"
          style={{ position: "fixed", left: 24, bottom: 24, zIndex: 99990 }}
        >
          <div style={{ position: "relative" }}>
            <div
              className="lagunita-pulse"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background: "#10b981",
              }}
            />

            <button
              className="lagunita-launcher"
              onClick={() => setOpen(true)}
              title="¿Necesitás ayuda con la limpieza?"
              aria-label="Abrir Lagunita IA"
              style={{
                position: "relative",
                border: 0,
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #0877ff 0%, #00a6c7 48%, #00a86b 100%)",
                color: "#fff",
                borderRadius: 999,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 800,
                boxShadow: "0 16px 36px rgba(0, 95, 180, .32)",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.18)",
                  fontSize: 19,
                }}
              >
                ✨
              </span>

              <span style={{ textAlign: "left", lineHeight: 1.1 }}>
                <span
                  className="lagunita-label-sub"
                  style={{
                    display: "block",
                    fontSize: 10,
                    opacity: .82,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  ¿Necesitás ayuda?
                </span>

                <span style={{ display: "block", fontSize: 13 }}>
                  Preguntale a Lagunita
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {open && (
        <section
          className="lagunita-window"
          aria-label="Chat de Lagunita IA"
          style={{
            position: "fixed",
            left: 24,
            bottom: 24,
            width: 390,
            maxWidth: "calc(100vw - 28px)",
            height: 540,
            maxHeight: "calc(100vh - 40px)",
            background: "#fff",
            borderRadius: 26,
            boxShadow: "0 30px 80px rgba(15,23,42,.30)",
            overflow: "hidden",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter, system-ui, Arial, sans-serif",
            border: "1px solid #e2e8f0",
          }}
        >
          <header
            style={{
              background:
                "linear-gradient(135deg,#0f172a 0%,#075985 52%,#047857 100%)",
              color: "#fff",
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,.15)",
                  fontSize: 20,
                }}
              >
                ✨
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>Lagunita IA</strong>
                  <span
                    style={{
                      fontSize: 9,
                      padding: "3px 7px",
                      borderRadius: 999,
                      background: "rgba(16,185,129,.20)",
                      color: "#6ee7b7",
                      fontWeight: 800,
                    }}
                  >
                    ● EN LÍNEA
                  </span>
                </div>

                <div style={{ fontSize: 11, opacity: .75, marginTop: 2 }}>
                  Asistente de Limpieza La Laguna
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              style={{
                width: 36,
                height: 36,
                border: 0,
                borderRadius: "50%",
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ×
            </button>
          </header>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 15,
              background: "linear-gradient(#f8fafc, #ffffff)",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "11px 14px",
                    borderRadius:
                      message.role === "user"
                        ? "18px 18px 5px 18px"
                        : "18px 18px 18px 5px",
                    background: message.role === "user" ? "#0877ff" : "#fff",
                    color: message.role === "user" ? "#fff" : "#334155",
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    border:
                      message.role === "assistant"
                        ? "1px solid #e2e8f0"
                        : "none",
                    boxShadow: "0 3px 10px rgba(15,23,42,.06)",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#64748b",
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                Lagunita está pensando
                <span style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className="lagunita-dot"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                  ))}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div
              style={{
                padding: 10,
                borderTop: "1px solid #f1f5f9",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                background: "#fff",
              }}
            >
              {QUICK_ACTIONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => sendMessage(text)}
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: 9,
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#334155",
                    textAlign: "left",
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            style={{
              padding: 11,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: 8,
              background: "#fff",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ej: ¿Cómo saco una mancha de aceite?"
              disabled={loading}
              maxLength={500}
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #e2e8f0",
                borderRadius: 15,
                padding: "11px 13px",
                outline: "none",
                fontSize: 12,
                background: "#f8fafc",
              }}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                border: 0,
                borderRadius: 14,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg,#0877ff,#10b981)",
                color: "#fff",
                fontSize: 18,
                opacity: loading || !input.trim() ? .45 : 1,
              }}
            >
              ➜
            </button>
          </form>

          <div
            style={{
              paddingBottom: 8,
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 9,
              background: "#fff",
            }}
          >
            ✨ IA de Limpieza La Laguna
          </div>
        </section>
      )}
    </>
  );
}
