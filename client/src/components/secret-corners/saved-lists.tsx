import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bookmark, FolderPlus, Trash2, Map, Lock, Globe, Plus, PencilLine, BookmarkCheck, Share2 } from 'lucide-react';

// Schema for creating/editing a location list
const locationListSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  isPrivate: z.boolean().default(false),
});

interface SavedLocation {
  id: number;
  name: string;
  image: string;
  location: string;
}

interface LocationList {
  id: number;
  name: string;
  isPrivate: boolean;
  locationCount: number;
  previewImages: string[];
}

interface SavedListsProps {
  lists: LocationList[];
  locations: {
    [listId: string]: SavedLocation[];
  };
  onCreateList: (data: z.infer<typeof locationListSchema>) => void;
  onDeleteList: (listId: number) => void;
  onEditList: (listId: number, data: z.infer<typeof locationListSchema>) => void;
  onRemoveLocation: (listId: number, locationId: number) => void;
  onShareList: (listId: number) => void;
}

export function SavedLists({
  lists,
  locations,
  onCreateList,
  onDeleteList,
  onEditList,
  onRemoveLocation,
  onShareList
}: SavedListsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingList, setEditingList] = useState<LocationList | null>(null);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof locationListSchema>>({
    resolver: zodResolver(locationListSchema),
    defaultValues: {
      name: "",
      isPrivate: false,
    },
  });
  
  const handleCreate = (data: z.infer<typeof locationListSchema>) => {
    if (editingList) {
      onEditList(editingList.id, data);
      setEditingList(null);
    } else {
      onCreateList(data);
    }
    setShowCreateDialog(false);
    form.reset();
  };
  
  const handleEditClick = (list: LocationList) => {
    setEditingList(list);
    form.reset({
      name: list.name,
      isPrivate: list.isPrivate,
    });
    setShowCreateDialog(true);
  };
  
  const handleShowLocations = (listId: number) => {
    setSelectedList(listId);
  };
  
  const handleBackToLists = () => {
    setSelectedList(null);
  };
  
  return (
    <div className="py-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Saved Lists</h2>
          <p className="text-muted-foreground">
            Organize and manage your favorite secret locations
          </p>
        </div>
        <Button onClick={() => {
          setEditingList(null);
          form.reset({
            name: "",
            isPrivate: false,
          });
          setShowCreateDialog(true);
        }}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </div>
      
      {selectedList !== null ? (
        <div>
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBackToLists}>
              <Bookmark className="h-4 w-4 mr-2" />
              Back to Lists
            </Button>
          </div>
          
          {locations[selectedList] && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {lists.find(l => l.id === selectedList)?.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onShareList(selectedList)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(lists.find(l => l.id === selectedList)!)}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit List
                  </Button>
                </div>
              </div>
              
              {locations[selectedList].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {locations[selectedList].map(location => (
                    <Card key={location.id} className="overflow-hidden h-full group">
                      <div className="relative">
                        <AspectRatio ratio={3/2}>
                          <img 
                            src={location.image} 
                            alt={location.name} 
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </AspectRatio>
                        
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveLocation(selectedList, location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <CardContent className="p-3">
                        <h4 className="font-medium truncate">{location.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{location.location}</p>
                      </CardContent>
                      
                      <CardFooter className="pt-0 pb-3 px-3">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={`/secret-corners/location/${location.id}`}>
                            <Map className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No saved locations</h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding locations to this list while exploring
                  </p>
                  <Button asChild>
                    <a href="/secret-corners">
                      <Map className="h-4 w-4 mr-2" />
                      Explore Locations
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lists.length > 0 ? (
            lists.map(list => (
              <Card key={list.id} className="overflow-hidden h-full hover:shadow-md transition-shadow">
                <div onClick={() => handleShowLocations(list.id)} className="cursor-pointer">
                  <div className="relative">
                    {list.previewImages.length > 0 ? (
                      <div className="aspect-video grid grid-cols-2 grid-rows-2 gap-0.5 bg-muted overflow-hidden">
                        {list.previewImages.slice(0, 4).map((image, i) => (
                          <div key={i} className="bg-muted overflow-hidden">
                            <img src={image} alt="" className="object-cover w-full h-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <AspectRatio ratio={16/9} className="bg-muted flex items-center justify-center">
                        <Bookmark className="h-12 w-12 text-muted-foreground opacity-20" />
                      </AspectRatio>
                    )}
                    
                    {list.isPrivate && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{list.name}</h3>
                      {list.isPrivate ? (
                        <Lock className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.locationCount} {list.locationCount === 1 ? 'location' : 'locations'}
                    </p>
                  </CardContent>
                </div>
                
                <Separator />
                
                <CardFooter className="p-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleEditClick(list)}
                  >
                    <PencilLine className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => onDeleteList(list.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border rounded-lg">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No saved lists</h3>
              <p className="text-muted-foreground mb-4">
                Create lists to organize your favorite secret locations
              </p>
              <Button onClick={() => {
                setEditingList(null);
                form.reset({
                  name: "",
                  isPrivate: false,
                });
                setShowCreateDialog(true);
              }}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </div>
          )}
          
          {/* "Create New" card */}
          <Card 
            className="border-dashed bg-muted/30 flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {
              setEditingList(null);
              form.reset({
                name: "",
                isPrivate: false,
              });
              setShowCreateDialog(true);
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">Create New List</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Create/Edit List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingList ? "Edit List" : "Create New List"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Favorite Spots" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private List</FormLabel>
                      <FormDescription>
                        Only you can see private lists
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">{editingList ? "Save Changes" : "Create List"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}