import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "./button";

// icons
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";

// -----------------------------------------------------------------------------

type ComboboxProps = React.HTMLAttributes<HTMLInputElement> & {
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (...event: any[]) => void;
  value: string | undefined | null;
  itens: { label: string; value: string }[] | undefined;
  isPalette?: boolean;
  created?: boolean;
  onCreateComponent?: React.ReactNode;
};

// -----------------------------------------------------------------------------

export function Combo({
  loading,
  placeholder,
  disabled,
  className,
  onSelect,
  value,
  itens,
  isPalette,
  created,
  onCreateComponent,
  ...rest
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth); // Obtém a largura do Button
    }
  }, []);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!value) {
      setSearch("");
    }
  }, [value]);

  // Filtrar opções com base no texto digitado
  const filteredItens = itens?.filter((item) =>
    item.label
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(
        search
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
  );

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && !value) {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "transition-colors",
            className,
            loading ? "justify-center" : "justify-between"
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="w-8 h-8 animate-spin" />
            </>
          ) : (
            <>
              <p className="truncate">
                {value
                  ? itens?.find((item) => item.value === value)?.label
                  : placeholder ?? "Escolha uma opção"}
              </p>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("p-2", className)}
        style={{ width: `${buttonWidth}px` }}
      >
        <Command>
          <CommandInput
            placeholder={placeholder ?? "Escolha uma opção"}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setSearch(e.target.value)}
            {...rest}
          />
          <CommandList className="dark:[color-scheme:dark]">
            {filteredItens?.length ? (
              <CommandGroup>
                {filteredItens.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onSelect(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value
                          ? "opacity-100 text-primary"
                          : "opacity-0"
                      )}
                    />

                    {isPalette ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-sm border"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={{ backgroundColor: (item as any).hex }}
                        />
                        {item.label}
                      </div>
                    ) : (
                      item.label
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : created && filteredItens?.length === 0 ? (
              <CommandGroup>
                <CommandItem value={search}>{onCreateComponent}</CommandItem>
              </CommandGroup>
            ) : (
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
