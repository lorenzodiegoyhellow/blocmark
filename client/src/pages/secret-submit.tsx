import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { SimpleSecretLocationForm } from "@/components/map/simple-secret-location-form";

export default function SecretSubmitPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Submit a Secret Location</h1>
          
          <Card className="p-4">
            <SimpleSecretLocationForm 
              standalone={true}
              onSuccess={() => {
                console.log("Secret location submitted successfully!");
              }}
            />
            
            <CardFooter className="flex flex-col space-y-2 items-start border-t mt-6 pt-4">
              <p className="text-sm text-muted-foreground">
                All submissions are reviewed before appearing on the map. Please ensure the location is publicly accessible.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = "/admin?tab=secret-corners"}
              >
                View Admin Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}