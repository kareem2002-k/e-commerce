"use client";

import * as React from "react";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Most common e-commerce related icons to display first
const commonIcons = [
  "Laptop",
  "Smartphone",
  "Headphones",
  "Watch",
  "Camera",
  "Tv",
  "Speaker",
  "Gamepad",
  "Home",
  "Store",
  "ShoppingCart",
  "Package",
  "Gift",
  "Tag",
  "Shirt",
  "Shoe",
  "Keyboard",
  "Mouse",
  "Printer",
  "Server",
  "Cpu",
  "Monitor",
  "HardDrive",
  "Microphone",
];

// Get all icons from Lucide
const allIconNames = Object.keys(LucideIcons).filter(
  (key) => typeof LucideIcons[key as keyof typeof LucideIcons] === "function" && key !== "default"
);

// Sort the icons - common icons first, then alphabetically
const iconNames = [
  ...commonIcons.filter(name => allIconNames.includes(name)),
  ...allIconNames
    .filter(name => !commonIcons.includes(name))
    .sort()
];

type IconSelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IconSelect({ value, onChange, placeholder = "Select an icon..." }: IconSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Get the current icon component
  const IconComponent = value ? LucideIcons[value as keyof typeof LucideIcons] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center">
              {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <LucideIcons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandEmpty>No icon found.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {iconNames.map((iconName) => {
                const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                    className="flex items-center"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{iconName}</span>
                    {value === iconName && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 