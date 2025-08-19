import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterState, Tag, CustomTag, PredefinedTag } from '@/types/todo';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  customTags: CustomTag[];
}

const getTagColor = (tag: Tag, customTags: CustomTag[]): string => {
  // Check if it's a predefined tag
  const TAG_COLORS: Record<PredefinedTag, string> = {
    work: 'bg-tag-work text-white',
    personal: 'bg-tag-personal text-white',
    urgent: 'bg-tag-urgent text-white',
    health: 'bg-tag-health text-white',
    shopping: 'bg-tag-shopping text-white',
    learning: 'bg-tag-learning text-white',
  };

  if (tag in TAG_COLORS) {
    return TAG_COLORS[tag as PredefinedTag];
  }

  // Check if it's a custom tag
  const customTag = customTags.find(ct => ct.name === tag);
  return customTag ? customTag.color : 'bg-secondary text-secondary-foreground';
};

const PREDEFINED_TAGS: PredefinedTag[] = ['work', 'personal', 'urgent', 'health', 'shopping', 'learning'];

export const FilterBar = ({ filters, onFiltersChange, customTags }: FilterBarProps) => {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTag = (tag: Tag) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    updateFilters({ selectedTags: newTags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      showCompleted: true,
      showOverdue: false,
      selectedTags: [],
    });
  };

  const hasActiveFilters = filters.search || !filters.showCompleted || filters.showOverdue || filters.selectedTags.length > 0;

  const availableTags = [
    ...PREDEFINED_TAGS,
    ...customTags.map(ct => ct.name)
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Status Filters */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-completed"
                      checked={filters.showCompleted}
                      onCheckedChange={(checked) => updateFilters({ showCompleted: !!checked })}
                    />
                    <label htmlFor="show-completed" className="text-sm">Show completed</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-overdue"
                      checked={filters.showOverdue}
                      onCheckedChange={(checked) => updateFilters({ showOverdue: !!checked })}
                    />
                    <label htmlFor="show-overdue" className="text-sm">Only overdue</label>
                  </div>
                </div>
              </div>

              {/* Tag Filters */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = filters.selectedTags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer transition-smooth capitalize ${
                          isSelected ? getTagColor(tag, customTags) : 'hover:bg-secondary'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ search: '' })}
              />
            </Badge>
          )}
          {!filters.showCompleted && (
            <Badge variant="secondary" className="gap-1">
              Hide completed
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ showCompleted: true })}
              />
            </Badge>
          )}
          {filters.showOverdue && (
            <Badge variant="secondary" className="gap-1">
              Only overdue
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilters({ showOverdue: false })}
              />
            </Badge>
          )}
          {filters.selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 capitalize">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};