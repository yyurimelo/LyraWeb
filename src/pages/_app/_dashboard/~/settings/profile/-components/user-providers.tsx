import GithubIcon from "@/shared/components/logos/github-icon";
import GoogleIcon from "@/shared/components/logos/google-icon";

interface UserProvidersProps {
  providers: string[];
  className?: string;
}

export function UserProviders({ providers, className }: UserProvidersProps) {
  const renderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return <GoogleIcon />;
      case "github":
        return <GithubIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-2 items-center flex-col ${className}`}>
      {providers.map((provider) => {
        const icon = renderIcon(provider);
        if (!icon) return null; // ignora providers sem ícone
        return (
          <div
            key={provider}
            title={provider}
            className="flex items-center justify-center w-8 h-8 bg-white shadow p-1.5 rounded border"
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
}
