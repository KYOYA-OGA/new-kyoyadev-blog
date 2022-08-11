export type Theme = 'light' | 'dark';

export type FrontMatter = {
  title: string;
  layout: string;
  date: string;
  lastmod?: string;
  tags?: string[];
  excerpt: string;
  url: string;
  file: string;
};

export type ImageType = {
  src: string;
  width: number;
  height: number;
  format: string;
};

export type ProjectData = {
  title: string;
  imageSrc: string;
  description: string;
  githubLink: string;
  href?: string | undefined;
};
