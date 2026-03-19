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
      url: baseUrl + '/ui',
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: baseUrl + '/about',
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: baseUrl + '/ui/about',
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: baseUrl + '/ui/piscolas',
      changeFrequency: 'monthly',
      priority: 0.9
    }
  ];
}
