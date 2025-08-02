"use client";

import { useState } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Mock data for now
const mockNews = [
  {
    id: 1,
    title: "Major Tech Conference Announced in SF",
    imageUrl: "https://placehold.co/100x60.png",
    category: "Technology",
  },
  {
    id: 2,
    title: "New Space Mission to Explore Jupiter's Moons",
    imageUrl: "https://placehold.co/100x60.png",
    category: "Science",
  },
  {
    id: 3,
    title: "Local Sports Team Wins Championship",
    imageUrl: "https://placehold.co/100x60.png",
    category: "Sports",
  },
];

type NewsArticle = {
  id?: number;
  title: string;
  imageUrl: string;
  category: string;
};

export default function AdminPage() {
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const handleEdit = (article: NewsArticle) => {
    setSelectedArticle(article);
  };
  
  const handleAddNew = () => {
    setSelectedArticle({ title: "", imageUrl: "", category: "" });
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedArticle) return;
    // Logic to save the new/updated article will go here
    console.log("Saving:", selectedArticle);
    // For now, let's just close the form
    setSelectedArticle(null);
  };
  
  const handleDelete = (id: number) => {
    // Logic to delete will go here
    console.log("Deleting article with id:", id);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>News Management</CardTitle>
                        <CardDescription>Add, edit, or remove news articles.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2" /> Add New
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {news.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell>
                                        <Image src={article.imageUrl} alt={article.title} width={100} height={60} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{article.title}</TableCell>
                                    <TableCell>{article.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(article.id!)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            {selectedArticle && (
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedArticle.id ? "Edit Article" : "Add New Article"}</CardTitle>
                        <CardDescription>Fill out the details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="Enter news headline" value={selectedArticle.title} onChange={(e) => setSelectedArticle({...selectedArticle, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g., Technology" value={selectedArticle.category} onChange={(e) => setSelectedArticle({...selectedArticle, category: e.target.value})} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <Input id="image" type="file" />
                                {selectedArticle.imageUrl && (
                                    <div className="pt-2">
                                        <Image src={selectedArticle.imageUrl} alt="Current image" width={120} height={80} className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" type="button" onClick={() => setSelectedArticle(null)}>Cancel</Button>
                                <Button type="submit">Save Article</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </div>
  );
}
