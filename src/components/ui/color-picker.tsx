"use client";

import { forwardRef, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(({ disabled, value, onChange, onBlur, name, className, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  const parsedValue = useMemo(() => {
    return value || "#FFFFFF";
  }, [value]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          {...props}
          className={cn("block w-[45px] h-full", className)}
          name={name}
          onClick={() => setOpen(true)}
          size="icon"
          disabled={disabled}
          style={{
            backgroundColor: parsedValue,
          }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          maxLength={7}
          value={parsedValue}
          onChange={(e) => onChange(e.currentTarget.value)}
          onBlur={onBlur}
          ref={ref}
        />
      </PopoverContent>
    </Popover>
  );
});

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
