"use client";

import type { LightExposure, ContainerIntegrity } from "@/lib/stability/types";

interface StorageConditionsProps {
  storageTemp: number;
  storageHumidity: number;
  lightExposure: LightExposure;
  containerIntegrity: ContainerIntegrity;
  notes: string;
  onStorageTempChange: (value: number) => void;
  onStorageHumidityChange: (value: number) => void;
  onLightExposureChange: (value: LightExposure) => void;
  onContainerIntegrityChange: (value: ContainerIntegrity) => void;
  onNotesChange: (value: string) => void;
}

/**
 * Section 04: Storage Conditions
 * Temperature/humidity sliders, light exposure and container integrity dropdowns.
 * Matches the slider design from the screenshots.
 */
export default function StorageConditions({
  storageTemp,
  storageHumidity,
  lightExposure,
  containerIntegrity,
  notes,
  onStorageTempChange,
  onStorageHumidityChange,
  onLightExposureChange,
  onContainerIntegrityChange,
  onNotesChange,
}: StorageConditionsProps) {
  return (
    <div className="card-section space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="section-badge">04</span>
        <h2 className="text-lg font-bold text-gray-900">Storage Conditions</h2>
      </div>

      {/* Temperature slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">Storage Temperature</label>
          <span className="text-lg font-bold text-gray-900">
            {storageTemp} °C
          </span>
        </div>
        <input
          type="range"
          min={-20}
          max={60}
          value={storageTemp}
          onChange={(e) => onStorageTempChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>-20°C (Freezer)</span>
          <span>25°C (Room)</span>
          <span>60°C (Hot)</span>
        </div>
      </div>

      {/* Humidity slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">Relative Humidity</label>
          <span className="text-lg font-bold text-gray-900">
            {storageHumidity} %
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={storageHumidity}
          onChange={(e) => onStorageHumidityChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0% (Dry)</span>
          <span>50% (Normal)</span>
          <span>100% (Saturated)</span>
        </div>
      </div>

      {/* Light exposure + Container integrity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Light Exposure</label>
          <select
            value={lightExposure}
            onChange={(e) =>
              onLightExposureChange(e.target.value as LightExposure)
            }
            className="form-select mt-1"
          >
            <option value="none">No Light / Dark Storage</option>
            <option value="indirect">Indirect Light</option>
            <option value="direct">Direct Sunlight</option>
          </select>
        </div>
        <div>
          <label className="form-label">Container Integrity</label>
          <select
            value={containerIntegrity}
            onChange={(e) =>
              onContainerIntegrityChange(
                e.target.value as ContainerIntegrity
              )
            }
            className="form-select mt-1"
          >
            <option value="sealed">Sealed / Intact</option>
            <option value="opened">Opened</option>
            <option value="damaged">Damaged / Compromised</option>
          </select>
        </div>
      </div>

      {/* Additional notes */}
      <div>
        <label className="form-label">
          Additional Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Storage location, observed changes (colour, smell, texture), patient info..."
          rows={3}
          className="form-input mt-1 resize-y"
        />
      </div>
    </div>
  );
}
