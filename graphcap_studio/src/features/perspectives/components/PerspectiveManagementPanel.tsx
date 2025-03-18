// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Management Panel
 * 
 * This component displays a panel for managing perspectives and modules
 */

import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { Link } from "@tanstack/react-router";
import { usePerspectiveModules } from "../hooks";

/**
 * Panel component for perspective management
 */
export function PerspectiveManagementPanel() {
  // Use the perspective modules hook to get real data
  const { modules, isLoading, error } = usePerspectiveModules();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <LoadingSpinner size="md" />
        <p className="text-sm mt-2">Loading perspectives...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col h-full p-4">
        <p className="text-sm text-red-500">Error loading perspectives:</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-2">
        <h3 className="font-semibold text-sm mb-2">Perspective Management</h3>
        
        {modules.length === 0 ? (
          <p className="text-sm text-gray-500">No perspectives found.</p>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="space-y-2">
                <Link
                  to="/perspectives/module/$moduleName"
                  params={{ moduleName: module.id }}
                  className="text-sm font-medium hover:underline"
                >
                  {module.name}
                </Link>
                
                <ul className="pl-4 space-y-1">
                  {module.perspectives.map((perspective) => {
                    // Extract perspective ID from the full name
                    const perspectiveId = perspective.name.includes("/") 
                      ? perspective.name.split("/").pop() 
                      : perspective.name;
                      
                    return (
                      <li key={perspective.name}>
                        <Link
                          to="/perspectives/module/$moduleName/perspective/$perspectiveName"
                          params={{ 
                            moduleName: module.id,
                            perspectiveName: perspectiveId
                          }}
                          className="text-xs hover:underline text-gray-700"
                        >
                          {perspective.display_name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 