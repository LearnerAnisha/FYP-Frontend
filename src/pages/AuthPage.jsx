import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons & Notifications
import { Sprout, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Authentication API functions
import { registerUser, loginUser } from "@/api/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const extractErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) return "Something went wrong. Please try again.";

    // Serializer validation errors (field-level)
    if (data.errors) {
      const firstField = Object.keys(data.errors)[0];
      return data.errors[firstField][0];
    }

    // General error message
    if (data.message) return data.message;

    return "Invalid request.";
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const identifier = document.getElementById("signin-identifier").value;
    const password = document.getElementById("signin-password").value;

    try {
      const res = await loginUser({ identifier, password });

      // Persist authentication tokens
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const full_name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;
    const accepted_terms =
      e.target.querySelector("input[type='checkbox']").checked;

    try {
      const res = await registerUser({
        full_name,
        email,
        phone,
        password,
        accepted_terms,
      });

      toast.success(res.message);

      // Temporarily store email for OTP verification
      localStorage.setItem("verify_email", email);

      // Redirect to OTP verification screen
      navigate("/verify-otp");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">

        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        {/* Application Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">
              Krishi <span className="text-primary">Saathi</span>
            </span>
          </Link>
        </div>

        {/* Authentication Tabs */}
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login using your email or phone number
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label>Email or Phone</Label>
                    <Input
                      id="signin-identifier"
                      placeholder="Email or phone"
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register to access smart farming services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input
                    id="signup-name"
                    placeholder="Full Name"
                    required
                  />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                  <Input
                    id="signup-phone"
                    placeholder="98XXXXXXXX"
                    required
                  />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Strong password"
                    required
                  />

                  <div className="flex items-start gap-2">
                    <input type="checkbox" required />
                    <span className="text-sm text-muted-foreground">
                      I agree to the Terms & Privacy Policy
                    </span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Secured using JWT authentication and OTP-based email verification
        </p>
      </div>
    </div>
  );
}