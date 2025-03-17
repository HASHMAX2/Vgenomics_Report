import { Column } from "@tanstack/react-table";
import React, { useMemo, useState, useEffect, useRef } from "react";
import "../index.css";

interface FilterProps {
  position: { x: number; y: number } | null;
  column: Column<any, unknown>;
  onClose: () => void;
}

const Filter: React.FC<FilterProps> = ({ position, column, onClose }) => {
  const { filterVariant } = column.columnDef.meta ?? {};
  const currentFilter = (column.getFilterValue() as string[]) || [];

  const defaultOperator = filterVariant === "text" ? "contains" : "equals";
  const [operator, setOperator] = useState(defaultOperator);
  const [textInput, setTextInput] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Reset operator if filterVariant changes.
  useEffect(() => {
    setOperator(defaultOperator);
  }, [defaultOperator]);

  // Detect clicks outside and close filter UI
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close filter UI
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Pre-filtered unique values for checkbox variant
  const filterOptions = useMemo(() => {
    if (filterVariant === "text") return [];
    return Array.from(column.getFacetedUniqueValues().keys()).filter(
      (option) => option !== "" && option !== "-"
    );
  }, [column, filterVariant]);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTextInput(newValue);
    column.setFilterValue({ operator, value: newValue });
  };

  // Handle operator change
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOperator = e.target.value;
    setOperator(newOperator);
    column.setFilterValue({ operator: newOperator, value: textInput });
  };

  // Handle checkbox change
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: string
  ) => {
    let newFilter: string[];
    if (e.target.checked) {
      newFilter = [...currentFilter, option];
    } else {
      newFilter = currentFilter.filter((item) => item !== option);
    }
    column.setFilterValue(newFilter.length ? newFilter : undefined);
  };

  // Handle closing modal
  const closeModal = () => {
    column.setFilterValue(undefined);
    onClose();
  };

  if (!position) return null;

  return (
    <div
      ref={filterRef} // Add ref to detect outside clicks
      className="absolute bg-white border border-gray-300 shadow-md p-3 w-52 rounded-md z-50"
      style={{ top: position.y, left: position.x }}
    >
      {filterVariant === "checkbox" ? (
        <>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-400 text-sm rounded-md w-full px-2 py-1 mb-2 focus:outline-none"
          />
          <div className="flex flex-col gap-1 max-h-60 overflow-auto">
            {filterOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={currentFilter.includes(option)}
                  onChange={(e) => handleCheckboxChange(e, option)}
                  className="custom-checkbox appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-green-500 checked:border-green-500 focus:outline-none"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </>
      ) : filterVariant === "text" ? (
        <>
          <select
            value={operator}
            onChange={handleOperatorChange}
            className="border border-gray-400 text-sm rounded-md w-full px-2 py-1 mb-2 focus:outline-none"
          >
            <option value="contains">Contains</option>
            <option value="notContains">Not Contains</option>
            <option value="equals">Equals</option>
            <option value="startsWith">Starts With</option>
            <option value="endsWith">Ends With</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            value={textInput}
            onChange={handleTextChange}
            className="border border-gray-400 text-sm rounded-md w-full px-2 py-1 mb-2 focus:outline-none"
          />
        </>
      ) : (
        <>
          <select
            value={operator}
            onChange={handleOperatorChange}
            className="border border-gray-400 text-sm rounded-md w-full px-2 py-1 mb-2 focus:outline-none"
          >
            <option value="equals">Equals</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
          <input
            type="number"
            placeholder="Search..."
            value={textInput}
            onChange={handleTextChange}
            className="border border-gray-400 text-sm rounded-md w-full px-2 py-1 mb-2 focus:outline-none"
          />
        </>
      )}
      <button
        onClick={closeModal}
        className="mt-2 px-4 py-1 bg-blue-500 text-white text-xs rounded w-full"
      >
        Refresh
      </button>
    </div>
  );
};

export default Filter;
