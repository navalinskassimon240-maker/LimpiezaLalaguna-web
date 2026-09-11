import React, { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function LagunitaAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "¡Hola! 👋 Soy Lagunita ✨\n\nContame qué necesitás limpiar o qué mancha querés sacar y te ayudo.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (quickText?: string) => {
    const text = (quickText || input).trim();

    if (!text || loading) return;

    const history = messages.slice(-8);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Uy 😕 No pude responder en este momento. Probá nuevamente.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`

        @keyframes lagunita-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes lagunita-pulse {
          0% { transform: scale(1); opacity:.5; }
          100% { transform:scale(1.4); opacity:0; }
        }

        @keyframes lagunita-open {
          from {
            opacity:0;
            transform:translateY(25px) scale(.94);
          }

          to {
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }

        @keyframes lagunita-dot {
          0%,80%,100% {
            transform:translateY(0);
            opacity:.3;
          }

          40% {
            transform:translateY(-5px);
            opacity:1;
          }
        }

        .lagunita-launch {
          animation:lagunita-float 3s ease-in-out infinite;
        }

        .lagunita-pulse {
          animation:lagunita-pulse 2s infinite;
        }

        .lagunita-window {
          animation:lagunita-open .25s ease-out;
        }

        .lag-dot:nth-child(1) {
          animation:lagunita-dot 1.2s infinite;
        }

        .lag-dot:nth-child(2) {
          animation:lagunita-dot 1.2s .15s infinite;
        }

        .lag-dot:nth-child(3) {
          animation:lagunita-dot 1.2s .30s infinite;
        }

      `}</style>

      {/* BOTÓN */}
      {!open && (
        <div
          style={{
            position: "fixed",
            left: 24,
            bottom: 24,
            zIndex: 99999,
          }}
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
              className="lagunita-launch"
              onClick={() => setOpen(true)}
              style={{
                position: "relative",
                border: "none",
                cursor: "pointer",

                background:
                  "linear-gradient(135deg,#0877ff,#00a6c7,#00a86b)",

                color: "white",

                borderRadius: 999,

                padding: "13px 20px",

                display: "flex",
                alignItems: "center",
                gap: 10,

                fontWeight: 800,

                boxShadow:
                  "0 15px 35px rgba(0,90,180,.30)",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,

                  background: "rgba(255,255,255,.18)",

                  borderRadius: "50%",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  fontSize: 18,
                }}
              >
                ✨
              </span>

              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.8,
                  }}
                >
                  ¿Necesitás ayuda?
                </div>

                <div
                  style={{
                    fontSize: 13,
                  }}
                >
                  Preguntale a Lagunita
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* CHAT */}
      {open && (
        <div
          className="lagunita-window"
          style={{
            position: "fixed",

            left: 24,
            bottom: 24,

            width: 380,
            maxWidth: "calc(100vw - 28px)",

            height: 530,
            maxHeight: "calc(100vh - 40px)",

            background: "white",

            borderRadius: 26,

            boxShadow:
              "0 30px 80px rgba(15,23,42,.30)",

            overflow: "hidden",

            zIndex: 99999,

            display: "flex",
            flexDirection: "column",

            fontFamily:
              "Inter, Arial, sans-serif",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              background:
                "linear-gradient(135deg,#0f172a,#064e7a,#047857)",

              color: "white",

              padding: 16,

              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >

              <div
                style={{
                  width: 42,
                  height: 42,

                  borderRadius: 15,

                  background:
                    "rgba(255,255,255,.15)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  fontSize: 20,
                }}
              >
                ✨
              </div>

              <div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >

                  <strong>
                    Lagunita IA
                  </strong>

                  <span
                    style={{
                      fontSize: 9,

                      padding: "3px 7px",

                      borderRadius: 999,

                      background:
                        "rgba(16,185,129,.20)",

                      color: "#6ee7b7",
                    }}
                  >
                    ● EN LÍNEA
                  </span>

                </div>

                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  Asistente de Limpieza La Laguna
                </div>

              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                width: 35,
                height: 35,

                border: 0,

                borderRadius: "50%",

                background:
                  "rgba(255,255,255,.12)",

                color: "white",

                fontSize: 18,

                cursor: "pointer",
              }}
            >
              ×
            </button>

          </div>

          {/* MENSAJES */}

          <div
            style={{
              flex: 1,

              overflowY: "auto",

              padding: 15,

              background:
                "linear-gradient(#f8fafc,#fff)",
            }}
          >

            {messages.map((message, index) => (

              <div
                key={index}
                style={{
                  display: "flex",

                  justifyContent:
                    message.role === "user"
                      ? "flex-end"
                      : "flex-start",

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

                    background:
                      message.role === "user"
                        ? "#0877ff"
                        : "white",

                    color:
                      message.role === "user"
                        ? "white"
                        : "#334155",

                    fontSize: 13,

                    lineHeight: 1.55,

                    whiteSpace: "pre-wrap",

                    border:
                      message.role === "assistant"
                        ? "1px solid #e2e8f0"
                        : "none",

                    boxShadow:
                      "0 3px 10px rgba(15,23,42,.06)",
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
                  gap: 6,
                  alignItems: "center",

                  color: "#64748b",

                  fontSize: 12,

                  marginBottom: 12,
                }}
              >

                Lagunita está pensando

                <div
                  style={{
                    display: "flex",
                    gap: 3,
                  }}
                >

                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className="lag-dot"
                      style={{
                        width: 5,
                        height: 5,

                        borderRadius: "50%",

                        background: "#10b981",
                      }}
                    />
                  ))}

                </div>

              </div>

            ))}

            <div ref={bottomRef} />

          </div>

          {/* OPCIONES */}

          {messages.length === 1 && (

            <div
              style={{
                padding: 10,

                borderTop:
                  "1px solid #f1f5f9",

                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: 6,
              }}
            >

              {[
                "🧼 Quitar una mancha",
                "🏠 Limpiar mi casa",
                "🚗 Limpiar el auto",
                "🛒 Elegir un producto",
              ].map((text) => (

                <button
                  key={text}

                  onClick={() =>
                    sendMessage(text)
                  }

                  style={{
                    border:
                      "1px solid #e2e8f0",

                    background: "#f8fafc",

                    borderRadius: 12,

                    padding: 9,

                    fontSize: 11,

                    cursor: "pointer",

                    color: "#334155",
                  }}
                >
                  {text}
                </button>

              ))}

            </div>

          )}

          {/* INPUT */}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}

            style={{
              padding: 11,

              borderTop:
                "1px solid #e2e8f0",

              display: "flex",

              gap: 8,

              background: "white",
            }}
          >

            <input
              value={input}

              onChange={(e) =>
                setInput(e.target.value)
              }

              placeholder="Ej: ¿Cómo saco una mancha?"

              disabled={loading}

              maxLength={500}

              style={{
                flex: 1,

                border:
                  "1px solid #e2e8f0",

                borderRadius: 15,

                padding:
                  "11px 13px",

                outline: "none",

                fontSize: 12,

                background:
                  "#f8fafc",
              }}
            />

            <button
              type="submit"

              disabled={
                loading ||
                !input.trim()
              }

              style={{
                width: 43,
                height: 43,

                border: 0,

                borderRadius: 14,

                cursor: "pointer",

                background:
                  "linear-gradient(135deg,#0877ff,#10b981)",

                color: "white",

                fontSize: 18,

                opacity:
                  loading ||
                  !input.trim()
                    ? 0.45
                    : 1,
              }}
            >
              ➜
            </button>

          </form>

        </div>
      )}
    </>
  );
}