/**
 * @license Apache-2.0
 * 
 * Hook for running workflows and tracking execution
 */

import { useMutation } from '@tanstack/react-query'
import { API_BASE_URL } from '../../../services/api'

interface RunWorkflowParams {
  jobName: string;
}

interface RunWorkflowResponse {
  run_id: string;
}

async function runWorkflow({ jobName }: RunWorkflowParams): Promise<RunWorkflowResponse> {
  const url = `${API_BASE_URL}/jobs/submit`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ job_name: jobName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to run job');
  }

  return response.json();
}

export function useRunWorkflow() {
  return useMutation<RunWorkflowResponse, Error, RunWorkflowParams>({
    mutationFn: runWorkflow,
  });
} 