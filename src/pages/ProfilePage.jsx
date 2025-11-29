import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function ProfilePage() {
  const user = {
    name: "Ram Sharma",
    email: "farmer@example.com",
    phone: "+977 9812345678",
    role: "Farmer",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground text-base">
            Manage your personal information and account settings.
          </p>
        </div>

        <Card className="shadow-elegant border border-border/60">
          <CardContent className="p-8 space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground">{user.role}</p>
            </div>

            {/* Information Section */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-medium">{user.role}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full h-11 text-base">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
