import React from 'react';

/**
 * NumericInput Component
 * 
 * A Safari-compatible numeric input field that prevents non-numerical input.
 * Automatically applies inputMode="decimal" and pattern validation.
 * 
 * Fixes Safari issue where type="number" allows non-numeric characters.
 * 
 * @example
 * <NumericInput 
 *   value={quantity} 
 *   onChange={(e) => setQuantity(e.target.valueAsNumber)}
 *   min="0.01"
 *   step="0.01"
 *   placeholder="0.00"
 * />
 */
const NumericInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      pattern="[0-9]+(\.[0-9]{1,2})?"
      className={className}
      {...props}
    />
  );
});

NumericInput.displayName = 'NumericInput';

export { NumericInput };
