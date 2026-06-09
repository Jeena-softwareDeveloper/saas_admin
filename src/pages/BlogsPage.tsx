"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, FileText, Loader2, BookOpen } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, Tr, Th, Td, FilterBar, EmptyState } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

interface Blog {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  content: string;
  author: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBlogs();
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await adminService.deleteBlog(id);
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to delete");
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await adminService.updateBlog(blog.id, { isPublished: !blog.isPublished });
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to toggle status");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title") as string,
      author: (formData.get("author") as string) || null,
      imageUrl: (formData.get("imageUrl") as string) || null,
      content: formData.get("content") as string,
      isPublished: formData.get("isPublished") === "true",
    };

    try {
      if (editBlog) {
        await adminService.updateBlog(editBlog.id, payload);
      } else {
        await adminService.createBlog(payload);
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader
        title="Blogs"
        subtitle="Manage store blog posts and news articles"
        filter={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search blogs by title or author..."
          />
        }
        action={
          <button
            id="add-blog-btn"
            onClick={() => {
              setEditBlog(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <Plus size={15} /> Add Blog
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <Table>
          <TableHeader>
            <Tr>
              <Th>Image</Th>
              <Th>Title</Th>
              <Th>Slug</Th>
              <Th>Author</Th>
              <Th>Status</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <Tr>
                <Td colSpan={7} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block text-indigo-600" />
                </Td>
              </Tr>
            ) : filteredBlogs.length === 0 ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState
                    icon={<BookOpen size={24} />}
                    title="No blogs found"
                    description="Create a new blog post to display it on the store landing page."
                  />
                </Td>
              </Tr>
            ) : (
              filteredBlogs.map((blog) => (
                <Tr key={blog.id}>
                  <Td className="w-16">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-indigo-100/50">
                      {blog.imageUrl ? (
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={15} className="text-indigo-600" />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{blog.title}</p>
                  </Td>
                  <Td className="text-xs text-slate-500 font-mono">/{blog.slug}</Td>
                  <Td className="text-sm text-slate-600">{blog.author || "Anonymous"}</Td>
                  <Td>
                    <button
                      onClick={() => handleTogglePublish(blog)}
                      className="focus:outline-none"
                      title="Click to toggle status"
                    >
                      <span className={blog.isPublished ? "badge-green cursor-pointer" : "badge-gray cursor-pointer"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </span>
                    </button>
                  </Td>
                  <Td className="text-xs text-slate-500">
                    {new Date(blog.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditBlog(blog);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editBlog ? "Edit Blog" : "Add Blog"}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="label">Title *</label>
            <input
              name="title"
              className="input"
              placeholder="e.g. 10 Tips for Healthier Skin"
              defaultValue={editBlog?.title}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Author</label>
              <input
                name="author"
                className="input"
                placeholder="e.g. Jane Doe"
                defaultValue={editBlog?.author || ""}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                name="isPublished"
                className="input"
                defaultValue={editBlog ? String(editBlog.isPublished) : "true"}
              >
                <option value="true">Published</option>
                <option value="false">Draft / Hide</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              name="imageUrl"
              className="input"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              defaultValue={editBlog?.imageUrl || ""}
            />
            {editBlog?.imageUrl && (
              <img
                src={editBlog.imageUrl}
                alt="Preview"
                className="h-20 mt-2 rounded object-cover border border-slate-200"
              />
            )}
          </div>
          <div>
            <label className="label">Content *</label>
            <textarea
              name="content"
              className="input min-h-[180px]"
              placeholder="Write your blog post content here..."
              defaultValue={editBlog?.content}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editBlog ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
