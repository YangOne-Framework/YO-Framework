import React, { useEffect, useState } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  context?: string; // Content context for AI generation
}

const SEO: React.FC<SEOProps> = ({ title, description, image, type = 'website', context }) => {
  const [meta, setMeta] = useState({
    title: `${title} | Heavenly Pathways`,
    description: description || 'Discover amazing tours, treks, and travel experiences with Heavenly Pathways.',
    image: image || 'https://picsum.photos/seed/travel-hero/1200/630',
  });

  useEffect(() => {
    let isMounted = true;



    return () => { isMounted = false; };
  }, [title, context, image, description]);

  useEffect(() => {
    document.title = meta.title;

    const updateTag = (selector: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        const head = document.head;
        el = document.createElement('meta');

        if (selector.includes('name')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute('name', name);
        } else if (selector.includes('property')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) el.setAttribute('property', property);
        }
        head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateTag('meta[name="description"]', meta.description);
    updateTag('meta[property="og:title"]', meta.title);
    updateTag('meta[property="og:description"]', meta.description);
    updateTag('meta[property="og:image"]', meta.image);
    updateTag('meta[property="og:type"]', type);
    updateTag('meta[property="og:url"]', window.location.href);

  }, [meta, type]);

  return null;
};

export default SEO;