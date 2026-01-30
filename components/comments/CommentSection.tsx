"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { format } from "date-fns";
import { MessageCircle, Reply, Smile, Send, ThumbsUp, LogIn } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Comment {
  _id: string;
  user: string;
  userEmail?: string;
  userImage?: string;
  text: string;
  emoji?: string | null;
  createdAt: Date | string;
  replies?: Comment[];
  likes?: number;
  parentId?: string | null;
}

interface CommentSectionProps {
  postSlug: string;
}

const EMOJI_OPTIONS = [
  "👍",
  "❤️",
  "😊",
  "🎉",
  "🔥",
  "💯",
  "👏",
  "🙌",
  "😄",
  "🤔",
];

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyEmoji, setReplyEmoji] = useState<string | null>(null);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${postSlug}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText,
          emoji: selectedEmoji,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      toast.success("Comment posted!");
      setCommentText("");
      setSelectedEmoji(null);
      setShowEmojiPicker(false);
      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast.error("Please log in to reply");
      return;
    }

    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${postSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText,
          parentId,
          emoji: replyEmoji,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post reply");
      }

      toast.success("Reply posted!");
      setReplyingTo(null);
      setReplyText("");
      setReplyEmoji(null);
      setShowReplyEmojiPicker(null);
      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment._id}
      className={`${isReply ? "ml-8 mt-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4" : ""}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.userImage ? (
              <img
                src={comment.userImage}
                alt={comment.user}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0a73b0] flex items-center justify-center text-white font-semibold">
                {comment.user.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{comment.user}</span>
              {comment.emoji && (
                <span className="text-xl" role="img" aria-label="emoji">
                  {comment.emoji}
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(
                  new Date(comment.createdAt),
                  "MMM dd, yyyy 'at' h:mm a"
                )}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</p>
            <div className="flex items-center gap-4">
              {session && !isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(comment._id);
                    setReplyText("");
                    setReplyEmoji(null);
                  }}
                  className="flex items-center gap-1 text-sm text-[#0a73b0] hover:text-[#2a9bd0] transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                {comment.likes || 0}
              </button>
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitReply(comment._id);
                  }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none resize-none"
                    />
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowReplyEmojiPicker(
                            showReplyEmojiPicker === comment._id
                              ? null
                              : comment._id
                          )
                        }
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {showReplyEmojiPicker === comment._id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setReplyEmoji(emoji);
                                setShowReplyEmojiPicker(null);
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !replyText.trim()}
                      className="px-4 py-2 bg-[#0a73b0] dark:bg-blue-600 text-white rounded-lg hover:bg-[#2a9bd0] dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  {replyEmoji && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: <span className="text-xl">{replyEmoji}</span>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a73b0] dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#0a73b0]" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3 mb-3">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0a73b0] flex items-center justify-center text-white font-semibold">
                  {(session.user?.name || session.user?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                  <span className="text-sm">Add emoji</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {selectedEmoji && (
                  <span className="ml-2 text-xl" role="img" aria-label="selected emoji">
                    {selectedEmoji}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-6 py-2 bg-[#0a73b0] dark:bg-blue-600 text-white rounded-lg hover:bg-[#2a9bd0] dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#0a73b0] dark:bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Join the Conversation
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to add a comment and share your thoughts with the community.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => signIn("google", { callbackUrl: window.location.href })}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => signIn("github", { callbackUrl: window.location.href })}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </button>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-[#0a73b0] dark:bg-blue-600 text-white rounded-lg hover:bg-[#2a9bd0] dark:hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  More Options
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments
            .filter((comment) => !comment.parentId)
            .map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
