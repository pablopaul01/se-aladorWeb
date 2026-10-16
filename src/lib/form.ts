import { startTransition, type FormEvent } from "react";

// React 19 resets a <form action={fn}> after every submission, wiping the user's
// input even when validation fails. Submitting through onSubmit keeps the values.
export function submitWithoutReset(dispatch: (payload: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
}
