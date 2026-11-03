import './Common.css';

function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  editable = false,
}) {
  const clamp = (number) => Math.min(max, Math.max(min, number));

  const handleInput = (event) => {
    const parsed = parseInt(event.target.value, 10);
    onChange(Number.isNaN(parsed) ? min : clamp(parsed));
  };

  return (
    <div className="qty">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInput}
        readOnly={!editable}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default QuantitySelector;