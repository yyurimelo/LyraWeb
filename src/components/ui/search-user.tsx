"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";

// components
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "./button";
import { UserSearchResultItem } from "./user-search-result-item";
import { UserSearchDetails } from "./user-search-details";
import { UserSearchSkeleton } from "./user-search-skeleton";

// hooks
import { useUserSearchMutation } from "@/http/hooks/user-search.hooks";
import { useDebounce } from "@/hooks/use-debounce";

// types
import type { UserDataModel } from "@/@types/user/user-data-model";

export default function SearchUser() {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserDataModel[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDataModel | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  // Debounced search query (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search mutation
  const { mutateAsync: searchUsers, error, isPending } = useUserSearchMutation();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Clear results when search is too short or empty
  useEffect(() => {
    if (searchQuery.trim().length === 0 || searchQuery.trim().length < 6) {
      setSearchResults([]);
      setIsSearching(false);
      setCurrentSearchQuery(""); // Reset to allow re-searching same query
    }
  }, [searchQuery]);

  // Trigger search when debounced query changes and meets requirements
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 6 && debouncedSearchQuery !== currentSearchQuery) {
        setCurrentSearchQuery(debouncedSearchQuery);
        setIsSearching(true);
        try {
          const results = await searchUsers(debouncedSearchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }
    };

    performSearch();
  }, [debouncedSearchQuery, currentSearchQuery, searchUsers]);

  const handleUserSelect = (user: UserDataModel) => {
    setSelectedUser(user);
    setOpen(false);
    setOpenDialog(true);
  };

  const handleSearchValueChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <>
      <Button
        className="border-input bg-background hover:bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50
          inline-flex h-9 w-9 sm:w-[200px] rounded-md border px-0 sm:px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] justify-center sm:justify-start items-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <SearchIcon
          className="text-muted-foreground/80"
          size={16}
          aria-hidden="true"
        />
        <span className="hidden sm:flex grow items-center ms-3">
          <span className="text-muted-foreground/70 font-normal">Procurar</span>
        </span>
        <kbd className="hidden sm:inline bg-background text-muted-foreground/70 ms-auto h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar usuários (mínimo 6 caracteres)..."
          value={searchQuery}
          onValueChange={handleSearchValueChange}
        />
        <CommandList>
          {searchQuery.trim().length === 0 ? (
            <CommandEmpty>
              Digite o ID do usuário
            </CommandEmpty>
          ) : (searchQuery.trim().length < 6 && !isSearching) ? (
            <CommandEmpty>
              <UserSearchSkeleton />
            </CommandEmpty>
          ) : isPending ? (
            <CommandGroup>
              <UserSearchSkeleton />
            </CommandGroup>
          ) : error ? (
            <CommandEmpty>Erro ao buscar usuários. Tente novamente.</CommandEmpty>
          ) : searchResults.length > 0 ? (
            <CommandGroup heading="Usuários encontrados">
              {searchResults.map((user) => (
                <UserSearchResultItem
                  key={user.userIdentifier}
                  user={user}
                  onSelect={handleUserSelect}
                />
              ))}
            </CommandGroup>
          ) : searchQuery.trim().length >= 6 ? (
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
          ) : (
            <CommandEmpty>Digite pelo menos 6 caracteres para buscar usuários...</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>

      {selectedUser && (
        <UserSearchDetails
          open={openDialog}
          setOpen={setOpenDialog}
          user={selectedUser}
        />
      )}
    </>
  );
}
