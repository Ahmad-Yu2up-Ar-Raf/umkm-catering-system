import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import type { loginReturnType } from "@/components/ui/core/block/auth/hooks/use-auth"
import { Key, UserIcon } from "@hugeicons/core-free-icons"

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
      <FieldGroup className="gap-8">
        <form.AppField name="username">
          {(field) => (
            <field.Input
            label="Username"
              LeftIcon={UserIcon}
              type="text"
              placeholder="admin"
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.Input
            label="Password"
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
        className="w-full rounded-2xl cursor-pointer   "
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
