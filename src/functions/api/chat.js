const SYSTEM_PROMPT = `
Sos Lagunita, la asistente virtual oficial de Limpieza La Laguna.

Sos especialista en:
- limpieza doméstica
- eliminación de manchas
- ropa
- sillones
- colchones
- alfombras
- pisos
- baños
- cocina
- vidrios
- autos
- grasa
- sarro
- moho
- humedad
- olores
- cuidado de superficies
- productos de limpieza

Hablás en español argentino.

Respondés de manera amable, clara, breve y profesional.

Si alguien pregunta cómo sacar una mancha y no sabés sobre qué superficie está, preguntalo primero.

Ejemplo:
Usuario: Tengo una mancha de aceite.
Vos: ¿La mancha está en ropa, sillón, alfombra u otra superficie?

Si se trata de ropa podés preguntar si es blanca o de color y qué tipo de tela es.

Cuando ya tengas la información necesaria, explicá:

1. Qué hacer.
2. Qué producto usar.
3. Cómo aplicarlo.
4. Qué precaución tener.

SEGURIDAD:

Nunca recomendar mezclar:
- lavandina con vinagre
- lavandina con amoníaco
- lavandina con ácidos
- limpiadores químicos distintos sin conocer su composición

Si alguien pregunta por una mezcla peligrosa respondé:

⚠️ No mezcles esos productos. La combinación puede generar gases peligrosos.

Indicá ventilación y uso de guantes cuando corresponda.

Nunca inventes productos, stock ni precios de Limpieza La Laguna.

Si no conocés un precio:
"Podés consultar el precio actualizado en nuestra sección Productos o por WhatsApp."

No digas que sos Gemini.
No digas que sos Google.

Tu nombre es Lagunita.

Si preguntan algo que no tiene relación con limpieza o Limpieza La Laguna, respondé:

"Soy Lagunita ✨ y estoy especializada en consultas de limpieza. ¿Qué necesitás limpiar?"
`;

export async function onRequestPost({ request, env }) {

  try {

    const body =
      await request.json();

    const message =
      body?.message?.trim();

    if (!message) {
      return response(
        { error: "Mensaje vacío" },
        400
      );
    }

    if (!env.GEMINI_API_KEY) {
      return response(
        {
          error:
            "Falta configurar GEMINI_API_KEY",
        },
        500
      );
    }

    const history =
      Array.isArray(body.history)
        ? body.history.slice(-8)
        : [];

    const contents =
      history.map((item) => ({
        role:
          item.role === "assistant"
            ? "model"
            : "user",

        parts: [
          {
            text:
              item.text ||
              item.content ||
              "",
          },
        ],
      }));

    contents.push({
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    });

    const google =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              env.GEMINI_API_KEY,
          },

          body: JSON.stringify({

            system_instruction: {
              parts: [
                {
                  text:
                    SYSTEM_PROMPT,
                },
              ],
            },

            contents,

            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 700,
            },

          }),
        }
      );

    const data =
      await google.json();

    if (!google.ok) {

      console.error(
        "Gemini:",
        data
      );

      return response(
        {
          error:
            "Error de Gemini",
        },
        500
      );
    }

    const text =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim();

    return response({
      text:
        text ||
        "No pude responder 😕. Probá nuevamente.",
    });

  } catch (error) {

    console.error(error);

    return response(
      {
        error:
          "Error interno",
      },
      500
    );
  }
}

function response(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
}