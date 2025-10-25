import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

// Mimic CVA for manual implementation
export const buttonVariants = ({ variant = "default", size = "default", className = "" }: { variant?: ButtonProps['variant'], size?: ButtonProps['size'], className?: string } = {}) => {
    // Base styles
    let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    // Variants
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-black text-white hover:bg-gray-800",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 bg-red-600 text-white hover:bg-red-700",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-gray-200 hover:bg-gray-100",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-gray-100",
        link: "text-primary underline-offset-4 hover:underline text-blue-600",
    }

    // Sizes
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return cn(
        baseStyles,
        variants[variant || "default"],
        sizes[size || "default"],
        className
    )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const classes = buttonVariants({ variant, size, className })

        // If asChild is true, valid implementation requires Radix Slot.
        // Since we don't have it, we just render a button but warn or handle it if we can.
        // However, the user issue is mainly TypeScript error. adding asChild to interface fixes TS.
        // But runtime behavior of <Button asChild><Link/></Button> without Slot will just be <button><a/></button> which is invalid.
        // So we will Fix Navbar to NOT use asChild, but use buttonVariants on the Link directly.
        // This file update primarily exports buttonVariants and adds asChild to props (unused) to satisfy any other potential consumers or TS check if we missed one.

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
