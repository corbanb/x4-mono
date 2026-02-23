import { useState } from 'react';
import { trpc } from '@x4/shared/api-client';
import { CreateProjectSchema } from '@x4/shared/utils';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>x4 Desktop</h1>
        <button onClick={onLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </header>
      <main style={styles.main}>
        <ProjectList />
      </main>
    </div>
  );
}

function ProjectList() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = trpc.projects.list.useQuery({
    limit: 50,
    offset: 0,
  });

  return (
    <div>
      <div style={styles.listHeader}>
        <h2 style={styles.listTitle}>Projects</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.newButton}>
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && <CreateProjectForm onDone={() => setShowForm(false)} />}

      {isLoading && <p style={styles.muted}>Loading projects...</p>}
      {error && <p style={styles.error}>Failed to load projects</p>}
      {data && !data.items.length && (
        <p style={styles.muted}>No projects yet. Create one to get started.</p>
      )}
      {data?.items.map((project) => (
        <div key={project.id} style={styles.card}>
          <h3 style={styles.projectName}>{project.name}</h3>
          {project.description && <p style={styles.projectDesc}>{project.description}</p>}
        </div>
      ))}
    </div>
  );
}

function CreateProjectForm({ onDone }: { onDone: () => void }) {
  const utils = trpc.useUtils();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      onDone();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = CreateProjectSchema.safeParse({ name, description });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    createProject.mutate(result.data);
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div>
        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        {errors.name && <p style={styles.fieldError}>{errors.name}</p>}
      </div>
      <div>
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />
        {errors.description && <p style={styles.fieldError}>{errors.description}</p>}
      </div>
      <button type="submit" disabled={createProject.isPending} style={styles.submitButton}>
        {createProject.isPending ? 'Creating...' : 'Create Project'}
      </button>
      {createProject.error && <p style={styles.error}>{createProject.error.message}</p>}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
  },
  logoutButton: {
    padding: '6px 12px',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    color: '#dc2626',
  },
  main: {
    flex: 1,
    padding: 24,
    overflow: 'auto',
    backgroundColor: '#f9fafb',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  newButton: {
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    border: '1px solid #eee',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },
  projectDesc: {
    fontSize: 13,
    color: '#666',
    margin: '4px 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    border: '1px solid #eee',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  muted: {
    color: '#999',
    fontSize: 14,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 12,
    margin: '2px 0 0',
  },
};
