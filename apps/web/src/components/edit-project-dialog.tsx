'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@x4/shared/api-client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EditProjectDialogProps = {
  projectId: string;
  currentName: string;
  currentDescription: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProjectDialog({
  projectId,
  currentName,
  currentDescription,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? '');

  useEffect(() => {
    setName(currentName);
    setDescription(currentDescription ?? '');
  }, [currentName, currentDescription]);

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Project updated');
      utils.projects.get.invalidate({ id: projectId });
      utils.projects.list.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function handleSave() {
    updateMutation.mutate({
      id: projectId,
      name,
      description: description || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
