import React, { useState, useCallback } from 'react';

type Operator = '÷' | '×' | '-' | '+' | null;

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForSecond) {
      setDisplay(digit);
      setWaitingForSecond(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev.length < 12 ? prev + digit : prev);
    }
  }, [waitingForSecond]);

  const inputDecimal = useCallback(() => {
    if (waitingForSecond) {
      setDisplay('0.');
      setWaitingForSecond(false);
      return;
    }
    if (!display.includes('.')) setDisplay(prev => prev + '.');
  }, [display, waitingForSecond]);

  const clear = useCallback(() => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) * -1));
  }, []);

  const percentage = useCallback(() => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  }, []);

  const handleOperator = useCallback((op: Operator) => {
    const current = parseFloat(display);
    if (firstOperand !== null && !waitingForSecond) {
      const result = calculate(firstOperand, current, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    } else {
      setFirstOperand(current);
    }
    setOperator(op);
    setWaitingForSecond(true);
  }, [display, firstOperand, operator, waitingForSecond]);

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = useCallback(() => {
    if (firstOperand === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(firstOperand, current, operator);
    const formatted = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(10)).toString();
    setDisplay(formatted);
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
  }, [display, firstOperand, operator]);

  const buttons = [
    { label: 'C',  action: clear,             style: 'bg-white/20 text-white' },
    { label: '±',  action: toggleSign,         style: 'bg-white/20 text-white' },
    { label: '%',  action: percentage,          style: 'bg-white/20 text-white' },
    { label: '÷',  action: () => handleOperator('÷'), style: 'bg-primary/80 text-black font-bold' },
    { label: '7',  action: () => inputDigit('7'), style: 'bg-white/10 text-white' },
    { label: '8',  action: () => inputDigit('8'), style: 'bg-white/10 text-white' },
    { label: '9',  action: () => inputDigit('9'), style: 'bg-white/10 text-white' },
    { label: '×',  action: () => handleOperator('×'), style: 'bg-primary/80 text-black font-bold' },
    { label: '4',  action: () => inputDigit('4'), style: 'bg-white/10 text-white' },
    { label: '5',  action: () => inputDigit('5'), style: 'bg-white/10 text-white' },
    { label: '6',  action: () => inputDigit('6'), style: 'bg-white/10 text-white' },
    { label: '-',  action: () => handleOperator('-'), style: 'bg-primary/80 text-black font-bold' },
    { label: '1',  action: () => inputDigit('1'), style: 'bg-white/10 text-white' },
    { label: '2',  action: () => inputDigit('2'), style: 'bg-white/10 text-white' },
    { label: '3',  action: () => inputDigit('3'), style: 'bg-white/10 text-white' },
    { label: '+',  action: () => handleOperator('+'), style: 'bg-primary/80 text-black font-bold' },
    { label: '0',  action: () => inputDigit('0'), style: 'bg-white/10 text-white col-span-2' },
    { label: '.',  action: inputDecimal,        style: 'bg-white/10 text-white' },
    { label: '=',  action: handleEquals,         style: 'bg-primary text-black font-bold' },
  ];

  const isActiveOp = (op: string) => operator === op && waitingForSecond;

  return (
    <div className="w-full h-full bg-background text-white flex flex-col p-4 gap-2">
      <div className="flex-none bg-white/5 rounded-xl p-4 text-right flex flex-col items-end justify-end min-h-[80px]">
        {operator && firstOperand !== null && (
          <div className="text-white/40 text-sm font-mono mb-1">{firstOperand} {operator}</div>
        )}
        <div className="text-4xl font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
          {parseFloat(display).toLocaleString('en-US', { maximumFractionDigits: 10 })}
          {display.endsWith('.') ? '.' : ''}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map(({ label, action, style }) => (
          <button
            key={label}
            onClick={action}
            className={`rounded-xl text-xl font-medium transition-all active:scale-95 hover:brightness-125 ${style} ${isActiveOp(label) ? 'ring-2 ring-white/50' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
