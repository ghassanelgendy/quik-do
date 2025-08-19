import { useState } from 'react';
import { Plus, Edit, Trash2, Tags, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CustomTag, PredefinedTag } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';

interface TagManagerProps {
  customTags: CustomTag[];
  onAddCustomTag: (tag: Omit<CustomTag, 'id' | 'createdAt'>) => void;
  onUpdateCustomTag: (id: string, updates: Partial<CustomTag>) => void;
  onDeleteCustomTag: (id: string) => void;
}

const PREDEFINED_TAGS: { name: PredefinedTag; color: string }[] = [
  { name: 'work', color: 'bg-tag-work text-white' },
  { name: 'personal', color: 'bg-tag-personal text-white' },
  { name: 'urgent', color: 'bg-tag-urgent text-white' },
  { name: 'health', color: 'bg-tag-health text-white' },
  { name: 'shopping', color: 'bg-tag-shopping text-white' },
  { name: 'learning', color: 'bg-tag-learning text-white' },
];

const CUSTOM_TAG_COLORS = [
  { name: 'Blue', class: 'bg-tag-custom-1 text-white' },
  { name: 'Purple', class: 'bg-tag-custom-2 text-white' },
  { name: 'Orange', class: 'bg-tag-custom-3 text-white' },
  { name: 'Green', class: 'bg-tag-custom-4 text-white' },
  { name: 'Yellow', class: 'bg-tag-custom-5 text-white' },
  { name: 'Pink', class: 'bg-tag-custom-6 text-white' },
];

export const TagManager = ({ 
  customTags, 
  onAddCustomTag, 
  onUpdateCustomTag, 
  onDeleteCustomTag 
}: TagManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CustomTag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CUSTOM_TAG_COLORS[0].class);
  const { toast } = useToast();

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    // Check if tag name already exists
    const tagExists = customTags.some(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    ) || PREDEFINED_TAGS.some(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (tagExists) {
      toast({
        title: "Tag already exists",
        description: "Please choose a different name for your tag.",
        variant: "destructive",
      });
      return;
    }

    onAddCustomTag({
      name: newTagName.trim(),
      color: selectedColor,
    });

    toast({
      title: "Tag created!",
      description: `"${newTagName.trim()}" tag has been added.`,
    });

    setNewTagName('');
    setSelectedColor(CUSTOM_TAG_COLORS[0].class);
  };

  const handleUpdateTag = () => {
    if (!editingTag || !newTagName.trim()) return;

    onUpdateCustomTag(editingTag.id, {
      name: newTagName.trim(),
      color: selectedColor,
    });

    toast({
      title: "Tag updated!",
      description: `Tag has been updated successfully.`,
    });

    setEditingTag(null);
    setNewTagName('');
    setSelectedColor(CUSTOM_TAG_COLORS[0].class);
  };

  const handleDeleteTag = (tag: CustomTag) => {
    onDeleteCustomTag(tag.id);
    toast({
      title: "Tag deleted",
      description: `"${tag.name}" tag has been removed.`,
      variant: "destructive",
    });
  };

  const startEditing = (tag: CustomTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor(CUSTOM_TAG_COLORS[0].class);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Tags className="h-4 w-4" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Tag Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <Badge
                    key={tag.name}
                    className={`${tag.color} capitalize`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These are the built-in tags available by default.
              </p>
            </CardContent>
          </Card>

          {/* Custom Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create/Edit Form */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium">
                  {editingTag ? 'Edit Tag' : 'Create New Tag'}
                </Label>
                
                <div className="space-y-3">
                  <Input
                    placeholder="Tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    maxLength={20}
                  />
                  
                  {/* Color Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {CUSTOM_TAG_COLORS.map((color) => (
                        <button
                          key={color.class}
                          type="button"
                          className={`
                            w-8 h-8 rounded-full border-2 transition-smooth
                            ${color.class}
                            ${selectedColor === color.class 
                              ? 'border-foreground ring-2 ring-primary/20' 
                              : 'border-border hover:border-foreground'
                            }
                          `}
                          onClick={() => setSelectedColor(color.class)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {newTagName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Preview:</span>
                      <Badge className={selectedColor}>
                        {newTagName}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {editingTag ? (
                      <>
                        <Button 
                          onClick={handleUpdateTag} 
                          size="sm"
                          disabled={!newTagName.trim()}
                        >
                          Update Tag
                        </Button>
                        <Button 
                          onClick={cancelEditing} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleCreateTag} 
                        size="sm"
                        disabled={!newTagName.trim()}
                        className="gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Create Tag
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Existing Custom Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Your Custom Tags</Label>
                {customTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No custom tags yet. Create your first custom tag above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={tag.color}>
                            {tag.name}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created on {tag.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(tag)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTag(tag)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
