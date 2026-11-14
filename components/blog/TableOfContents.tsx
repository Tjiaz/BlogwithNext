"use client";

import { useEffect, useRef, useState } from "react";
import type { TocHeading } from "@/lib/article-toc";
import { ChevronDown, List } from "lucide-react";

/** Headings above this line (below the sticky nav) count as the current section. */
const READING_LINE = 128;

interface TableOfContentsProps {
  headings: TocHeading[];
  /** Rail sits in the right column. Inline is the collapsible list on small screens. */
  variant?: "rail" | "inline";
}

export default function TableOfContents({
  headings,
  variant = "rail",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const [marker, setMarker] = useState({ top: 0, height: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const activeIdRef = useRef("");

  useEffect(() => {
    if (!headings.length) return;

    let frame = 0;
    const update = () => {
      let current = headings[0]?.id ?? "";
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= READING_LINE) {
          current = heading.id;
        } else {
          break;
        }
      }
      if (activeIdRef.current !== current) {
        activeIdRef.current = current;
        setActiveId(current);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !activeId) return;
    const link = list.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`,
    );
    if (!link) return;

    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setMarker({
      top: linkRect.top - listRect.top + list.scrollTop,
      height: linkRect.height,
    });

    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [activeId, headings]);

  if (!headings.length) return null;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = window.scrollY + el.getBoundingClientRect().top - READING_LINE;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    activeIdRef.current = id;
    setActiveId(id);
  };

  const list = (
    <ul
      ref={listRef}
      className="relative border-l border-gray-200 dark:border-gray-700 overflow-y-auto pr-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-px w-0.5 rounded-full bg-[#0a73b0] dark:bg-blue-400 transition-[top,height] duration-300 ease-out motion-reduce:transition-none"
        style={{
          top: marker.top,
          height: marker.height,
          opacity: marker.height ? 1 : 0,
        }}
      />
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        const indent =
          heading.level === 4 ? "pl-9" : heading.level === 3 ? "pl-6" : "pl-3";
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              data-toc-id={heading.id}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => handleClick(event, heading.id)}
              className={`block py-1.5 pr-2 text-sm leading-snug transition-colors ${indent} ${
                heading.level > 2 ? "text-[13px]" : ""
              } ${
                isActive
                  ? "text-[#0a73b0] dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#0a73b0] dark:hover:text-blue-400"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "inline") {
    return (
      <details className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <List className="w-4 h-4 text-[#0a73b0] dark:text-blue-400" />
            Table of Contents
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-3 pb-3 max-h-72 overflow-hidden flex">{list}</div>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="flex max-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-3 flex items-center gap-2">
        <List className="h-4 w-4 shrink-0 text-[#0a73b0] dark:text-blue-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Table of Contents
        </h2>
      </div>
      {list}
    </nav>
  );
}
