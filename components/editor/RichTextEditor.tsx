"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import FontFamily from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Strike } from "@tiptap/extension-strike";
import { Highlight } from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Video,
  Type,
  Minus,
  List,
  ListOrdered,
  Code,
  Code2,
  Table as TableIcon,
  Plus,
  Trash2,
  Quote,
  Strikethrough,
  Highlighter,
} from "lucide-react";
import { useState, useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your article...",
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        // Disable strike since we're using the separate extension
        strike: false,
        // Disable blockquote since we're using the separate extension
        blockquote: false,
        // Disable horizontalRule since we're using the separate extension
        horizontalRule: false,
      }),
      FontFamily,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#0a73b0] underline hover:text-[#2a9bd0]",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
      Blockquote,
      HorizontalRule,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "ProseMirror focus:outline-none",
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = linkUrl || previousUrl;

    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setShowLinkDialog(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageDialog(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  const addVideo = useCallback(() => {
    if (!editor || !videoUrl) return;

    // Extract video ID from YouTube/Vimeo URLs or use embed URL
    let embedUrl = videoUrl;
    if (videoUrl.includes("youtube.com/watch")) {
      const videoId = videoUrl.split("v=")[1]?.split("&")[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (videoUrl.includes("youtu.be/")) {
      const videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (videoUrl.includes("vimeo.com")) {
      const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Insert iframe for video
    editor
      .chain()
      .focus()
      .insertContent(
        `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      )
      .run();
    setShowVideoDialog(false);
    setVideoUrl("");
  }, [editor, videoUrl]);

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      // Reset input so same file can be selected again
      e.target.value = "";

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error: any) {
        console.error("Image upload failed:", error);
        alert(error.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white relative">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-2">
        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("bold")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("italic")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("underline")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("strike")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("highlight")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        {/* Font Family */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <select
            onChange={(e) => {
              const font = e.target.value;
              if (font) {
                editor.chain().focus().setFontFamily(font).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a73b0]"
            title="Font Family"
            defaultValue=""
          >
            <option value="">Default</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("bulletList")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("orderedList")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Code Blocks */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("code")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("codeBlock")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>

        {/* Blockquote & Horizontal Rule */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("blockquote")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Table Controls */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("table")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {editor.isActive("table") && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Column Before"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Column After"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Row Before"
              >
                <Plus className="w-3 h-3 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Row After"
              >
                <Plus className="w-3 h-3 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Delete Column"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Delete Row"
              >
                <Trash2 className="w-3 h-3 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600"
                title="Delete Table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => {
              const url = editor.getAttributes("link").href;
              setLinkUrl(url || "");
              setShowLinkDialog(true);
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("link")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Strike & Highlight */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("strike")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("highlight")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        {/* Blockquote & Horizontal Rule */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive("blockquote")
                ? "bg-[#0a73b0] text-white"
                : "text-gray-700"
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Table Controls */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => {
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {editor.isActive("table") && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Column Before"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Column After"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Delete Column"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Row Before"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Add Row After"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Delete Row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600"
                title="Delete Table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Media */}
        <div className="flex items-center gap-1">
          <label className={`cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <span
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 inline-flex items-center`}
              title={uploading ? "Uploading..." : "Upload Image"}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowImageDialog(true)}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insert Image URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowVideoDialog(true)}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insert Video"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] prose prose-lg max-w-none dark:prose-invert">
        <EditorContent editor={editor} />
        <style jsx global>{`
          .ProseMirror {
            padding: 1rem;
            min-height: 400px;
            outline: none;
          }
          .ProseMirror table {
            border-collapse: collapse;
            margin: 1rem 0;
            table-layout: fixed;
            width: 100%;
            overflow: hidden;
          }
          .ProseMirror table td,
          .ProseMirror table th {
            min-width: 1em;
            border: 1px solid #d1d5db;
            padding: 0.5rem 1rem;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
          }
          .ProseMirror table th {
            font-weight: 600;
            background-color: #f3f4f6;
          }
          .dark .ProseMirror table th {
            background-color: #374151;
          }
          .ProseMirror table .selectedCell:after {
            z-index: 2;
            position: absolute;
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background: rgba(10, 115, 176, 0.1);
            pointer-events: none;
          }
          .ProseMirror table .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: -2px;
            width: 4px;
            background-color: #0a73b0;
            pointer-events: none;
          }
          .ProseMirror blockquote {
            border-left: 4px solid #0a73b0;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #6b7280;
          }
          .ProseMirror hr {
            border: none;
            border-top: 2px solid #d1d5db;
            margin: 2rem 0;
          }
          .ProseMirror mark {
            background-color: #fef08a;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
          }
          .dark .ProseMirror mark {
            background-color: #854d0e;
          }
        `}</style>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setShowLinkDialog(false)}
          />
          <div className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '300px' }}>
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0a73b0]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLink();
                  }
                  if (e.key === "Escape") {
                    setShowLinkDialog(false);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addLink}
                  className="px-4 py-2 bg-[#0a73b0] text-white rounded hover:bg-[#2a9bd0]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkDialog(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setShowImageDialog(false)}
          />
          <div className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '300px' }}>
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0a73b0]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addImage();
                  }
                  if (e.key === "Escape") {
                    setShowImageDialog(false);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-[#0a73b0] text-white rounded hover:bg-[#2a9bd0]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setShowVideoDialog(false)}
          />
          <div className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '300px' }}>
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube or Vimeo URL"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0a73b0]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addVideo();
                  }
                  if (e.key === "Escape") {
                    setShowVideoDialog(false);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-4 py-2 bg-[#0a73b0] text-white rounded hover:bg-[#2a9bd0]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
