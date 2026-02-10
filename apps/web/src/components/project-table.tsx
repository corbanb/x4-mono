"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectActions } from "@/components/project-actions";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string | Date;
};

function statusVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const;
    case "archived":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function ProjectTable({
  projects,
  loading,
}: {
  projects: Project[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Created</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>
              <Link
                href={`/projects/${project.id}`}
                className="font-medium hover:underline"
              >
                {project.name}
              </Link>
            </TableCell>
            <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
              {project.description ?? "-"}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(project.status)}>
                {project.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {new Date(project.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <ProjectActions
                projectId={project.id}
                projectName={project.name}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
