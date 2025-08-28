import { TestUpload } from "@/components/search/test-upload";

export default function ImageUploadTestPage() {
  return (
    <div className="container py-10 mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Image Upload Test Page</h1>
      <p className="mb-6 text-muted-foreground">
        This page provides a simple interface to test image uploading and processing logic.
        Test various image formats and sizes to see how the system handles them.
      </p>
      
      <TestUpload />
    </div>
  );
}