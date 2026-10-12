export default function TextField({ label, required, ...props }) {
  return (
    <label className="field">
      <span>{label}{required && <b>*</b>}</span>
      <input {...props} />
    </label>
  );
}