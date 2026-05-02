"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import DrugIdentification from "./DrugIdentification";
import StabilityClassSelector from "./StabilityClassSelector";
import ExpiryAgeSection from "./ExpiryAgeSection";
import StorageConditions from "./StorageConditions";
import type {
  AnalysisFormState,
  WHODrug,
  FormulationType,
  StabilityClass,
  LightExposure,
  ContainerIntegrity,
} from "@/lib/stability/types";

/** Default form values */
const INITIAL_STATE: AnalysisFormState = {
  drugName: "",
  smiles: "",
  formulation: "",
  manufacturer: "",
  strength: "",
  stabilityClass: 0,
  expiryDate: "",
  manufacturingDate: "",
  storageTemp: 22,
  storageHumidity: 50,
  lightExposure: "indirect",
  containerIntegrity: "opened",
  notes: "",
};

/**
 * Main analysis form — orchestrates all section components.
 * On submit, POSTs to /api/analyze and navigates to the results page.
 */
export default function AnalysisForm() {
  const [form, setForm] = useState<AnalysisFormState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const router = useRouter();

  // Helper to update a single field
  const update = <K extends keyof AnalysisFormState>(
    key: K,
    value: AnalysisFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // When a drug is selected from autocomplete, auto-fill fields
  const handleDrugSelect = (drug: WHODrug) => {
    setForm((prev) => ({
      ...prev,
      drugName: drug.name,
      smiles: drug.smiles === "N/A" ? "" : drug.smiles,
      stabilityClass: drug.defaultStabilityClass,
      formulation: drug.commonFormulations[0] || prev.formulation,
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveWarning(null);

    // Validate required fields
    if (!form.drugName.trim()) {
      setError("Please enter a drug name.");
      return;
    }
    if (!form.expiryDate) {
      setError("Please enter an expiry date.");
      return;
    }
    if (!form.formulation) {
      setError("Please select a formulation type.");
      return;
    }

    setIsLoading(true);

    try {
      // Run stability analysis via API
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugName: form.drugName,
          smiles: form.smiles,
          stabilityClass: form.stabilityClass || 3, // Default to moderate if unknown
          formulation: form.formulation,
          expiryDate: form.expiryDate,
          manufacturingDate: form.manufacturingDate || undefined,
          storageTemp: form.storageTemp,
          storageHumidity: form.storageHumidity,
          lightExposure: form.lightExposure,
          containerIntegrity: form.containerIntegrity,
          strength: form.strength || undefined,
          manufacturer: form.manufacturer || undefined,
          notes: form.notes || undefined,
        }),
      });

      if (analyzeRes.status === 429) {
        const retryAfter = analyzeRes.headers.get("Retry-After");
        throw new Error(
          `Too many analyses. Please wait ${retryAfter ?? "a few"} seconds and try again.`
        );
      }

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed");
      }

      const result = await analyzeRes.json();

      // Persist to Supabase if user is logged in.
      // Wrapped in its own try so a save failure never blocks navigation
      // to the results page.
      let saveStatus: "saved" | "skipped" | "failed" = "skipped";
      let saveErrorMsg: string | null = null;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (session?.user) {
          const payload = {
            user_id: session.user.id,
            drug_name: form.drugName,
            smiles: form.smiles,
            input_data: {
              stabilityClass: form.stabilityClass,
              formulation: form.formulation,
              expiryDate: form.expiryDate,
              manufacturingDate: form.manufacturingDate,
              storageTemp: form.storageTemp,
              storageHumidity: form.storageHumidity,
              lightExposure: form.lightExposure,
              containerIntegrity: form.containerIntegrity,
              strength: form.strength,
              manufacturer: form.manufacturer,
              notes: form.notes,
            },
            result_data: result,
          };

          // First attempt
          let { error: insertErr } = await supabase
            .from("analyses")
            .insert(payload);

          // If the insert failed because the profiles FK had no matching row
          // (PostgreSQL error code 23503 — foreign_key_violation), try to
          // create the profile row and retry once. We now also check the
          // upsert's own error — previously a silently-failing upsert (e.g.
          // RLS denied) made it look like the retry didn't help.
          if (insertErr && (insertErr as any).code === "23503") {
            const { error: profileErr } = await supabase
              .from("profiles")
              .upsert(
                { id: session.user.id, email: session.user.email ?? null },
                { onConflict: "id" }
              );

            if (profileErr) {
              console.error(
                "Could not create missing profile row:",
                profileErr
              );
              const pcode = (profileErr as any).code
                ? ` [${(profileErr as any).code}]`
                : "";
              saveStatus = "failed";
              saveErrorMsg =
                `Could not save to history. The analyses table requires a row in profiles, ` +
                `and creating that row also failed${pcode}: ${profileErr.message}. ` +
                `Run supabase_fix_history.sql in the Supabase SQL editor to repoint the ` +
                `foreign key to auth.users.`;
              setSaveWarning(saveErrorMsg);
            } else {
              const retry = await supabase.from("analyses").insert(payload);
              insertErr = retry.error;

              if (insertErr) {
                console.error(
                  "Error saving analysis to history (after profile upsert):",
                  insertErr,
                  "payload:",
                  payload
                );
                saveStatus = "failed";
                const code = (insertErr as any).code
                  ? ` [${(insertErr as any).code}]`
                  : "";
                saveErrorMsg = `Could not save to history${code}: ${insertErr.message}`;
                setSaveWarning(saveErrorMsg);
              } else {
                saveStatus = "saved";
              }
            }
          } else if (insertErr) {
            console.error(
              "Error saving analysis to history:",
              insertErr,
              "payload:",
              payload
            );
            saveStatus = "failed";
            const code = (insertErr as any).code
              ? ` [${(insertErr as any).code}]`
              : "";
            saveErrorMsg = `Could not save to history${code}: ${insertErr.message}`;
            setSaveWarning(saveErrorMsg);
          } else {
            saveStatus = "saved";
          }
        }
      } catch (saveErr) {
        console.error("Unexpected error while saving to history:", saveErr);
        saveStatus = "failed";
        saveErrorMsg =
          saveErr instanceof Error
            ? `Could not save to history: ${saveErr.message}`
            : "Could not save to history (unknown error).";
        setSaveWarning(saveErrorMsg);
      }

      // Store result + form data in sessionStorage for the results page.
      // saveStatus / saveWarning are passed along so the results page can
      // display whether the analysis was saved to history.
      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify({
          result,
          formData: {
            drugName: form.drugName,
            smiles: form.smiles,
            formulation: form.formulation,
            stabilityClass: form.stabilityClass || 3,
          },
          saveStatus,
          saveWarning: saveErrorMsg,
        })
      );

      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Key input - Removed for security as it is now handled via .env.local */}
      {/* 
      <ApiKeyInput
        value={form.apiKey}
        onChange={(v) => update("apiKey", v)}
      /> 
      */}

      {/* Page title */}
      <div className="px-1">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Drug Stability
          <br />
          <span className="text-brand">Analysis System</span>
        </h1>
        <p className="mt-3 text-gray-500 max-w-xl leading-relaxed">
          Enter drug details and storage conditions to model residual
          bioactivity and receive AI-powered pharmacological insights.
        </p>
      </div>

      {/* Section 01: Drug Identification */}
      <DrugIdentification
        drugName={form.drugName}
        smiles={form.smiles}
        formulation={form.formulation}
        manufacturer={form.manufacturer}
        strength={form.strength}
        onDrugNameChange={(v) => update("drugName", v)}
        onDrugSelect={handleDrugSelect}
        onSmilesChange={(v) => update("smiles", v)}
        onFormulationChange={(v) => update("formulation", v as FormulationType | "")}
        onManufacturerChange={(v) => update("manufacturer", v)}
        onStrengthChange={(v) => update("strength", v)}
      />

      {/* Section 02: Stability Class */}
      <StabilityClassSelector
        value={form.stabilityClass}
        onChange={(v) => update("stabilityClass", v as StabilityClass | 0)}
      />

      {/* Section 03: Expiry & Age */}
      <ExpiryAgeSection
        expiryDate={form.expiryDate}
        manufacturingDate={form.manufacturingDate}
        onExpiryDateChange={(v) => update("expiryDate", v)}
        onManufacturingDateChange={(v) => update("manufacturingDate", v)}
      />

      {/* Section 04: Storage Conditions */}
      <StorageConditions
        storageTemp={form.storageTemp}
        storageHumidity={form.storageHumidity}
        lightExposure={form.lightExposure}
        containerIntegrity={form.containerIntegrity}
        notes={form.notes}
        onStorageTempChange={(v) => update("storageTemp", v)}
        onStorageHumidityChange={(v) => update("storageHumidity", v)}
        onLightExposureChange={(v) => update("lightExposure", v as LightExposure)}
        onContainerIntegrityChange={(v) =>
          update("containerIntegrity", v as ContainerIntegrity)
        }
        onNotesChange={(v) => update("notes", v)}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Non-blocking save warning */}
      {saveWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
          {saveWarning}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FlaskConical className="w-5 h-5" />
            Run Stability Analysis
          </>
        )}
      </button>
    </form>
  );
}
