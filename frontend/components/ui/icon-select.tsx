"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
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

// Import specific icons one by one to avoid dynamic rendering issues
import { 
  Laptop, Smartphone, Headphones, Watch, Camera, Tv,
  Speaker, Gamepad, Home, Store, ShoppingCart, Package,
  Gift, Tag as TagIcon, Shirt, Keyboard, Mouse, Cpu, Monitor,
  HardDrive, Check as CheckIcon, ChevronsUpDown as ChevronsIcon
} from "lucide-react";

// Static icon mapping
const iconMap = {
  "Laptop": Laptop,
  "Smartphone": Smartphone,
  "Headphones": Headphones,
  "Watch": Watch,
  "Camera": Camera,
  "Tv": Tv,
  "Speaker": Speaker,
  "Gamepad": Gamepad,
  "Home": Home,
  "Store": Store,
  "ShoppingCart": ShoppingCart,
  "Package": Package,
  "Gift": Gift,
  "Tag": TagIcon,
  "Shirt": Shirt,
  "Keyboard": Keyboard,
  "Mouse": Mouse,
  "Cpu": Cpu,
  "Monitor": Monitor,
  "HardDrive": HardDrive,
};

// Icon names array
const iconNames = Object.keys(iconMap);

type IconSelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IconSelect({ value, onChange, placeholder = "Select an icon..." }: IconSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Safely get icon component
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || TagIcon;
  };

  // Render a selected icon
  const renderSelectedIcon = () => {
    if (!value || !iconMap[value as keyof typeof iconMap]) {
      return null;
    }
    
    const IconComponent = getIconComponent(value);
    return <IconComponent className="mr-2 h-4 w-4" />;
  };

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
              {renderSelectedIcon()}
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandEmpty>No icon found.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {iconNames.map((iconName) => {
                const IconComponent = getIconComponent(iconName);
                
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
                    <IconComponent className="mr-2 h-4 w-4" />
                    <span>{iconName}</span>
                    {value === iconName && (
                      <CheckIcon className="ml-auto h-4 w-4" />
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