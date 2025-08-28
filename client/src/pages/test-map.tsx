import { AppLayout } from "@/components/layout/app-layout";

export default function TestMapPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Test Map Page</h1>
        <p className="mb-6">This is an extremely simplified test page to diagnose connectivity issues.</p>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Basic Test Element</h2>
          <p>If you can see this content, the basic page rendering is working correctly.</p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="font-medium">Panel 1</h3>
              <p className="text-sm">Simple static content panel.</p>
            </div>
            
            <div className="p-4 bg-blue-100 rounded-lg">
              <h3 className="font-medium">Panel 2</h3>
              <p className="text-sm">Another simple static content panel.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}