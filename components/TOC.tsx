// components/TOC.tsx

import { useState, useEffect, useRef } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
  position: number;
}

export default function TOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="toc">
      <h2>Table of Contents</h2>
      <ul>
        {headings.map(heading => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={activeId === heading.id ? 'active' : ''}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}