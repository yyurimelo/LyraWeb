"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandEmpty,
  Command,
} from "@/shared/components/ui/command";
import { Button } from "./button";
import {
  UserSearchResultItem,
  UserSearchDetails,
  UserSearchSkeleton
} from "@/pages/_app/-components/user-search";

import { useDebounce } from "@/shared/hooks/use-debounce";
import type { UserDataModel } from "@/@types/user/user-data-model";
import { useGetUserWithNameQuery } from "@/shared/http/hooks/user.hooks";

export default function SearchUser() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDataModel | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: users = [],
    isPending,
    error,
  } = useGetUserWithNameQuery(debouncedSearchQuery);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleUserSelect = (user: UserDataModel) => {
    setSelectedUser(user);
    setOpenDialog(true);
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
          <span className="text-muted-foreground/70 font-normal">
            {t('userSearch.button')}
          </span>
        </span>
        <kbd className="hidden sm:inline bg-background text-muted-foreground/70 ms-auto h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('userSearch.placeholder')}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />

          <CommandList>
            {!searchQuery ? (
              <CommandEmpty>
                {t('userSearch.emptyStates.enterName')}
              </CommandEmpty>
            ) : isPending ? (
              <CommandGroup>
                <UserSearchSkeleton />
              </CommandGroup>
            ) : error ? (
              <CommandEmpty>
                {t('userSearch.emptyStates.searchError')}
              </CommandEmpty>
            ) : users.length > 0 ? (
              <CommandGroup heading={t('userSearch.emptyStates.usersFound')}>
                {users.map((user) => (
                  <div className="mt-1">
                    <UserSearchResultItem
                      key={user.userIdentifier}
                      user={user}
                      onSelect={handleUserSelect}
                    />
                  </div>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>
                {t('userSearch.emptyStates.noUsersFound')}
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
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
