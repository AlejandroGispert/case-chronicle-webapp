import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Forward, Filter, Reply, Shield, Zap } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">How Email Integration Works</h1>
          <p className="text-muted-foreground">
            Add emails to your cases seamlessly — no OAuth, no inbox access,
            just simple forwarding.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              The Core Idea
            </CardTitle>
            <CardDescription>
              Each case gets a unique email address that automatically routes
              emails to the right place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              case+X8F3K2@inbound.yourapp.com
            </div>
            <p className="text-sm text-muted-foreground">
              Anything sent to this address automatically lands in your app and
              gets attached to the correct case. No magic, no OAuth — just
              simple email forwarding.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Forward className="h-4 w-4" />
                Option 1: Forward / CC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The most common way — simply forward an email or CC the case
                address when replying.
              </p>
              <div className="bg-muted p-3 rounded text-xs font-mono">
                To: client@example.com
                <br />
                CC: case+X8F3K2@inbound.yourapp.com
              </div>
              <p className="text-xs text-muted-foreground italic">
                Gmail sends it like any normal email. That's it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-4 w-4" />
                Option 2: Auto-Forward
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Set up Gmail filters to automatically forward emails based on
                rules.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>If subject contains "Invoice"</li>
                <li>Or from @vendor.com</li>
                <li>Auto-forward to case address</li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Perfect for power users who want automation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Reply className="h-4 w-4" />
                Option 3: Reply-To
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                When your app sends emails, set the Reply-To header to the case
                address.
              </p>
              <div className="bg-muted p-3 rounded text-xs font-mono">
                Reply-To: case+X8F3K2@inbound.yourapp.com
              </div>
              <p className="text-xs text-muted-foreground italic">
                Replies come straight back into the case — seamless.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              How It Works Technically
            </CardTitle>
            <CardDescription>
              Behind the scenes with SES (or Mailgun, SendGrid, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Domain Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure{" "}
                    <code className="bg-muted px-1 rounded">
                      inbound.yourapp.com
                    </code>{" "}
                    with MX records pointing to Amazon SES. One-time setup with
                    domain verification and DKIM signing.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">SES Receipt Rule</h4>
                  <p className="text-sm text-muted-foreground">
                    SES matches all recipients at{" "}
                    <code className="bg-muted px-1 rounded">
                      *@inbound.yourapp.com
                    </code>{" "}
                    and triggers your Lambda function or webhook. SES doesn't
                    care where the email came from — Gmail, Outlook, or anywhere
                    else.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Your App Logic</h4>
                  <p className="text-sm text-muted-foreground">
                    Your backend extracts the token from the recipient address,
                    finds the matching case and user, parses the email content
                    and attachments, then stores everything and links it to the
                    case.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Important safeguards to keep your cases secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Long, random tokens</strong> — Each case address uses
                  an unguessable token (e.g., X8F3K2)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Case validation</strong> — Only active cases can
                  receive emails
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Optional restrictions</strong> — Limit emails to known
                  participants only
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Rate limiting</strong> — Prevent abuse per address
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Spam filtering</strong> — SES provides basic spam
                  verdicts
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Users already forward emails to tools like
              Jira, Zendesk, Linear, and Notion. If the value is clear, they
              don't mind. Just make it easy:{" "}
              <em>"CC this address to add the email to the case."</em>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
