"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ComboboxReviewer({
  options,
  selected,
  setSelected,
  placeholder = "Select Reviewer",
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-800 border-gray-600 text-white"
        >
          <span className="truncate">
            {selected
              ? options.find((option) => option.value === selected)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-full max-w-[100%] min-w-[200px] bg-gray-800 border border-gray-600 p-0 overflow-x-hidden"
      >
        <Command className="bg-gray-800">
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    setSelected(option.value);
                    setOpen(false);
                  }}
                  className="bg-gray-800 text-white hover:bg-gray-700 cursor-pointer"
                >
                  <span className="truncate">{option.label}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      selected === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
