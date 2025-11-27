import { type MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://iny.one';

  return [
    {
      url: baseUrl,
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: baseUrl + '/about',
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];
}