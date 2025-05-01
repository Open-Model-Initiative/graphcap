import { Button } from "@graphcap/ui/components/Button";
import { useToast } from "@graphcap/ui/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useHealth } from "../hooks/useHealth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const toast = useToast();
  const { data, error, isPending } = useHealth();
  useEffect(() => {
    if (data && !error) {
      toast.success("✅ Healthy API response");
    }
  }, [data, error, toast]);

  return (
    <div className="mt-4 space-y-4">
      <Button variant="solid" colorscheme="primary">
        Shared UI Button
      </Button>

      {isPending && <p>Loading health...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {data && (
        <div className="text-green-600">
          <p>
            Server Status: <strong>{data.status ?? "unknown"}</strong>
          </p>
          <p>Service: {data.service}</p>
          <p>Version: {data.version}</p>
          <p>Timestamp: {data.timestamp}</p>
        </div>
      )}
    </div>
  );
}
