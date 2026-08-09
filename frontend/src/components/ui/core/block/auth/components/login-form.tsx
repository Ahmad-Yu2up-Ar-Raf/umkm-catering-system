import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import type { loginReturnType } from "@/components/ui/core/block/auth/hooks/use-auth"
import { Email, Key } from "@hugeicons/core-free-icons"

type componentProps = {
  form: loginReturnType
  isLoading: boolean
}

export default function LoginForm({ form, isLoading }: componentProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-9"
    >
      <FieldGroup className="gap-2">
        <form.AppField name="email">
          {(field) => (
            <field.Input
              LeftIcon={Email}
              type="email"
              placeholder="example@gmail.com"
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.Input
              LeftIcon={Key}
              type="password"
              placeholder="Password"
            />
          )}
        </form.AppField>
      </FieldGroup>
      <Button
        type="submit"
        size={"lg"}
        variant={"default"}
        className="w-full cursor-pointer   "
        disabled={isLoading}
      >
        <span className="font-bold   ">Login</span>
        {isLoading && (
          <>
            <Spinner className="text-primary-foreground" />
          </>
        )}
      </Button>
    </form>
  )
}
