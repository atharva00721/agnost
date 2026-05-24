import { tool } from "ai";
import { z } from "zod/v4";

export const calculatorTool = tool({
  description: "Evaluate a mathematical expression. Supports +, -, *, /, **, sqrt, sin, cos, abs, and parentheses.",
  inputSchema: z.object({
    expression: z.string().describe("The math expression to evaluate, e.g. '2 + 3 * 4' or 'sqrt(16)'"),
  }),
  execute: async ({ expression }) => {
    const sanitized = expression.replace(/\^/g, "**").replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)");
    const result = Function(`"use strict"; return (${sanitized})`)();
    return `${expression} = ${result}`;
  },
});

export const weatherTool = tool({
  description: "Get the current weather for a city. Returns temperature, conditions, and humidity.",
  inputSchema: z.object({
    city: z.string().describe("The city name to get weather for"),
  }),
  execute: async ({ city }) => {
    const conditions = ["sunny", "cloudy", "rainy", "partly cloudy", "stormy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 30) + 5;
    const humidity = Math.floor(Math.random() * 40) + 40;
    return `${city}: ${temp}°C, ${condition}, ${humidity}% humidity`;
  },
});

export const searchTool = tool({
  description: "Search for information on a topic. Returns a list of relevant results.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const results = [
      `Result 1: Comprehensive overview of ${query}`,
      `Result 2: Latest developments in ${query}`,
      `Result 3: Expert analysis of ${query} trends`,
    ];
    return results.join("\n");
  },
});

export const demoTools = {
  calculator: calculatorTool,
  weather: weatherTool,
  search: searchTool,
} as const;
