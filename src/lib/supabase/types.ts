export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  current_page: number | null;
  current_section: string | null;
  status: "reading" | "finished";
  created_at: string;
  updated_at: string;
};

export type BookNote = {
  id: string;
  book_id: string;
  user_id: string;
  content: string;
  reference_type: "page" | "range" | "reference" | "pending";
  page_start: number | null;
  page_end: number | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      book_notes: {
        Row: BookNote;
        Insert: Pick<BookNote, "book_id" | "user_id" | "content" | "reference_type"> & Partial<Omit<BookNote, "book_id" | "user_id" | "content" | "reference_type">>;
        Update: Partial<Pick<BookNote, "content" | "reference_type" | "page_start" | "page_end" | "reference">>;
        Relationships: [];
      };
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
