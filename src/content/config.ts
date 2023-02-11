import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    layout: z.string(),
    date: z.string(),
    lastmod: z.string().optional(),
    tags: z.array(z.string()),
    excerpt: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
