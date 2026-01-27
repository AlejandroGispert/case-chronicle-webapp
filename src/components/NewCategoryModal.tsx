import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { categoryController } from "@/backend/controllers/categoryController";

interface NewCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: () => void;
}

const NewCategoryModal = ({
  open,
  onOpenChange,
  onCategoryAdded,
}: NewCategoryModalProps) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const name = (formData.get("name") as string)?.trim();
    const color = (formData.get("color") as string)?.trim() || null;

    if (!name) {
      toast({
        title: "Validation error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const category = await categoryController.createCategory({
        name,
        color: color || null,
      });
      if (category) {
        toast({
          title: "Category created",
          description: `${name} has been created.`,
        });
        form.reset();
        onOpenChange(false);
        onCategoryAdded?.();
      } else {
        toast({
          title: "Error",
          description: "Could not create category. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your communications. Name is required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Important, Follow-up, Legal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color (Hex Code)</Label>
            <Input
              id="color"
              name="color"
              type="text"
              placeholder="#3B82F6"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Enter a hex color code (e.g., #3B82F6) for visual organization
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCategoryModal;
