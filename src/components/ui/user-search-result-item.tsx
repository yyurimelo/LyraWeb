import type { UserDataModel } from "@/@types/user/user-data-model";
import { cn } from "@/lib/utils";

// components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandItem } from "@/components/ui/command";

// helpers
import { getInitialName } from "@/lib/get-initial-name";

interface UserSearchResultItemProps {
  user: UserDataModel;
  onSelect: (user: UserDataModel) => void;
  isSelected?: boolean;
}

export function UserSearchResultItem({
  user,
  onSelect,
  isSelected = false,
}: UserSearchResultItemProps) {
  return (
    <CommandItem
      value={user.name}
      onSelect={() => onSelect(user)}
      className={cn(
        "group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors",
        "border border-transparent hover:bg-primary/20 hover:border hover:border-primary/30",
        isSelected && "bg-primary/20 border border-primary/30"
      )}
    >
      <Avatar className="size-10 rounded-full transition-transform">
        <AvatarImage
          src={user.avatarUser}
          alt={user.name}
          className="object-cover"
        />
        <AvatarFallback
          style={{ backgroundColor: user.appearancePrimaryColor || 'hsl(var(--primary))' }}
          className="text-secondary-foreground font-semibold"
        >
          {getInitialName(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-mono text-foreground text-sm truncate">
            {user.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2 -mt-1">
          <p className="text-xs text-muted-foreground truncate leading-relaxed">
            {user.description || "Sem descrição"}
          </p>
        </div>
      </div>
    </CommandItem>
  );
}