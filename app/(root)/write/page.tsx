import { BlogEditor } from "@/components/editor/BlogEditor";
export const instant = false
export const metadata = {
  title: "New Story — Blogology Studio",
  description: "Write and edit your story on Blogology",
};

export default function WriteNewPage() {
  return <BlogEditor />;
}

