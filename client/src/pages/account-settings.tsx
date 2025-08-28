import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  User,
  Lock,
  CreditCard,
  Wallet,
  Bell,
  EyeIcon,
  EyeOffIcon,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddPaymentMethodDialog } from "@/components/account/add-payment-method-dialog";
import { PaymentMethodsSection } from "@/components/account/payment-methods-section";
import { PayoutMethodsSection } from "@/components/account/payout-methods-section";
import { NotificationSettings } from "@/components/account/notification-settings";

const sidebarItems = (t: (key: string) => string) => [
  { icon: User, label: t("settings.personalInfo"), id: "personal" },
  { icon: Lock, label: t("settings.loginSecurity"), id: "security" },
  { icon: CreditCard, label: t("settings.payments"), id: "payments" },
  { icon: Wallet, label: t("settings.payouts"), id: "payouts" },
  { icon: Bell, label: t("settings.notifications"), id: "notifications" },
];

// Schema definitions
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

// Removed additionalInfoSchema as it was unused

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type definitions
type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type SecurityData = z.infer<typeof securitySchema>;

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState("personal");
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Personal Info Form Setup
  const personalForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      // Extract first name from the username
      firstName: user?.username?.split(" ")[0] || "",
      // Extract last name from the database, removing the period if it exists
      lastName: user?.username?.split(" ")[1] ? 
        (user?.username?.split(" ")[1].endsWith(".") ? 
          user?.username?.split(" ")[1].slice(0, -1) : user?.username?.split(" ")[1])
        : "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: PersonalInfoData) => {
      // Combine first and last name into username
      const { firstName, lastName, ...restData } = data;
      
      // Don't update the username - keep it separate from display name
      const finalData = {
        ...restData,
        // Store first and last name separately without modifying username
        firstName,
        lastName
      };
      
      const response = await apiRequest({
        url: `/api/users/${user?.id}`,
        method: "PATCH",
        body: finalData
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // Refresh page after successful update to show the updated information
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Security Form Setup
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Manual password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const securityForm = useForm<SecurityData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: SecurityData) => {
      const response = await apiRequest({
        url: "/api/change-password",
        method: "POST",
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });
      // Reset form fields and errors
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Set error for current password if authentication failed
      if (error.message.includes("incorrect")) {
        setFormErrors(prev => ({
          ...prev,
          currentPassword: "Current password is incorrect"
        }));
      }
    },
  });

  // Section Renderers
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{t("settings.personalInfo")}</h2>
        <p className="text-muted-foreground mb-4">
          {t("settings.personalInfoDescription")}
        </p>
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mb-4 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            Your display name on the platform will be shown as your first name and the first letter of your last name (e.g., "John S."). This format helps protect your privacy while maintaining a personalized experience.
          </p>
        </div>
      </div>

      <Form {...personalForm}>
        <form onSubmit={personalForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={personalForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personalForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={personalForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.cellPhone")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1 (555) 000-0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={personalForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-auto" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              t("settings.saveChanges")
            )}
          </Button>
        </form>
      </Form>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Login & Security</h2>
        <p className="text-muted-foreground">
          Update your password and manage security settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">
            Current Password
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.currentPassword && (
            <p className="text-sm text-red-500 mt-1">
              {formErrors.currentPassword}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.newPassword && (
            <p className="text-sm text-red-500 mt-1">
              {formErrors.newPassword}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>
        
        <Button
          type="button"
          className="w-auto"
          disabled={updatePasswordMutation.isPending}
          onClick={() => {
            // Manual validation
            const errors: {
              currentPassword?: string;
              newPassword?: string;
              confirmPassword?: string;
            } = {};
            
            if (!currentPassword) {
              errors.currentPassword = "Current password is required";
            }
            
            if (!newPassword) {
              errors.newPassword = "New password is required";
            } else if (newPassword.length < 8) {
              errors.newPassword = "Password must be at least 8 characters";
            } else if (!/[A-Z]/.test(newPassword)) {
              errors.newPassword = "Password must contain at least one uppercase letter";
            } else if (!/[a-z]/.test(newPassword)) {
              errors.newPassword = "Password must contain at least one lowercase letter";
            } else if (!/[0-9]/.test(newPassword)) {
              errors.newPassword = "Password must contain at least one number";
            }
            
            if (!confirmPassword) {
              errors.confirmPassword = "Please confirm your password";
            } else if (confirmPassword !== newPassword) {
              errors.confirmPassword = "Passwords don't match";
            }
            
            setFormErrors(errors);
            
            // If no errors, submit
            if (Object.keys(errors).length === 0) {
              updatePasswordMutation.mutate({
                currentPassword,
                newPassword,
                confirmPassword
              });
            }
          }}
        >
          {updatePasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
        <p className="text-muted-foreground mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        <Button variant="outline">Enable Two-Factor Authentication</Button>
      </div>
    </div>
  );

  const renderPayments = () => <PaymentMethodsSection />;

  const renderPayouts = () => <PayoutMethodsSection />;

  const renderNotifications = () => <NotificationSettings />;

  // Main section renderer
  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return renderPersonalInfo();
      case "security":
        return renderSecurity();
      case "notifications":
        return renderNotifications();
      case "payments":
        return renderPayments();
      case "payouts":
        return renderPayouts();
      default:
        return <div>Section under construction</div>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-64 shrink-0">
            <nav className="space-y-1">
              {sidebarItems(t).map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex-1">
            <Card className="p-6">{renderSection()}</Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}