"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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

export function ComboboxLevel({ options, selected, setSelected }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-800 border-gray-600 text-white"
        >
          {selected !== undefined && selected !== null && selected !== ""
            ? options.find((option) => option.value === selected)?.label
            : "Select Level"}
          <ChevronsUpDown className="opacity-50 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full bg-gray-800 border-gray-600 text-white p-0">
        <Command className="bg-gray-800">
          <CommandList>
            <CommandEmpty>No level found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    setSelected(option.value);
                    setOpen(false);
                  }}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
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
