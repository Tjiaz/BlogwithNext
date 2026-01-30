"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import FontFamily from "@tiptap/extension-font-family";
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

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
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

        {/* Media */}
        <div className="flex items-center gap-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <span
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-gray-700`}
              title="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
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
      <div className="min-h-[400px]">
        <EditorContent editor={editor} />
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
