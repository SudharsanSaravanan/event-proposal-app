import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='relative'>
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', className)}
                ref={ref}
                {...props}
            />
            <button
                type='button'
                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500'
                onClick={togglePasswordVisibility}
            >
                {showPassword ? (
                    <EyeOffIcon className='h-5 w-5' />
                ) : (
                    <EyeIcon className='h-5 w-5' />
                )}
            </button>
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
