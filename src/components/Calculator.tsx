import { useState } from "react";
import CalculatorButton from "./CalculatorButton";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    if (value.includes(".") && !value.endsWith(".")) {
      const [integer, decimal] = value.split(".");
      const formattedInteger = parseFloat(integer).toLocaleString("pt-BR");
      return `${formattedInteger},${decimal}`;
    }
    
    if (value.endsWith(".")) {
      return num.toLocaleString("pt-BR") + ",";
    }
    
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(5);
    }
    
    return num.toLocaleString("pt-BR", { maximumFractionDigits: 8 });
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case "+":
        result = previousValue + inputValue;
        break;
      case "-":
        result = previousValue - inputValue;
        break;
      case "×":
        result = previousValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const displayValue = formatDisplay(display);
  const displayLength = displayValue.replace(/[.,]/g, "").length;
  
  const getFontSize = () => {
    if (displayLength > 9) return "text-4xl";
    if (displayLength > 7) return "text-5xl";
    if (displayLength > 5) return "text-6xl";
    return "text-7xl";
  };

  return (
    <div className="calculator-container">
      <div className="calculator-display">
        <span className={`calculator-display-text ${getFontSize()}`}>
          {displayValue}
        </span>
      </div>
      
      <div className="calculator-buttons">
        <CalculatorButton variant="function" onClick={clear}>
          {display === "0" ? "AC" : "C"}
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={toggleSign}>
          +/-
        </CalculatorButton>
        <CalculatorButton variant="function" onClick={percentage}>
          %
        </CalculatorButton>
        <CalculatorButton 
          variant="operation" 
          onClick={() => performOperation("÷")}
          isActive={operation === "÷" && waitingForOperand}
        >
          ÷
        </CalculatorButton>

        <CalculatorButton variant="number" onClick={() => inputDigit("7")}>
          7
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("8")}>
          8
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("9")}>
          9
        </CalculatorButton>
        <CalculatorButton 
          variant="operation" 
          onClick={() => performOperation("×")}
          isActive={operation === "×" && waitingForOperand}
        >
          ×
        </CalculatorButton>

        <CalculatorButton variant="number" onClick={() => inputDigit("4")}>
          4
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("5")}>
          5
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("6")}>
          6
        </CalculatorButton>
        <CalculatorButton 
          variant="operation" 
          onClick={() => performOperation("-")}
          isActive={operation === "-" && waitingForOperand}
        >
          −
        </CalculatorButton>

        <CalculatorButton variant="number" onClick={() => inputDigit("1")}>
          1
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("2")}>
          2
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={() => inputDigit("3")}>
          3
        </CalculatorButton>
        <CalculatorButton 
          variant="operation" 
          onClick={() => performOperation("+")}
          isActive={operation === "+" && waitingForOperand}
        >
          +
        </CalculatorButton>

        <CalculatorButton variant="number" wide onClick={() => inputDigit("0")}>
          0
        </CalculatorButton>
        <CalculatorButton variant="number" onClick={inputDecimal}>
          ,
        </CalculatorButton>
        <CalculatorButton variant="operation" onClick={calculate}>
          =
        </CalculatorButton>
      </div>
    </div>
  );
};

export default Calculator;
