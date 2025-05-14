import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import CaseAccess from "@/components/caseHandler/CaseAccess"; // ✅ IMPORT THIS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, signup, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signup(signupEmail, signupPassword, firstName, lastName);
      setActiveTab("login");
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-legal-500 mb-2">Case Chronicle</h1>
          <p className="text-gray-600">Case management for legal professionals</p>
        </div>

        <Card>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="case">View Case</TabsTrigger>
            </TabsList>

            {/* Existing login and signup tabs remain unchanged */}
            {/* ... login tab */}
            {/* ... signup tab */}

            {/* ✅ NEW CASE ACCESS TAB */}
            <TabsContent value="case">
              <CardHeader>
                <CardTitle className="text-2xl">Access a Case</CardTitle>
                <CardDescription>Enter your case access code below</CardDescription>
              </CardHeader>
              <CardContent>
                <CaseAccess />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
