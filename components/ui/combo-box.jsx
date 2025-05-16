'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Combobox({ options, selected, setSelected }) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between bg-gray-800 border-gray-600 text-white'
                >
                    {selected
                        ? options.find((option) => option.value === selected)?.label
                        : 'Select Department'}
                    <ChevronsUpDown className='opacity-50 ml-auto' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-full bg-gray-800 border-gray-600 text-white p-0'>
                <Command className='bg-gray-800'>
                    {/* Custom Search Bar */}
                    <div className='flex items-center bg-gray-800 px-3 py-2 border-b border-gray-700'>
                        <Search className='text-gray-400 mr-2' size={16} />
                        <input
                            type='text'
                            placeholder='Search Department...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='bg-transparent text-white placeholder-gray-400 outline-none w-full'
                        />
                    </div>

                    <CommandList>
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                            {options
                                .filter((option) =>
                                    option.label.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => {
                                            setSelected(option.value);
                                            setOpen(false);
                                        }}
                                        className='bg-gray-800 text-white hover:bg-gray-700'
                                    >
                                        {option.label}
                                        <Check
                                            className={cn(
                                                'ml-auto',
                                                selected === option.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
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
