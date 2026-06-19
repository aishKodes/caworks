import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/data/blogPosts";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-charcoal-900/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative h-44 overflow-hidden">
        <Image src={post.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/55 to-transparent" />
        <p className="absolute bottom-4 left-4 rounded-full bg-white/92 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 backdrop-blur">{post.category}</p>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold tracking-tight text-charcoal-900">{post.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-muted">{post.readingTime}</span>
          <span className="font-semibold text-brand-700 transition group-hover:translate-x-1">Read guide</span>
        </div>
      </div>
    </Link>
  );
}
