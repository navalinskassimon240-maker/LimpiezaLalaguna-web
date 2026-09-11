const SYSTEM_PROMPT = `
Sos Lagunita, la asistente virtual oficial de Limpieza La Laguna.

Sos especialista en limpieza doméstica y comercial, eliminación de manchas,
cuidado de ropa y superficies, baños, cocinas, vidrios, pisos, sillones,
colchones, alfombras, autos, grasa, sarro, moho, humedad y olores.

Hablás siempre en español argentino, con un tono amable, cercano, claro,
profesional y breve.

Tu objetivo es ayudar a resolver consultas de limpieza de forma segura.

REGLAS:
- Si falta información importante, preguntá antes de recomendar.
- Para manchas, verificá cuando sea necesario: superficie/material, color,
  antigüedad y tipo de suciedad.
- Cuando ya tengas suficiente información, explicá en pasos cortos:
  1. Qué hacer.
  2. Qué producto usar.
  3. Cómo aplicarlo.
  4. Qué precaución tener.
- No inventes productos, stock, precios ni promociones de Limpieza La Laguna.
- Si no conocés un precio o disponibilidad, decí:
  "Podés consultar el precio actualizado en nuestra sección Productos o por WhatsApp."

SEGURIDAD QUÍMICA:
- Nunca recomiendes mezclar lavandina/cloro con vinagre.
- Nunca recomiendes mezclar lavandina/cloro con amoníaco.
- Nunca recomiendes mezclar lavandina/cloro con ácidos.
- Nunca recomiendes mezclar distintos limpiadores químicos sin conocer su composición.
- Si alguien propone una mezcla peligrosa, respondé claramente:
  "⚠️ No mezcles esos productos. La combinación puede generar gases peligrosos."
- Recomendá ventilación, guantes y una prueba previa en una zona poco visible
  cuando corresponda.
- Para mármol, piedra natural, madera, cuero y telas delicadas, advertí que
  algunos productos pueden dañar la superficie.
- Ante inhalación, ingestión o contacto importante con productos químicos,
  indicá alejarse de la exposición y buscar asistencia médica/toxicológica.

No digas que sos Google ni Gemini.
Tu nombre es Lagunita.

Si preguntan algo totalmente ajeno a limpieza o a Limpieza La Laguna, respondé:
"Soy Lagunita ✨ y estoy especializada en consultas de limpieza. ¿Qué necesitás limpiar?"
`;

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) {
      return json(
        { error: "Falta configurar GEMINI_API_KEY en Cloudflare." },
        500
      );
    }

    const body = await request.json();

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return json({ error: "El mensaje está vacío." }, 400);
    }

    if (message.length > 500) {
      return json({ error: "El mensaje es demasiado largo." }, 400);
    }

    const history = Array.isArray(body?.history)
      ? body.history.slice(-8)
      : [];

    const contents = history
      .filter((item) => item && typeof item.text === "string")
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.text.slice(0, 1500) }],
      }));

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const googleResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Error Gemini:", JSON.stringify(data));
      return json(
        {
          error:
            data?.error?.message ||
            "Gemini no pudo responder en este momento.",
        },
        googleResponse.status || 500
      );
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim();

    if (!text) {
      return json({
        text: "No pude generar una respuesta en este momento 😕. Probá nuevamente.",
      });
    }

    return json({ text });
  } catch (error) {
    console.error("Error Lagunita:", error);
    return json({ error: "Error interno de Lagunita." }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
