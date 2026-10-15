export type ActionState = {
  success: boolean;
  message: string;
  fields?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = { success: false, message: "" };
