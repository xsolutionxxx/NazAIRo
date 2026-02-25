import { useState } from "react";
import {
  usePhoneInput,
  defaultCountries,
  parseCountry,
  FlagImage,
} from "react-international-phone";
import { ChevronsUpDown, Check } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/ui/command";
import { AppButton } from "@shared/ui/appButton";
import { AppInput } from "@shared/ui/appInput";
import { cn } from "@shared/lib/utils";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  errorMsg?: string;
  isLoading?: boolean;
  containerClassName: string;
}

export default function PhoneField({
  value,
  onChange,
  errorMsg,
  isLoading,
  containerClassName,
}: PhoneFieldProps) {
  const [open, setOpen] = useState(false);

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "ua",
      value: value ?? "",
      countries: defaultCountries,
      onChange: (data) => onChange(data.phone),
    });

  return (
    <AppInput
      ref={inputRef}
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
      label="Phone number"
      placeholder="Your phone number"
      errorMsg={errorMsg}
      disabled={isLoading}
      containerClassName={containerClassName}
      className="flex-1 pl-16"
      startContent={
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <AppButton
              intent="ghost"
              role="combobox"
              aria-expanded={open}
              className="absolute pl-3 pr-1.5 h-full flex items-center gap-1"
              disabled={isLoading}
            >
              <FlagImage iso2={country.iso2} style={{ width: "24px" }} />
              <ChevronsUpDown className="h-3 w-3 shrink-0" />
            </AppButton>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-max bg-background" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList className="max-h-58">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {defaultCountries.map((c) => {
                    const curr = parseCountry(c);
                    return (
                      <CommandItem
                        key={curr.iso2}
                        value={curr.name}
                        onSelect={() => {
                          setCountry(curr.iso2);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FlagImage iso2={curr.iso2} style={{ width: "20px" }} />
                        <span className="flex-1 text-sm">{curr.name}</span>
                        <span className="text-muted-foreground text-xs">
                          +{curr.dialCode}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            country.iso2 === curr.iso2
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
    />
  );
}
