export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  current_page: number | null;
  current_section: string | null;
  note: string | null;
  status: "reading" | "finished";
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      books: {
        Row: Book;
        Insert: Pick<Book, "title" | "user_id"> & Partial<Omit<Book, "title" | "user_id">>;
        Update: Partial<Omit<Book, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
