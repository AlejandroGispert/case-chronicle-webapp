import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { caseShareInviteController } from "@/backend/controllers/caseShareInviteController";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Loader2, Mail, CheckCircle2, XCircle, LogIn } from "lucide-react";

export default function InviteRedeem() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [invitePreview, setInvitePreview] = useState<{
    case_title: string;
    case_id: string;
    email: string;
    expires_at: string;
    valid: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Invalid invite link");
      return;
    }

    const fetchPreview = async () => {
      try {
        const preview = await caseShareInviteController.getInviteByToken(token);
        setInvitePreview(preview);
      } catch {
        setInvitePreview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token]);

  useEffect(() => {
    if (!token || !invitePreview?.valid || authLoading || !user || redeeming) return;

    const redeem = async () => {
      setRedeeming(true);
      setError(null);
      try {
        const result = await caseShareInviteController.redeemInvite(token);
        if (result?.success && result.caseId) {
          navigate(`/dashboard?caseId=${result.caseId}`, { replace: true });
        } else {
          setError(result?.error ?? "Failed to accept invite");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setRedeeming(false);
      }
    };

    redeem();
  }, [token, invitePreview, user, authLoading, redeeming, navigate]);

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-legal-600" />
        </div>
      </Layout>
    );
  }

  if (!invitePreview || !invitePreview.valid) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-8 w-8" />
                <CardTitle>Invalid or Expired Invite</CardTitle>
              </div>
              <CardDescription>
                This invite link is invalid or has expired. Please ask the case
                owner to send a new invite.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    const loginUrl = `/login?redirect=${encodeURIComponent(`/invite/${token}`)}`;
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-8 w-8 text-legal-600" />
                <CardTitle>You&apos;ve Been Invited</CardTitle>
              </div>
              <CardDescription>
                You&apos;ve been invited to access the case &quot;
                {invitePreview.case_title}&quot;. Sign up or log in to accept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This invite was sent to{" "}
                <span className="font-medium">{invitePreview.email}</span>. Make
                sure you sign up or log in with that email.
              </p>
              <Button asChild className="w-full">
                <Link to={loginUrl}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign up or Log in
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (redeeming || error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle>
                {redeeming ? "Accepting Invite..." : "Could Not Accept Invite"}
              </CardTitle>
              <CardDescription>
                {redeeming
                  ? "Granting you access to the case..."
                  : error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redeeming ? (
                <Loader2 className="h-8 w-8 animate-spin text-legal-600" />
              ) : (
                <div className="flex gap-2">
                  {user.email?.toLowerCase() !== invitePreview.email.toLowerCase() && (
                    <p className="text-sm text-destructive mb-2">
                      You&apos;re logged in as {user.email}, but this invite was
                      sent to {invitePreview.email}. Please log in with the
                      correct account.
                    </p>
                  )}
                  <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-muted-foreground">Redirecting you to the case...</p>
        </div>
      </div>
    </Layout>
  );
}
