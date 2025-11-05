import { useSignOut } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Clock } from 'lucide-react';

const PendingApprovalPage = () => {
  const { signOut, isPending: isSigningOut } = useSignOut();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-md w-full mx-auto p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Clock className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Approval
          </h1>
          <p className="text-lg text-muted-foreground">
            Please wait until the administrator approves your account.
          </p>
          <p className="text-sm text-muted-foreground">
            You will be notified via email once your account has been activated.
          </p>
        </div>

        <div className="pt-6">
          <Button
            onClick={() => signOut()}
            disabled={isSigningOut}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
