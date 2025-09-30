import type { ReactNode } from "react";

import { Globe, Mail } from "lucide-react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "@/lib/utils";

const baseClasses =
    "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition group-hover:border-primary/50 group-hover:text-primary";

type FallbackIcon = "globe" | "mail";

type IconCircleProps = {
    icon: SimpleIcon | null | undefined;
    fallback?: FallbackIcon;
    className?: string;
    children?: ReactNode;
};

export function IconCircle({ icon, fallback = "globe", className }: IconCircleProps) {
    let content: ReactNode;

    if (icon) {
        content = (
            <svg className="h-5 w-5" viewBox="0 0 24 24" role="img" aria-hidden>
                <path fill="currentColor" d={icon.path} />
            </svg>
        );
    } else if (fallback === "mail") {
        content = <Mail className="h-5 w-5" aria-hidden />;
    } else {
        content = <Globe className="h-5 w-5" aria-hidden />;
    }

    return <span className={cn(baseClasses, className)}>{content}</span>;
}
