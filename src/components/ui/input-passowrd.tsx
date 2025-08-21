import { EyeIcon, EyeOffIcon, CheckIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { type ControllerRenderProps, type FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";


type Props = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  error?: FieldError;
  isNormalInputPassword?: boolean;
};

export function InputPassword({ id, field, error, isNormalInputPassword }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "Pelo menos 8 caracteres" },
      { regex: /[0-9]/, text: "Pelo menos 1 número" },
      { regex: /[a-z]/, text: "Pelo menos 1 letra minúscula" },
      { regex: /[A-Z]/, text: "Pelo menos 1 letra maiúscula" },
    ];
    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(field.value ?? "");

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Sua senha deve conter:";
    if (score <= 2) return "Senha fraca";
    if (score === 3) return "Senha média";
    return "Senha forte";
  };

  return (
    <div>
      <div className="*:not-first:mt-2">
        <div className="relative">
          <Input
            id={id}
            className={`pe-9 ${error ? "border-destructive ring-destructive/20" : ""
              }`}
            placeholder="Senha"
            type={isVisible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={`${id}-description`}
            {...field}
          />

          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center"
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeIcon size={16} className={cn(error && "text-red-400")} />
            ) : (
              <EyeOffIcon size={16} className={cn(error && "text-red-400")} />
            )}
          </button>
        </div>
      </div>

      {!isNormalInputPassword && (
        <>
          <div
            className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={strengthScore}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Password strength"
          >
            <div
              className={`h-full ${getStrengthColor(
                strengthScore
              )} transition-all duration-500 ease-out`}
              style={{ width: `${(strengthScore / 4) * 100}%` }}
            />
          </div>

          <p id={`${id}-description`} className="mb-2 text-sm font-medium">
            {getStrengthText(strengthScore)}
          </p>

          <ul className="space-y-1.5">
            {strength.map((req, i) => (
              <li key={i} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon size={16} className="text-emerald-500" />
                ) : (
                  <XIcon size={16} className="text-muted-foreground/80" />
                )}
                <span
                  className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"
                    }`}
                >
                  {req.text}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
