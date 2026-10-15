import type { ActionState } from "@/lib/action-state";

export function FormFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return <p role={state.success ? "status" : "alert"} className={`rounded-lg p-3 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>;
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  return errors?.length ? <p id={id} className="text-xs text-destructive">{errors[0]}</p> : null;
}
