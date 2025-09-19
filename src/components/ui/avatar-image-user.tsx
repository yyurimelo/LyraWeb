
import { getInitialName } from "@/lib/get-initial-name";
import { AvatarFallback, AvatarImage } from "./avatar";


import { cn } from "@/lib/utils";
import { oklchToHex } from "@/utils/color";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  name?: string;
  appearancePrimaryColor?: string;
};

export function AvatarImageUser({
  src,
  alt,
  className,
  name,
  appearancePrimaryColor,
}: Props) {
  const initialName = getInitialName(name);

  const colorUserPublic = appearancePrimaryColor
    ? oklchToHex(appearancePrimaryColor)
    : null;
  return (
    <>
      {src && alt ? (
        <AvatarImage
          alt={alt}
          src={src}
          className={cn(className ? className : "")}
        />
      ) : (
        <AvatarFallback
          className="rounded-full text-primary-foreground bg-primary"
          style={{ backgroundColor: colorUserPublic ?? undefined }}
        >
          {initialName}
        </AvatarFallback>
      )}
    </>
  );
}
