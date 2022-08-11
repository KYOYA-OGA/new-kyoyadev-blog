interface Props {
  children: React.ReactNode;
  className?: string;
  small?: boolean;
}

export default function Container({ children, className, small }: Props) {
  return (
    <div
      className={`container mx-auto px-5 2xl:px-0 ${
        small ? 'max-w-2xl lg:max-w-4xl' : 'max-w-6xl'
      } ${className}`}
    >
      {children}
    </div>
  );
}
