import { Link } from "@/i18n/navigation"

interface HeaderProps {
  title: string
  description: string
  linkText: string
  linkHref: string
}

export function AuthHeader({
  title,
  description,
  linkText,
  linkHref,
}: HeaderProps) {
  return (
    <div className="flex flex-col pb-10">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        <Link
          href={linkHref}
          className="text-sm font-medium text-primary hover:underline uppercase"
        >
          {linkText}
        </Link>
      </div>

      <p className="text-sm font-light text-muted-foreground">{description}</p>
    </div>
  )
}
