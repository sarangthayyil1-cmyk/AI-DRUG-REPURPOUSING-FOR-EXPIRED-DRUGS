import { NextRequest, NextResponse } from "next/server";
import { calculateStability } from "@/lib/stability/algorithm";
import type { StabilityInput } from "@/lib/stability/types";

/**
 * POST /api/analyze
 * Receives drug data and storage conditions, runs the heuristic
 * stability algorithm, and returns the analysis result.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.drugName?.trim()) {
      return NextResponse.json(
        { error: "Drug name is required" },
        { status: 400 }
      );
    }
    if (!body.expiryDate) {
      return NextResponse.json(
        { error: "Expiry date is required" },
        { status: 400 }
      );
    }
    if (!body.formulation) {
      return NextResponse.json(
        { error: "Formulation type is required" },
        { status: 400 }
      );
    }

    // Build the stability input from request body
    const input: StabilityInput = {
      drugName: body.drugName,
      smiles: body.smiles || "",
      stabilityClass: body.stabilityClass || 3,
      formulation: body.formulation,
      expiryDate: body.expiryDate,
      manufacturingDate: body.manufacturingDate,
      storageTemp: body.storageTemp ?? 25,
      storageHumidity: body.storageHumidity ?? 60,
      lightExposure: body.lightExposure || "none",
      containerIntegrity: body.containerIntegrity || "sealed",
      strength: body.strength,
      manufacturer: body.manufacturer,
      notes: body.notes,
    };

    // Run the stability estimation algorithm
    const result = calculateStability(input);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
