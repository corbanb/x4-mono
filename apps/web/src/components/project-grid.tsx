'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectActions } from '@/components/project-actions';

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

export function ProjectGrid({ projects, loading }: { projects: Project[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No projects found</p>
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="min-w-0 flex-1 pr-2">
              <CardTitle className="text-base">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </CardTitle>
              {project.description && (
                <p className="mt-1 truncate text-sm text-muted-foreground">{project.description}</p>
              )}
            </div>
            <ProjectActions projectId={project.id} projectName={project.name} />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
