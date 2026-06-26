import { createClient } from '@/lib/supabase/client';
import { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://vantage-manage.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const { data: vendors } = await supabase
    .from('vendors')
    .select('slug, updated_at')
    

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/vendors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const vendorRoutes: MetadataRoute.Sitemap = (vendors || []).map((v) => ({
    url: `${BASE_URL}/vendors/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...vendorRoutes, ...categoryRoutes];
}
