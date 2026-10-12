export default function SelectField({ label, required, options = [], ...props }) {
  return (
    <label className="field">
      <span>{label}{required && <b>*</b>}</span>
      <select {...props}>
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}