import React from 'react';

/**
 * NumericInput Component
 * 
 * A Safari-compatible numeric input field that prevents non-numerical input.
 * Automatically applies inputMode="decimal" and prevents non-numeric key input.
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
>(({ className = '', onKeyDown, onChange, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: Cmd+A, Cmd+C, Cmd+V, Cmd+X (Mac)
      (e.keyCode === 65 && e.metaKey === true) ||
      (e.keyCode === 67 && e.metaKey === true) ||
      (e.keyCode === 86 && e.metaKey === true) ||
      (e.keyCode === 88 && e.metaKey === true) ||
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)) {
      // Let it happen, don't do anything
      if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }
    
    // Get the input element
    const input = e.currentTarget;
    const currentValue = input.value;
    const key = e.key;
    
    // Allow decimal point only if not already present
    if (key === '.' || key === ',') {
      if (currentValue.includes('.')) {
        e.preventDefault();
        return;
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }
    
    // Allow minus sign only at the start and if min is not set or is negative
    if (key === '-') {
      const minValue = props.min !== undefined ? parseFloat(props.min.toString()) : -Infinity;
      if (input.selectionStart !== 0 || currentValue.includes('-') || minValue >= 0) {
        e.preventDefault();
        return;
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }
    
    // Ensure that it is a number and stop the keypress if not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
      return;
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Additional validation on change to handle paste events
    const value = e.target.value;
    // Remove any non-numeric characters except decimal point and minus
    const sanitized = value.replace(/[^0-9.-]/g, '');
    
    if (value !== sanitized) {
      e.target.value = sanitized;
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      pattern="[0-9]+(\.[0-9]{1,2})?"
      className={className}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      {...props}
    />
  );
});

NumericInput.displayName = 'NumericInput';

export { NumericInput };
