// SPDX-License-Identifier: Apache-2.0
import type { Dataset } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useDatasetContext } from "../context/DatasetContext";

interface DatasetSelectorProps {
  readonly className?: string;
}

/**
 * A compact dropdown component for selecting datasets
 * 
 * When a dataset is selected, it navigates to that dataset's gallery route
 */
export function DatasetSelector({ className = "" }: DatasetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { allDatasets, selectedDataset, isLoadingList } = useDatasetContext();
  const navigate = useNavigate();

  const handleSelectDataset = useCallback((dataset: Dataset) => {
    setIsOpen(false);
    navigate({ to: "/gallery/$datasetId", params: { datasetId: dataset.name } });
  }, [navigate]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center px-4 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoadingList}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[180px]">
          {selectedDataset ? selectedDataset.name : "Select Dataset"}
        </span>
        <LuChevronDown className="w-4 h-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full min-w-[200px] mt-1 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
          <div className="py-1" role="menu">
            {allDatasets.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No datasets available</div>
            )}
            {allDatasets.map((dataset) => (
              <button
                key={dataset.name}
                className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 ${
                  selectedDataset?.name === dataset.name ? "bg-blue-600" : ""
                }`}
                onClick={() => handleSelectDataset(dataset)}
                role="menuitem"
                type="button"
              >
                {dataset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 