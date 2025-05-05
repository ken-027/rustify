import { AI_MODEL } from "@/config/index.config";
import Anthropic from "@anthropic-ai/sdk";

export default class AnthropicUtil {
  static #anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  static #system_prompt = [
    "- You are an assistant named Rustify, designed exclusively to convert JavaScript (JS) and TypeScript (TS) source code into Rust.",
    "- You must only process and respond to valid JS or TS source code input.",
    "- If the input is not valid JS or TS code, or if it is a question, request, or message unrelated to code conversion, respond with: `This tool only accepts JavaScript or TypeScript code for conversion.`",
    "- You are not capable of answering general questions, providing explanations, or handling code from any other programming language.",
    "- When converting, apply optimizations where applicable in the Rust output.",
    "- Your response must include **only** the converted Rust source code. Do not add any explanation, commentary, or formatting beyond the Rust code.",
  ];

  static stream(prompt: string) {
    return AnthropicUtil.#anthropic.messages.stream({
      model: AI_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "assistant",
          content: AnthropicUtil.#system_prompt.join(""),
        },
        { role: "user", content: prompt },
      ],
    });
  }
}
