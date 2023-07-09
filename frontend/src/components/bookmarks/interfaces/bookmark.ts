import type { Priority } from "@helpers/getPriorityNumber";

export interface Category {
  name: string;
  color: string;
}

export interface Bookmark {
  total_count: number;
  title: string;
  id: number;
  user_id: number;
  original_url?: string | null;
  group_id?: number;
  alarm_id?: number;
  screenshot?: string;
  priority?: Priority;
  categories: Category[];
  notes?: string;
  stars: number;
  date_added?: Date;
  date_last_modified?: Date;
  alarm_frequency?: number;
}
