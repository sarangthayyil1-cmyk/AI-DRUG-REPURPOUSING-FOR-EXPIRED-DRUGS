"use client";

interface ExpiryAgeSectionProps {
  expiryDate: string;
  manufacturingDate: string;
  onExpiryDateChange: (value: string) => void;
  onManufacturingDateChange: (value: string) => void;
}

/**
 * Section 03: Expiry & Age
 * Date pickers for expiry date (required) and manufacturing date (optional).
 */
export default function ExpiryAgeSection({
  expiryDate,
  manufacturingDate,
  onExpiryDateChange,
  onManufacturingDateChange,
}: ExpiryAgeSectionProps) {
  return (
    <div className="card-section">
      <div className="flex items-center gap-3 mb-4">
        <span className="section-badge">03</span>
        <h2 className="text-lg font-bold text-gray-900">Expiry & Age</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="form-label">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            className="form-input mt-1"
          />
        </div>
        <div>
          <label className="form-label">
            Manufacturing Date{" "}
            <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={manufacturingDate}
            onChange={(e) => onManufacturingDateChange(e.target.value)}
            className="form-input mt-1"
          />
        </div>
      </div>
    </div>
  );
}
