export type Priority = 'low' | 'medium' | 'high';

export type PredefinedTag = 'work' | 'personal' | 'urgent' | 'health' | 'shopping' | 'learning';

export interface CustomTag {
  id: string;
  name: string;
  color: string; // CSS class name for the color
  createdAt: Date;
}

export type Tag = PredefinedTag | string; // Can be predefined or custom tag name

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  tags: Tag[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterState {
  search: string;
  showCompleted: boolean;
  showOverdue: boolean;
  selectedTags: Tag[];
}

export interface TagsState {
  predefined: PredefinedTag[];
  custom: CustomTag[];
}