export type ActionState = {
  success: boolean;
  message: string;
  params?: Record<string, string | number>;
  fields?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = { success: false, message: "" };
