"use client";

import { useI18n } from "@/components/locale-provider";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authenticate } from "@/app/login/actions";
import { initialActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import { SetupNotice } from "@/components/setup-notice";

export function AuthForm({ configured }: { configured: boolean }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup">("login");
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("Your next chapter starts here")}</p>
      <h2 className="editorial text-4xl">{mode === "login" ? t("Welcome back.") : t("Make yourself at home.")}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === "login" ? t("A good book is waiting right where you left it.") : t("A quiet home for your books, and a bookmark that stays.")}</p>
      <div className="my-7 flex rounded-lg border bg-muted/60 p-1" aria-label={t("Account access")}>
        {(["login", "signup"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)} className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium ${mode === item ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item === "login" ? t("Sign in") : t("Create account")}</button>)}
      </div>
      {!configured && <div className="mb-6"><SetupNotice /></div>}
      <CredentialFields key={mode} mode={mode} configured={configured} />
    </div>
  );
}

function CredentialFields({ mode, configured }: { mode: "login" | "signup"; configured: boolean }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), initialActionState);
  const [visible, setVisible] = useState(false);
  const signup = mode === "signup";
  return (
    <form action={action} className="space-y-5">
      <fieldset disabled={pending} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{t("Email address")}</Label>
          <Input id="email" name="email" type="email" placeholder={t("you@example.com")} autoComplete="email" maxLength={254} required aria-invalid={Boolean(state.fields?.email)} aria-describedby="email-error" />
          <FieldError id="email-error" errors={state.fields?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("Password")}</Label>
          <div className="relative"><Input id="password" name="password" type={visible ? "text" : "password"} className="pr-12" placeholder={signup ? t("At least 8 characters") : t("Your password")} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : 1} maxLength={128} required aria-invalid={Boolean(state.fields?.password)} aria-describedby="password-error" />
            <button type="button" aria-label={visible ? t("Hide password") : t("Show password")} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
          <FieldError id="password-error" errors={state.fields?.password} />
        </div>
        {signup && <div className="space-y-2"><Label htmlFor="confirm_password">{t("Repeat password")}</Label><Input id="confirm_password" name="confirm_password" type={visible ? "text" : "password"} placeholder={t("One more time")} autoComplete="new-password" maxLength={128} required aria-invalid={Boolean(state.fields?.confirm_password)} aria-describedby="confirm-password-error" /><FieldError id="confirm-password-error" errors={state.fields?.confirm_password} /></div>}
      </fieldset>
      <FormFeedback state={state} />
      <Button type="submit" disabled={pending || !configured} className="h-12 w-full gap-3">{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{signup ? t("Create your account") : t("Back to my books")}{!pending && <ArrowRight className="size-4" />}</Button>
      {signup && <p className="text-center text-xs leading-5 text-muted-foreground">{t("No email confirmation. Just create your account and start reading.")}</p>}
    </form>
  );
}
