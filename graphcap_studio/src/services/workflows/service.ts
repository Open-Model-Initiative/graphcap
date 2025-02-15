/**
 * @license Apache-2.0
 * 
 * Workflow management service with React Query integration
 * 
 * @module WorkflowService
 */

import { toast } from 'sonner'
import { z } from 'zod'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query'
import { API_BASE_URL } from '../api'
import {
  Workflow,
  WorkflowListResponseSchema,
  WorkflowResponseSchema,
  CreateWorkflowInput,
  UpdateWorkflowInput
} from './types'

// Remove /api/v1 since it's already handled by the server
const WORKFLOWS_URL = `${API_BASE_URL}/workflows`

/**
 * Query keys for workflow-related queries
 */
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workflowKeys.lists(), { filters }] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
}

/**
 * Fetch workflows with optional filters
 */
async function fetchWorkflows(filters?: Record<string, unknown>): Promise<Workflow[]> {
  const searchParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null) searchParams.append(key, String(value))
    })
  }

  const url = filters ? `${WORKFLOWS_URL}?${searchParams.toString()}` : WORKFLOWS_URL
  console.info('Fetching workflows from:', url)

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Server error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`Failed to fetch workflows: ${response.statusText}`)
    }

    const rawData = await response.json()
    console.debug('Raw workflow data:', JSON.stringify(rawData, null, 2))

    try {
      // First validate the array structure
      if (!Array.isArray(rawData)) {
        console.error('Expected array of workflows, received:', typeof rawData)
        throw new Error('Invalid response format: expected array')
      }

      // Log each workflow's structure before validation
      rawData.forEach((workflow, index) => {
        console.debug(`Workflow ${index} structure:`, {
          id: workflow.id,
          name: workflow.name,
          hasNodes: Array.isArray(workflow.nodes),
          hasEdges: Array.isArray(workflow.edges),
          nodesLength: workflow.nodes?.length,
          edgesLength: workflow.edges?.length,
        })
      })

      // Attempt to parse with Zod
      const parsedData = WorkflowListResponseSchema.parse(rawData)
      console.debug('Successfully parsed workflows:', parsedData.length)
      return parsedData

    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        console.error('Zod validation errors:', {
          errors: parseError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            expected: err.expected,
            received: err.received
          }))
        })
      }
      throw parseError
    }

  } catch (error) {
    console.error('Error in fetchWorkflows:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof z.ZodError ? 'Validation Error' : 'Network/Other Error',
      url
    })
    throw error
  }
}

/**
 * Fetch a single workflow by ID
 */
async function fetchWorkflowById(id: string): Promise<Workflow> {
  const response = await fetch(`${WORKFLOWS_URL}/${id}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workflow ${id}`)
  }

  const data = await response.json()
  return WorkflowResponseSchema.parse(data)
}

/**
 * Create a new workflow
 */
async function createWorkflow(workflow: CreateWorkflowInput): Promise<Workflow> {
  const response = await fetch(WORKFLOWS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  })

  if (!response.ok) {
    throw new Error('Failed to create workflow')
  }

  const data = await response.json()
  return WorkflowResponseSchema.parse(data)
}

/**
 * Update an existing workflow
 */
async function updateWorkflow(workflow: UpdateWorkflowInput): Promise<Workflow> {
  const response = await fetch(`${WORKFLOWS_URL}/${workflow.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  })

  if (!response.ok) {
    throw new Error(`Failed to update workflow ${workflow.id}`)
  }

  const data = await response.json()
  return WorkflowResponseSchema.parse(data)
}

/**
 * Delete a workflow
 */
async function deleteWorkflow(id: string): Promise<void> {
  const response = await fetch(`${WORKFLOWS_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete workflow ${id}`)
  }
}

// React Query Hooks

/**
 * Hook to fetch workflows list
 */
export function useWorkflows(
  filters?: Record<string, unknown>,
  options?: UseQueryOptions<Workflow[]>
) {
  return useQuery({
    queryKey: workflowKeys.list(filters ?? {}),
    queryFn: () => fetchWorkflows(filters),
    ...options,
  })
}

/**
 * Hook to fetch a single workflow
 */
export function useWorkflow(id: string, options?: UseQueryOptions<Workflow>) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => fetchWorkflowById(id),
    ...options,
  })
}

/**
 * Hook to create a workflow
 */
export function useCreateWorkflow(
  options?: UseMutationOptions<Workflow, Error, CreateWorkflowInput>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      toast.success('Workflow created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`)
    },
    ...options,
  })
}

/**
 * Hook to update a workflow
 */
export function useUpdateWorkflow(
  options?: UseMutationOptions<Workflow, Error, UpdateWorkflowInput>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateWorkflow,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      toast.success('Workflow updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update workflow: ${error.message}`)
    },
    ...options,
  })
}

/**
 * Hook to delete a workflow
 */
export function useDeleteWorkflow(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() })
      queryClient.removeQueries({ queryKey: workflowKeys.detail(id) })
      toast.success('Workflow deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete workflow: ${error.message}`)
    },
    ...options,
  })
} 