export interface Category {
  name: string;
  color: string;
}

export interface Bookmark {
  title: string;
  id: number;
  user_id: number;
  original_url?: number;
  group_id?: number;
  alarm_id?: number;
  screenshot_path?: string;
  priority?: number;
  categories?: Category[];
  notes?: string;
  stars?: number;
  date_added?: Date;
}
