"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, X, Loader2, Check, ExternalLink, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCreateDraftMutation,
  useUpdateDraftMutation,
  usePublishPostMutation,
  useUnpublishPostMutation,
  useDeletePostMutation,
} from "@/hooks/mutations/usePostMutations";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import type { Post, PostStatus } from "@/types/post";

const BlockNoteEditor = dynamic(
  () =>
    import("@/components/editor/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-100 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Initializing editor...
      </div>
    ),
  },
);

interface BlogEditorProps {
  initialPost?: Post | null;
  postId?: string;
}

export function BlogEditor({ initialPost, postId }: BlogEditorProps) {
  const router = useRouter();
  const { mutateAsync: createDraft } = useCreateDraftMutation();
  const { mutateAsync: updateDraft } = useUpdateDraftMutation();
  const { mutateAsync: publishPost } = usePublishPostMutation();
  const { mutateAsync: unpublishPost } = useUnpublishPostMutation();
  const { mutateAsync: deletePost } = useDeletePostMutation();

  const [activePostId, setActivePostId] = React.useState<string | null>(
    initialPost?.id || postId || null,
  );
  const [status, setStatus] = React.useState<PostStatus>(
    initialPost?.status || "DRAFT",
  );

  const [title, setTitle] = React.useState<string>(initialPost?.title || "");
  const [content, setContent] = React.useState<any>(initialPost?.content || []);
  const [tags, setTags] = React.useState<string[]>(initialPost?.tags || []);
  const [coverImage, setCoverImage] = React.useState<string | null>(
    initialPost?.coverImage || null,
  );

  const [tagInput, setTagInput] = React.useState("");
  const [isUploadingCover, setIsUploadingCover] = React.useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = React.useState(false);
  const [blockNoteEditor, setBlockNoteEditor] = React.useState<any>(null);

  // Action loading states
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isUnpublishing, setIsUnpublishing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Autosave status
  const [saveStatus, setSaveStatus] = React.useState<
    "Saved" | "Saving…" | "Unsaved" | "Error"
  >("Saved");

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const titleTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const isCreatingDraftRef = React.useRef<boolean>(false);

  // Auto-resize title textarea dynamically with content and width changes
  const adjustTitleHeight = React.useCallback(() => {
    const el = titleTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    adjustTitleHeight();
  }, [title, adjustTitleHeight]);

  // Recalculate title height on any container or viewport resize
  React.useEffect(() => {
    const el = titleTextareaRef.current;
    if (!el) return;

    adjustTitleHeight();

    const observer = new ResizeObserver(() => {
      adjustTitleHeight();
    });

    if (el.parentElement) {
      observer.observe(el.parentElement);
    }
    window.addEventListener("resize", adjustTitleHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", adjustTitleHeight);
    };
  }, [adjustTitleHeight]);

  // References to always access the latest values inside callbacks
  const stateRef = React.useRef({
    title,
    content,
    tags,
    coverImage,
    activePostId,
  });

  React.useEffect(() => {
    stateRef.current = {
      title,
      content,
      tags,
      coverImage,
      activePostId,
    };
  }, [title, content, tags, coverImage, activePostId]);

  // Compute live word count & reading time
  const wordCount = React.useMemo(() => {
    if (!content) return 0;
    let text = "";
    const walk = (node: any) => {
      if (!node) return;
      if (typeof node === "string") {
        text += " " + node;
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === "object") {
        if (typeof node.text === "string") {
          text += " " + node.text;
        }
        Object.keys(node).forEach((k) => {
          if (k !== "text" && typeof node[k] === "object") {
            walk(node[k]);
          }
        });
      }
    };
    walk(content);
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Minimum publish criteria:
  // - Title: min 5 words
  // - Cover image: required
  // - Tags: min 3 tags
  // - Content: min 200 words
  const titleWordCount = React.useMemo(() => {
    return title.trim().split(/\s+/).filter(Boolean).length;
  }, [title]);

  const { canPublish, missingRequirements } = React.useMemo(() => {
    const missing: string[] = [];

    if (titleWordCount < 5) {
      missing.push(`Title needs at least 5 words (${titleWordCount}/5)`);
    }
    if (!coverImage || !coverImage.trim()) {
      missing.push("A cover image is required");
    }
    if (tags.length < 3) {
      missing.push(`At least 3 tags required (${tags.length}/3)`);
    }
    if (wordCount < 200) {
      missing.push(`Story needs at least 200 words (${wordCount}/200)`);
    }

    return {
      canPublish: missing.length === 0,
      missingRequirements: missing,
    };
  }, [titleWordCount, coverImage, tags.length, wordCount]);

  // Trigger autosave (3s debounced)
  const triggerAutosave = React.useCallback(() => {
    setSaveStatus("Saving…");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const current = stateRef.current;

      // 1. If draft doesn't exist yet, create it on first keystroke
      if (!current.activePostId) {
        if (isCreatingDraftRef.current) return;
        isCreatingDraftRef.current = true;

        try {
          const res = await createDraft({
            title: current.title.trim() || "Untitled Post",
            content: current.content,
            tags: current.tags,
            coverImage: current.coverImage,
          });

          if (res.success && res.data) {
            const newId = res.data.id;
            setActivePostId(newId);
            stateRef.current.activePostId = newId;
            // Optimistically update URL to /write/:id
            window.history.replaceState(null, "", `/write/${newId}`);
            setSaveStatus("Saved");
          } else {
            setSaveStatus("Error");
          }
        } catch {
          setSaveStatus("Error");
        } finally {
          isCreatingDraftRef.current = false;
        }
        return;
      }

      // 2. Draft already exists -> update via PATCH
      try {
        const res = await updateDraft({
          postId: current.activePostId,
          dto: {
            title: current.title.trim() || "Untitled Post",
            content: current.content,
            tags: current.tags,
            coverImage: current.coverImage,
          },
        });

        if (res.success) {
          setSaveStatus("Saved");
        } else {
          setSaveStatus("Error");
        }
      } catch {
        setSaveStatus("Error");
      }
    }, 3000);
  }, [createDraft, updateDraft]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handlers
  const handleTitleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setTitle(e.target.value);
    triggerAutosave();
  };

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    triggerAutosave();
  };

  const commitTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      const updated = [...tags, trimmed];
      setTags(updated);
      setTagInput("");
      triggerAutosave();
      return true;
    }
    return false;
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const segments = val.split(",");
      const toAdd = segments.slice(0, -1);
      const remainder = segments[segments.length - 1];

      let updated = [...tags];
      for (const seg of toAdd) {
        const trimmed = seg.trim().toLowerCase().replace(/^#/, "");
        if (trimmed && !updated.includes(trimmed) && updated.length < 5) {
          updated.push(trimmed);
        }
      }
      setTags(updated);
      setTagInput(remainder);
      triggerAutosave();
    } else {
      setTagInput(val);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      const updated = tags.slice(0, -1);
      setTags(updated);
      triggerAutosave();
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      commitTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    triggerAutosave();
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Cover image must not exceed 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (coverImage) {
        formData.append("oldUrl", coverImage);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload cover image.");
        return;
      }

      if (data.url || data.data?.url) {
        const uploadedUrl = data.url || data.data?.url;
        setCoverImage(uploadedUrl);
        triggerAutosave();
      }
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCover = async () => {
    const currentCover = coverImage;
    setCoverImage(null);
    triggerAutosave();

    if (currentCover) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentCover }),
        });
      } catch (err) {
        console.error("Failed to delete removed cover image:", err);
      }
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsPublishing(true);
    try {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      let targetId = stateRef.current.activePostId;
      const current = stateRef.current;

      if (!targetId) {
        const createRes = await createDraft({
          title: current.title.trim() || "Untitled Post",
          content: current.content,
          tags: current.tags,
          coverImage: current.coverImage,
        });

        if (!createRes.success || !createRes.data) {
          setSaveStatus("Error");
          return;
        }
        targetId = createRes.data.id;
        setActivePostId(targetId);
        stateRef.current.activePostId = targetId;
      } else {
        await updateDraft({
          postId: targetId,
          dto: {
            title: current.title.trim() || "Untitled Post",
            content: current.content,
            tags: current.tags,
            coverImage: current.coverImage,
          },
        });
      }

      const res = await publishPost(targetId);
      if (res.success) {
        setStatus("PUBLISHED");
        setSaveStatus("Saved");
        setPublishSuccessOpen(true);
      } else {
        setSaveStatus("Error");
      }
    } catch (err) {
      console.error("Publish error:", err);
      setSaveStatus("Error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    const targetId = stateRef.current.activePostId;
    if (!targetId) return;
    setIsUnpublishing(true);
    try {
      const res = await unpublishPost(targetId);
      if (res.success) {
        setStatus("DRAFT");
      }
    } catch (err) {
      console.error("Unpublish error:", err);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleDelete = async () => {
    const targetId = stateRef.current.activePostId;
    if (!targetId) return;
    setIsDeleting(true);
    try {
      const res = await deletePost(targetId);
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 sm:px-10 md:px-14 h-14 flex items-center justify-between">
          {/* Left: Go back & Save Indicator */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Save indicator */}
            <div className="flex items-center gap-1.5 text-xs select-none">
              {saveStatus === "Saving…" && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Saving…</span>
                </>
              )}
              {saveStatus === "Saved" && (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-muted-foreground">Saved</span>
                </>
              )}
              {saveStatus === "Error" && (
                <span className="text-destructive font-medium">Failed to save</span>
              )}
            </div>
          </div>

          {/* Right: Word count & Reading time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium select-none">
            <span>{wordCount} words</span>
            <span className="text-muted-foreground/30">•</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </header>

      {/* Hidden file input for cover upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />

      {/* Main Story Canvas */}
      <main className="flex-1 max-w-4xl lg:max-w-5xl mx-auto w-full px-6 sm:px-10 md:px-14 py-8 md:py-12 flex flex-col gap-6">
        {/* 1. Image Section */}
        <div className="w-full">
          {coverImage ? (
            <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden group border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Story Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full h-9 px-4 text-xs bg-white text-black hover:bg-neutral-200"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  {isUploadingCover ? "Uploading…" : "Change Image"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 px-4 text-xs bg-black/60 text-white border-white/20 hover:bg-destructive hover:border-transparent"
                  onClick={handleRemoveCover}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCover}
              className="w-full h-36 sm:h-44 rounded-2xl border-2 border-dashed border-border hover:border-foreground/30 bg-secondary/30 hover:bg-secondary/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer group"
            >
              <div className="p-2.5 rounded-full bg-secondary group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="text-center">
                <span className="text-xs sm:text-sm font-medium">
                  {isUploadingCover
                    ? "Uploading cover image…"
                    : "Upload cover image (required to publish)"}
                </span>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  PNG, JPG, WebP or GIF (max 2MB)
                </p>
              </div>
            </button>
          )}
        </div>

        {/* 2. Tags Section (below image section) */}
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-border/60 bg-secondary/20 focus-within:border-foreground/30 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1 mr-1 font-medium select-none">
              <span>Tags ({tags.length}/3 min):</span>
            </div>

            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground font-medium border border-border/50"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive transition-colors ml-0.5"
                  title={`Remove #${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleAddTag}
                onBlur={handleTagInputBlur}
                placeholder={
                  tags.length === 0
                    ? "Add at least 3 tags (press comma or enter)..."
                    : tags.length < 3
                    ? `Add ${3 - tags.length} more tag${3 - tags.length > 1 ? "s" : ""}...`
                    : "Add more (max 5)..."
                }
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 border-none outline-none focus:ring-0 px-2 py-1 min-w-[160px]"
              />
            )}
          </div>
        </div>

        {/* 3. Editor Section (Title + BlockNote Editor) */}
        <div className="w-full flex flex-col gap-4 pt-2">
          {/* Story Title */}
          <div className="w-full">
            <textarea
              ref={titleTextareaRef}
              rows={1}
              value={title}
              style={{ fieldSizing: "content" } as React.CSSProperties}
              onChange={(e) => {
                handleTitleChange(e);
                adjustTitleHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              placeholder="Story title (min 5 words)..."
              className="w-full bg-transparent font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-foreground placeholder:text-muted-foreground/30 border-none outline-none focus:ring-0 px-0 tracking-tight resize-none overflow-hidden break-words leading-tight [field-sizing:content]"
            />
          </div>

          {/* BlockNote Rich Text Editor */}
          <div className="w-full">
            <BlockNoteEditor
              initialContent={initialPost?.content}
              onChange={handleContentChange}
              onEditorReady={setBlockNoteEditor}
            />
          </div>
        </div>
      </main>

      {/* Floating Action Tab Bar */}
      <EditorToolbar
        postId={activePostId}
        status={status}
        canPublish={canPublish}
        missingRequirements={missingRequirements}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDelete={handleDelete}
        isPublishing={isPublishing}
        isUnpublishing={isUnpublishing}
        isDeleting={isDeleting}
      />

      {/* Publish Success Modal */}
      <Dialog open={publishSuccessOpen} onOpenChange={setPublishSuccessOpen}>
        <DialogContent className="max-w-md text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mb-4">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="text-xl font-semibold">Story Published!</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Your story is now live and published on Blogology. Readers can discover and read your post.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5 mt-6 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-1/2 rounded-full gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                const target = activePostId || initialPost?.id || postId;
                if (target) {
                  router.push(`/posts/${target}`);
                }
              }}
              className="w-full sm:w-1/2 rounded-full gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              View Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
