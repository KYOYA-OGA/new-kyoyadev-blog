interface Props {
  children: React.ReactNode;
  href: string;
  className?: string;
  disabled?: boolean;
  secondary?: boolean;
}

export default function LinkButton({
  children,
  href,
  className = '',
  disabled = false,
  secondary = false,
}: Props) {
  return (
    <a
      href={href}
      className={`block text-center text-white py-2 px-5 rounded-lg transition ${
        secondary ? 'bg-secondary' : 'bg-blue-500'
      } ${
        disabled
          ? 'brightness-50 cursor-not-allowed'
          : 'hover:brightness-110 focus:brightness-110'
      } ${className}`}
    >
      {children}
    </a>
  );
}
