interface Props {
  title: string;
  subTitle?: string;
}

export default function Heading({ title, subTitle }: Props) {
  return (
    <div className="text-center space-y-3">
      <h1 className="font-bold text-4xl lg:text-5xl leading-none">{title}</h1>
      {subTitle ? (
        <p className="lg:text-xl leading-none lg:leading-none">{subTitle}</p>
      ) : null}
      <div className="bg-secondary dark:bg-soft-white h-1 w-20 mx-auto"></div>
    </div>
  );
}
