interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: Props) {
  return (
    <div className={`container max-w-6xl mx-auto px-5 ${className}`}>
      {children}
    </div>
  );
}
