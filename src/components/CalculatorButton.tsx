import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalculatorButtonProps {
  children: ReactNode;
  variant: "number" | "function" | "operation";
  wide?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

const CalculatorButton = ({
  children,
  variant,
  wide = false,
  isActive = false,
  onClick,
}: CalculatorButtonProps) => {
  return (
    <button
      className={cn(
        "calculator-button",
        variant === "number" && "calculator-button-number",
        variant === "function" && "calculator-button-function",
        variant === "operation" && "calculator-button-operation",
        isActive && "calculator-button-operation-active",
        wide && "calculator-button-wide"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CalculatorButton;
