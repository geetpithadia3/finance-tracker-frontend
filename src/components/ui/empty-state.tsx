import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode | string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mt-4", className)} {...props}>
        <Card>
          <CardContent className="p-8 text-center">
            {icon && (
              <div className="mb-4">
                {typeof icon === 'string' ? (
                  <div className="text-4xl text-muted-foreground">{icon}</div>
                ) : (
                  icon
                )}
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            {action && (
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }