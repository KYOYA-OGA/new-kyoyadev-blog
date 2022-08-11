interface Props {
  title: string;
  subTitle?: string;
}

export default function Heading({ title, subTitle }: Props) {
  return (
    <div className="text-center">
      <h1 className="text-4xl lg:text-5xl leading-normal lg:leading-normal">
        {title}
      </h1>
      <p className="lg:text-xl">{subTitle}</p>
      <div className="bg-secondary dark:bg-soft-white h-1 w-20 mt-3 mx-auto"></div>
    </div>
  );
}
