import React, { useState, useEffect } from "react";
import { Comment, User } from "../types";
import { formatTimeAgo } from "../utils/formatters";
import { ThumbsUp, MessageSquare, Trash2, Send } from "lucide-react";

interface CommentSectionProps {
  videoId: string;
  currentUser: User;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch {
      // ignore
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          content: newCommentText.trim(),
        }),
      });
      const data = await res.json();
      setComments([data, ...comments]);
      setNewCommentText("");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          content: replyText.trim(),
          parentId,
        }),
      });
      const data = await res.json();
      setComments(
        comments.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), data],
            };
          }
          return c;
        })
      );
      setReplyToId(null);
      setReplyText("");
    } catch {
      // ignore
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      const data = await res.json();
      setComments(
        comments.map((c) => {
          if (c.id === commentId) {
            return { ...c, likesCount: data.likesCount, userLiked: data.userLiked };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, likesCount: data.likesCount, userLiked: data.userLiked } : r
              ),
            };
          }
          return c;
        })
      );
    } catch {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      // ignore
    }
  };

  return (
    <div id="video-comments-section" className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>Comments</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* Write Comment Box */}
      <form onSubmit={handlePostComment} className="flex gap-3 items-start">
        <img
          src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-zinc-700"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 space-y-2">
          <textarea
            rows={2}
            placeholder="Add a friendly comment or question..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1c1c] border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none"
          />
          <div className="flex justify-end gap-2">
            {newCommentText.trim() && (
              <button
                type="button"
                onClick={() => setNewCommentText("")}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!newCommentText.trim() || loading}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="group/comment flex gap-3 text-sm">
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-zinc-800"
              referrerPolicy="no-referrer"
            />

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200 text-xs">{comment.userName}</span>
                <span className="text-[11px] text-zinc-500">{formatTimeAgo(comment.createdAt)}</span>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-1 text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 hover:text-rose-400 transition-colors ${
                    comment.userLiked ? "text-rose-500 font-semibold" : ""
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{comment.likesCount || 0}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>

                {(currentUser.id === comment.userId || currentUser.role === "ADMIN" || currentUser.role === "MODERATOR") && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="opacity-0 group-hover/comment:opacity-100 hover:text-rose-400 transition-all"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reply Box */}
              {replyToId === comment.id && (
                <div className="pt-2 pl-2 border-l-2 border-zinc-800 space-y-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.userName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handlePostReply(comment.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pt-3 pl-3 sm:pl-5 border-l-2 border-zinc-800/80 space-y-3 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5 text-xs">
                      <img
                        src={reply.userAvatar}
                        alt={reply.userName}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">{reply.userName}</span>
                          <span className="text-[10px] text-zinc-500">{formatTimeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-zinc-300">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
