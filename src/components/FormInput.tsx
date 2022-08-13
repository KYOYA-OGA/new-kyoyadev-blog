interface Props {
  name: string;
  label: string;
  placeholder: string;
  textarea?: boolean;
}

const inputStyles = `bg-primary dark:bg-soft-white rounded border-2 dark:border-dark-subtle w-full text-lg outline-none focus:ring-2 focus:ring-blue-500 p-1 text-soft-white dark:text-secondary peer`;

export default function FormInput({
  name,
  label,
  placeholder,
  textarea,
}: Props) {
  return (
    <div className="flex flex-col-reverse">
      {textarea ? (
        <textarea
          name="message"
          id="message"
          className={inputStyles}
          placeholder={placeholder}
          rows={7}
        ></textarea>
      ) : (
        <input
          id={name}
          name={name}
          className={inputStyles}
          placeholder={placeholder}
        />
      )}
      <label
        htmlFor={name}
        className="text-lg font-semibold dark:text-dark-subtle text-light-subtle dark:peer-focus:text-white peer-focus:text-primary transition-colors self-start"
      >
        {label}
      </label>
    </div>
  );
}
