import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Users, MessageSquare, Heart, Share2, Calendar, Award } from "lucide-react";
import { Link } from "wouter";

export default function CommunityPage() {
  const communityValues = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Inclusivity",
      description: "We welcome creators and space owners from all backgrounds, fostering a diverse community where everyone feels valued and respected."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Open Communication",
      description: "Clear, honest communication between hosts and guests is the foundation of our community, ensuring expectations are aligned."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Mutual Respect",
      description: "We expect all community members to treat each other with respect, consideration, and professionalism."
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Knowledge Sharing",
      description: "Our thriving community shares insights, tips, and best practices to help everyone succeed."
    }
  ];

  const events = [
    {
      title: "Blocmark Creator Meetup - Los Angeles",
      date: "March 15, 2025",
      description: "Connect with fellow creators and property owners in the Los Angeles area. Share experiences, network, and learn from industry experts."
    },
    {
      title: "Virtual Photography Workshop",
      date: "April 10, 2025",
      description: "Join professional photographers for tips on maximizing location potential and capturing stunning images in various spaces."
    },
    {
      title: "Host Success Stories Webinar",
      date: "May 5, 2025",
      description: "Hear from our top-rated hosts as they share their strategies for creating exceptional guest experiences and maximizing bookings."
    }
  ];

  const featuredMembers = [
    {
      name: "Sarah Johnson",
      role: "Photographer & Host",
      achievement: "Top-rated host with over 100 5-star reviews",
      location: "New York, NY"
    },
    {
      name: "Marcus Williams",
      role: "Production Designer",
      achievement: "Featured in Creative Spaces Magazine",
      location: "Los Angeles, CA"
    },
    {
      name: "Elena Rodriguez",
      role: "Event Planner & Space Owner",
      achievement: "Community Ambassador of the Year",
      location: "Miami, FL"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Join Our Creative Community</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with creators, hosts, and space enthusiasts. Share experiences, learn from others, and be part of a thriving network of like-minded professionals.
            </p>
          </div>

          {/* Community Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Our Community Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityValues.map((value, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6 flex flex-col">
                    <div className="mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator className="my-10" />

          {/* Upcoming Events */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Upcoming Community Events</h2>
            <div className="space-y-6">
              {events.map((event, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">{event.title}</h3>
                        <p className="text-sm text-primary font-medium mb-2">{event.date}</p>
                        <p className="text-muted-foreground">{event.description}</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button>View All Events</Button>
            </div>
          </section>

          <Separator className="my-10" />

          {/* Featured Community Members */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Featured Community Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMembers.map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-4 w-4 text-primary mr-1" />
                      <p className="text-xs">{member.achievement}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Join the Community */}
          <section className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Join Our Community Today</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Connect with like-minded creators and hosts. Share your experiences, learn from others, and grow your network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/auth?action=register">Sign Up Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help-support">Contact Support</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}