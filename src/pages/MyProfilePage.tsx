import { useState, useRef } from 'react';
import { useCurrentUser } from '@/lib/hooks/useAuth';
import { useUpdateProfile, useUpdateAvatar, useChangePassword } from '@/lib/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

const MyProfilePage = () => {
  const { data: currentUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();
  const changePasswordMutation = useChangePassword();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      fullName: currentUser.fullName,
      phone: currentUser.phone || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      fullName: currentUser.fullName,
      phone: currentUser.phone || '',
    });
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: editedData.fullName,
        phone: editedData.phone || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        // Send only avatar to PUT /api/user/profile/avatar/
        await updateAvatarMutation.mutateAsync({
          avatar: base64String,
        });
      } catch (error) {
        // Error is handled in the mutation
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(passwordData);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role: string | null) => {
    if (!role) return 'secondary';

    const roleColors: Record<string, string> = {
      administrator: 'destructive',
      salesperson: 'default',
      agency: 'secondary',
      guide: 'outline',
      assistant_guide: 'outline',
      driver: 'secondary',
      supplier: 'secondary',
    };

    return roleColors[role] || 'secondary';
  };

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 cursor-pointer" onClick={handleImageClick}>
                  <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.fullName} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(currentUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={handleImageClick}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">{currentUser.fullName}</h3>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>

                <div className="flex flex-col gap-2 items-center">
                  <Badge variant={getRoleBadgeColor(currentUser.role || null) as any}>
                    {formatRole(currentUser.role || null)}
                  </Badge>

                  {currentUser.isSuperuser && (
                    <Badge variant="destructive" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Superuser
                    </Badge>
                  )}

                  {currentUser.isVerified ? (
                    <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
                      <Shield className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Member since</p>
                  <p className="font-medium">{formatDate(currentUser.dateJoined)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>View and manage your account information</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="password">Change Password</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={editedData.fullName}
                        onChange={(e) =>
                          setEditedData({ ...editedData, fullName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm p-2 rounded-md bg-muted">
                        {currentUser.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm p-2 rounded-md bg-muted text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedData.phone}
                        onChange={(e) =>
                          setEditedData({ ...editedData, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm p-2 rounded-md bg-muted">
                        {currentUser.phone || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Role
                    </Label>
                    <p className="text-sm p-2 rounded-md bg-muted">
                      {formatRole(currentUser.role || null)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role is assigned by administrator
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Account Status</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <span className="text-sm">Email Verification</span>
                      <Badge
                        variant={currentUser.isVerified ? 'default' : 'secondary'}
                      >
                        {currentUser.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <span className="text-sm">Account Type</span>
                      <Badge variant={currentUser.isSuperuser ? 'destructive' : 'outline'}>
                        {currentUser.isSuperuser ? 'Superuser' : 'Regular User'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Change Password Tab */}
              <TabsContent value="password" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordData.old_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, old_password: e.target.value })
                        }
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirm_password: e.target.value })
                        }
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        changePasswordMutation.isPending ||
                        !passwordData.old_password ||
                        !passwordData.new_password ||
                        !passwordData.confirm_password
                      }
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfilePage;
