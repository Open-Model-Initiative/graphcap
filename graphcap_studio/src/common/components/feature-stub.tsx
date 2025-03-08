import { AlertTriangle, Construction } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "../utils/cn"

interface FeatureStubProps {
  readonly featureName: string
  readonly description?: string
  readonly children?: ReactNode
  readonly className?: string
}

/**
 * A component to indicate that a feature is under construction
 */
export function FeatureStub({ featureName, description, children, className }: FeatureStubProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-400 bg-yellow-50 p-6 text-center dark:border-yellow-600 dark:bg-yellow-950/30",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
        <Construction className="h-6 w-6" />
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-yellow-700 dark:text-yellow-300">
        {featureName} - Under Construction
      </h3>
      {description && <p className="mb-4 max-w-md text-sm text-yellow-600 dark:text-yellow-400">{description}</p>}
      {children}
    </div>
  )
}

