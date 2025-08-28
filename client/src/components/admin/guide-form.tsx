import React, { memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SimpleImageUpload } from "./simple-image-upload";

interface GuideFormData {
  title: string;
  author: string;
  description: string;
  categoryId: string;
  difficulty: string;
  timeToRead: string;
  status: string;
  featured: boolean;
  coverImage?: string;
  content: string;
}

interface GuideFormProps {
  formData: GuideFormData;
  setFormData: React.Dispatch<React.SetStateAction<GuideFormData>>;
  categories: { id: string; title: string }[];
  difficultyLevels: string[];
}

export const GuideForm = memo(({ formData, setFormData, categories, difficultyLevels }: GuideFormProps) => {

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guide-title">Title</Label>
          <Input
            id="guide-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Guide title"
          />
        </div>
        <div>
          <Label htmlFor="guide-author">Author</Label>
          <Input
            id="guide-author"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="Author name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guide-description">Description</Label>
        <Textarea
          id="guide-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the guide"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="guide-category">Category</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => {
              console.log("Category changed from", formData.categoryId, "to", value);
              setFormData(prev => ({ ...prev, categoryId: value }));
            }}
          >
            <SelectTrigger id="guide-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="guide-difficulty">Difficulty</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger id="guide-difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="guide-time">Reading Time</Label>
          <Input
            id="guide-time"
            value={formData.timeToRead}
            onChange={(e) => setFormData(prev => ({ ...prev, timeToRead: e.target.value }))}
            placeholder="e.g., 15 min"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guide-status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger id="guide-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="guide-featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="guide-featured">Featured Guide</Label>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <Label>Cover Image</Label>
        <SimpleImageUpload
          currentImage={formData.coverImage}
          onImageChange={(imageUrl) => {
            setFormData(prev => ({ ...prev, coverImage: imageUrl }));
          }}
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <Label>Content</Label>
        <RichTextEditor
          content={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="Write your guide content..."
        />
      </div>
    </div>
  );
});

GuideForm.displayName = 'GuideForm';