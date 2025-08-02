
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getNewsArticle } from '@/ai/flows/news-flow';
import { NewsArticle } from '@/ai/schemas';
import { CalendarIcon, TagIcon, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// A simple markdown to HTML converter
const Markdown = ({ content }: { content: string }) => {
    const html = useMemo(() => {
        return content
            .split('\n\n') // Split by double newline for paragraphs
            .map(p => `<p class="mb-4 text-lg leading-relaxed">${p}</p>`)
            .join('');
    }, [content]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function NewsArticlePage({ params, searchParams }: { params: { id: string }, searchParams: { title: string } }) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const articleTitle = decodeURIComponent(searchParams.title || '');

  useEffect(() => {
    if (!params.id || !articleTitle) return;
    
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const articleData = await getNewsArticle(params.id, articleTitle);
        setArticle(articleData);
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [params.id, articleTitle]);
  
  if (loading) {
    return (
        <div className="min-h-screen bg-muted/40 animate-pulse">
            <header className="bg-background border-b py-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="h-8 w-40 bg-muted-foreground/20 rounded"/>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-lg">
                    <div className="h-10 w-3/4 bg-muted-foreground/20 rounded mb-4"/>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                        <div className="h-5 w-24 bg-muted-foreground/20 rounded"/>
                        <div className="h-5 w-20 bg-muted-foreground/20 rounded"/>
                    </div>
                     <div className="w-full h-96 bg-muted rounded-lg mb-8"/>
                    <div className="space-y-4">
                        <div className="h-6 w-full bg-muted-foreground/20 rounded"/>
                        <div className="h-6 w-full bg-muted-foreground/20 rounded"/>
                        <div className="h-6 w-5/6 bg-muted-foreground/20 rounded"/>
                    </div>
                </div>
            </main>
        </div>
    )
  }
  
  if (!article) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40">
            <p className="text-2xl text-destructive-foreground mb-4">Article not found.</p>
            <Link href="/">
                <Button>Go back to Home</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b py-4 sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <article className="max-w-4xl mx-auto bg-card p-6 sm:p-10 rounded-lg shadow-xl">
                 <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4 leading-tight">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center space-x-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{article.publishedDate}</span>
                    </div>
                    <div className="flex items-center">
                        <TagIcon className="mr-2 h-4 w-4" />
                        <span>{article.category}</span>
                    </div>
                </div>
                
                <Image
                    src={article.imageDataUri}
                    alt={article.title}
                    width={800}
                    height={450}
                    className="w-full h-auto rounded-lg mb-8 object-cover"
                    priority
                />

                <div className="prose prose-lg max-w-none text-card-foreground">
                    <Markdown content={article.content} />
                </div>
            </article>
        </main>
    </div>
  );
}
