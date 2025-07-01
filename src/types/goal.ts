export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  linked_category_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  // Add more fields as needed from backend
}

export interface GoalCreate {
  name: string;
  description?: string;
  target_amount: number;
  deadline?: string | null;
  create_temporary_category?: boolean;
  temporary_category_name?: string;
}

export interface GoalUpdate {
  name?: string;
  description?: string;
  target_amount?: number;
  deadline?: string | null;
  status?: string;
  linked_category_id?: string;
} 