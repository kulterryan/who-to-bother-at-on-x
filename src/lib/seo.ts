type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export function seo({
  title,
  description,
  keywords,
  image,
  url,
}: {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}): MetaTag[] {
  const tags: MetaTag[] = [
    { title },
    { name: 'title', content: title },
  ];

  if (description) {
    tags.push(
      { name: "description", content: description },
      { property: "og:description", content: description },
      { name: "twitter:description", content: description }
    );
  }

  if (keywords) {
    tags.push({ name: "keywords", content: keywords });
  }

  if (image) {
    tags.push(
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: title }
    );
  }

  if (url) {
    tags.push(
      { property: 'og:url', content: url },
      { name: 'twitter:url', content: url }
    );
  }

  tags.push(
    { property: "og:title", content: title },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title }
  );

  return tags;
}
