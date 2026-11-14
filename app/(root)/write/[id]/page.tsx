import { notFound } from "next/navigation";
import { postService } from "@/lib/services/post.services";
import { BlogEditor } from "@/components/editor/BlogEditor";

interface WriteEditPageProps {
  params: Promise<{ id: string }>;
}

export const instant = false

export async function generateMetadata({ params }: WriteEditPageProps) {
  const { id } = await params;
  const post = await postService.getPostById(id);

  return {
    title: post?.title ? `${post.title} — Blogology Studio` : "Edit Story — Blogology Studio",
  };
}

export default async function WriteEditPage({ params }: WriteEditPageProps) {
  const { id } = await params;
  const post = await postService.getPostById(id);

  if (!post) {
    notFound();
  }

  return <BlogEditor initialPost={post} postId={id} />;
}

