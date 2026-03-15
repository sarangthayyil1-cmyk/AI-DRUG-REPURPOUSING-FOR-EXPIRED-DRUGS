import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseDiscoveryResponse,
} from "@/lib/claude/discovery";
import type { StabilityResult } from "@/lib/stability/types";

/**
 * POST /api/discover
 * Calls the Anthropic Claude API with the user's API key to generate
 * drug discovery and repurposing suggestions based on stability analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      apiKey,
      drugName,
      smiles,
      stabilityResult,
    }: {
      apiKey: string;
      drugName: string;
      smiles: string;
      stabilityResult: StabilityResult;
    } = body;

    // Validate API key
    if (!apiKey?.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Valid Anthropic API key is required (starts with sk-ant-)" },
        { status: 400 }
      );
    }

    if (!drugName || !stabilityResult) {
      return NextResponse.json(
        { error: "Drug name and stability result are required" },
        { status: 400 }
      );
    }

    // Create Anthropic client with the user's API key
    const client = new Anthropic({ apiKey });

    // Call Claude API
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(drugName, smiles, stabilityResult),
        },
      ],
    });

    // Extract text from Claude's response
    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("");

    // Parse into structured discovery response
    const discovery = parseDiscoveryResponse(responseText);

    return NextResponse.json(discovery);
  } catch (err) {
    console.error("Discovery error:", err);

    // Handle Anthropic API errors specifically
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${err.message}` },
        { status: err.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate discovery suggestions" },
      { status: 500 }
    );
  }
}
