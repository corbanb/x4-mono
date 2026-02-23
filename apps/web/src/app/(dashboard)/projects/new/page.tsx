'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema } from '@x4/shared/utils';
import { trpc } from '@x4/shared/api-client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FormValues = { name: string; description?: string };

export default function NewProjectPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { name: '', description: '' },
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success('Project created successfully');
      utils.projects.list.invalidate();
      router.push('/projects');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function onSubmit(data: FormValues) {
    createProject.mutate(data);
  }

  const isPending = isSubmitting || createProject.isPending;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Add a new project to your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My awesome project"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description (optional)</Label>
                <span className="text-xs text-muted-foreground">{charCount}/500</span>
              </div>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                rows={4}
                {...register('description', {
                  onChange: (e) => setCharCount(e.target.value.length),
                })}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/projects')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
