'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string | Date;
};

function statusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default' as const;
    case 'archived':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export function RecentProjects({ projects, loading }: { projects: Project[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No projects yet</p>
        <Link
          href="/projects/new"
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Create your first project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{project.name}</p>
            {project.description && (
              <p className="truncate text-xs text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Badge variant={statusVariant(project.status)} className="ml-4">
            {project.status}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
