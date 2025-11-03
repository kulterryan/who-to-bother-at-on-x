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
}) {
  const tags = [
    { title },
  ];

  if (description) {
    tags.push(
      { name: 'description', content: description },
      { property: 'og:description', content: description },
      { name: 'twitter:description', content: description }
    );
  }

  if (keywords) {
    tags.push({ name: 'keywords', content: keywords });
  }

  if (image) {
    tags.push(
      { property: 'og:image', content: image },
      { name: 'twitter:image', content: image }
    );
  }

  if (url) {
    tags.push({ property: 'og:url', content: url });
  }

  tags.push(
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title }
  );

  return tags;
}

