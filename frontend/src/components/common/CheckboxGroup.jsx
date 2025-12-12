"use client";

import { Check } from "lucide-react";

export default function CheckboxGroup({
  label,
  items,
  field,
  formData,
  handleToggleAll,
  handleToggleCheckbox,
}) {
  const selected = formData[field] || [];
  const allSelected = selected.length === items.length;

  return (
    <div className="border rounded-lg p-4">
      
      {/* Header: Label + Tất cả */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{label}</span>

        <span
          className={`text-sm font-bold cursor-pointer ${
            allSelected ? "text-blue-600" : "hover:text-blue-600"
          }`}
          onClick={() => handleToggleAll(field, items)}
        >
          Tất cả
        </span>
      </div>

      {/* List items */}
      <div className="space-y-2 h-48 overflow-y-auto">
        {items.map((item) => (
          <label
            key={item._id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selected.includes(item._id)}
              onChange={() => handleToggleCheckbox(field, item._id)}
              className="w-4 h-4 text-blue-600 rounded"
            />

            <span className="text-sm">{item.name}</span>

            {selected.includes(item._id) && (
              <Check className="w-4 h-4 text-blue-600 ml-auto" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
