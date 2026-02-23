const NEON_API_BASE = 'https://console.neon.tech/api/v2';

interface NeonProject {
  id: string;
  name: string;
  region_id: string;
}

interface NeonConnectionUri {
  connection_uri: string;
}

interface CreateProjectResponse {
  project: NeonProject;
  connection_uris: NeonConnectionUri[];
}

export async function createNeonProject(
  apiKey: string,
  projectName: string,
): Promise<{ connectionString: string; region: string }> {
  const res = await fetch(`${NEON_API_BASE}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: { name: projectName },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Neon API error (${res.status}): ${body}`);
  }

  const data = (await res.json()) as CreateProjectResponse;
  const connectionString = data.connection_uris[0]?.connection_uri;

  if (!connectionString) {
    throw new Error('Neon project created but no connection string returned.');
  }

  return {
    connectionString,
    region: data.project.region_id,
  };
}
