"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getThemeToggleState } from "@/lib/theme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timer);
  }, []);

  const { icon, label, nextTheme } = getThemeToggleState(resolvedTheme);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className="rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:border-primary/30 hover:bg-muted hover:text-foreground"
            onClick={() => setTheme(nextTheme)}
          >
            {!mounted ? <span aria-hidden="true" className="size-4" /> : null}
            {mounted && icon === "sun" ? <Sun className="size-4" /> : null}
            {mounted && icon === "moon" ? <Moon className="size-4" /> : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
