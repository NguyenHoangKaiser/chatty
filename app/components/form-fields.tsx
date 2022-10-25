interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: any;
  onChange?: (...args: any[]) => any;
}

function FormFields({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => {},
}: FormFieldProps) {
  return (
    <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
        {label}
      </label>
      <input
        type={type}
        onChange={onChange}
        id={htmlFor}
        name={htmlFor}
        className="w-full p-2 rounded-xl my-2"
        value={value}
      />
    </>
  );
}

export default FormFields;
