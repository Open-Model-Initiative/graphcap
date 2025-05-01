import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@graphcap/ui/components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@graphcap/ui/components/Fields/Select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@graphcap/ui/components/Notifications/AlertDialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@graphcap/ui/components/ui/sheet";
import { useToast } from "@graphcap/ui/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Provider, ProviderInput } from "../hooks/useProviders";
import {
    useCreateProvider,
    useDeleteProvider,
    useProviders,
    useUpdateProvider,
} from "../hooks/useProviders";

export const Route = createFileRoute("/providers")({
  component: ProvidersPage,
});

function ProvidersPage() {
  const { data, isLoading } = useProviders();
  const providers: Provider[] = data ?? [];
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);

  // Handlers
  const handleCreate = () => {
    setSelectedProvider(null);
    setSheetOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setSheetOpen(true);
  };

  const handleDelete = (provider: Provider) => {
    setDeleteTarget(provider);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Providers</h2>
        <Button onClick={handleCreate}>New Provider</Button>
      </div>

      <ProvidersTable
        providers={providers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Sheet for create / edit */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedProvider ? "Edit Provider" : "New Provider"}</SheetTitle>
            <SheetDescription>
              {selectedProvider ?
                "Update the provider configuration and save your changes." :
                "Fill in the details to create a new provider."}
            </SheetDescription>
          </SheetHeader>

          <ProviderForm
            defaultValues={selectedProvider ?? undefined}
            onSuccess={() => setSheetOpen(false)}
          />

          <SheetFooter>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete provider "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <DeleteProviderButton provider={deleteTarget} onDone={() => setDeleteTarget(null)} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/***************************
 * Providers Table
 ***************************/
interface ProvidersTableProps {
  providers: Provider[];
  loading?: boolean;
  onEdit: (p: Provider) => void;
  onDelete: (p: Provider) => void;
}

function ProvidersTable({ providers, loading, onEdit, onDelete }: ProvidersTableProps) {
  if (loading) return <p>Loading...</p>;
  if (providers.length === 0) return <p>No providers found.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Environment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((prov) => (
          <TableRow key={prov.id}>
            <TableCell>{prov.name}</TableCell>
            <TableCell>{prov.kind}</TableCell>
            <TableCell>{prov.environment}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(prov)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" colorscheme="secondary" onClick={() => onDelete(prov)}>
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/***************************
 * Provider Form Component
 ***************************/
interface ProviderFormProps {
  defaultValues?: Provider;
  onSuccess: () => void;
}

function ProviderForm({ defaultValues, onSuccess }: ProviderFormProps) {
  const [form, setForm] = useState<ProviderInput>(() => {
    if (defaultValues) {
      const { id, createdAt, updatedAt, ...rest } = defaultValues;
      return { ...rest };
    }
    return {
      name: "",
      kind: "",
      environment: "cloud",
      baseUrl: "",
    } as ProviderInput;
  });

  const toast = useToast();
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleChange = (field: keyof ProviderInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (defaultValues) {
      await updateMutation.mutateAsync({ id: defaultValues.id, data: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    onSuccess();
  };

  useEffect(() => {
    if (createMutation.isSuccess) {
      toast.success("Provider created");
    }
    if (updateMutation.isSuccess) {
      toast.success("Provider updated");
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="kind" className="block text-sm font-medium">
          Kind
        </label>
        <Input
          id="kind"
          value={form.kind}
          onChange={(e) => handleChange("kind", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="baseUrl" className="block text-sm font-medium">
          Base URL
        </label>
        <Input
          id="baseUrl"
          value={form.baseUrl}
          onChange={(e) => handleChange("baseUrl", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="environment" className="block text-sm font-medium">
          Environment
        </label>
        <Select
          value={form.environment}
          onValueChange={(value) =>
            handleChange("environment", value as ProviderInput["environment"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue aria-label={form.environment}>{form.environment}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloud">cloud</SelectItem>
            <SelectItem value="local">local</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label htmlFor="apiKey" className="block text-sm font-medium">
          API Key
        </label>
        <Input
          id="apiKey"
          type="password"
          value={form.apiKey ?? ""}
          onChange={(e) => handleChange("apiKey", e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

/***************************
 * Delete Provider Button
 ***************************/
function DeleteProviderButton({ provider, onDone }: { provider: Provider | null; onDone: () => void }) {
  const deleteMutation = useDeleteProvider();
  const toast = useToast();

  const handleDelete = async () => {
    if (!provider) return;
    await deleteMutation.mutateAsync(provider.id);
    toast.success("Provider deleted");
    onDone();
  };

  return (
    <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </AlertDialogAction>
  );
} 