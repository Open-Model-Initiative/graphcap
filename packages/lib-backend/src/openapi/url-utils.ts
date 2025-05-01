// Helper to construct the full URL for serving content based on hash and filename
export function constructServeUrl(hash: string, filename: string): string {
	// Construct the URL using the base path for content serving.
	// Assuming the API is served at the root and content is under '/content'.
	// TODO: Make base URL configurable via environment variable?
	// Update: Removed /content prefix as contentRouter is mounted at /
	return `/serve/${hash}/${filename}`;
}
