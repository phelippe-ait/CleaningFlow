export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; full_name: string; role: "manager" | "cleaner"; phone: string | null } }
      clients: { Row: { id: string; full_name: string; email: string | null; phone: string | null; notes: string | null; is_active: boolean } }
      properties: { Row: { id: string; client_id: string; property_name: string | null; address_line1: string; address_line2: string | null; suburb: string; state: string; postcode: string; access_instructions: string | null; cleaning_instructions: string | null; is_active: boolean } }
      jobs: { Row: { id: string; property_id: string; cleaner_id: string | null; title: string; scheduled_start: string; scheduled_end: string; status: string; instructions: string | null; estimated_earnings: number | null } }
      checklist_items: { Row: { id: string; job_id: string; task_name: string; sort_order: number } }
      job_checklist_progress: { Row: { id: string; checklist_item_id: string; completed_by: string | null; is_completed: boolean; completed_at: string | null } }
    }
    Functions: {
      advance_my_job: { Args: { p_job_id: string; p_status: string }; Returns: unknown }
    }
  }
}
