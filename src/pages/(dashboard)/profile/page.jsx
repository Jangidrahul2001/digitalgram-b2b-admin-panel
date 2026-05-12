import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Save,
  Lock,
  Bell,
  Briefcase,
  Calendar,
  Settings2,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Activity
} from "@/components/icons";
import { BentoCard } from "../../../components/ui/bento-card";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { emailRegex, handleValidationError, phoneRegex } from "../../../utils/helperFunction";
import { usePatch } from "../../../hooks/usePatch";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../../store/slices/profileSlice";
import { Clock } from "lucide-react";
import MechanicalToggle from "@/components/ui/MechanicalToggle";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);
  const [profileData, setProfileData] = useState(profile || {});

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordsValidate = () => {
    const temp = {};
    if (!password.currentPassword?.trim()) {
      temp.currentPassword = "Current password is required";
    }
    if (!password.newPassword?.trim()) {
      temp.newPassword = "New password is required";
    } else if (password.newPassword === password.currentPassword) {
      temp.newPassword =
        "New password must be different from the current password.";
    } else if (password.newPassword.length < 6) {
      temp.newPassword = "New password must be at least 6 characters long.";
    }
    setPasswordErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const { patch: changePassword } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Password updated successfully");
        setPassword({ currentPassword: "", newPassword: "" });
      }
    },
    onError: (error) => {
      console.error("Error in updating password:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const { patch: updateProfile } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Profile updated successfully");
        dispatch(fetchProfile());
      }
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleProfileValidate = () => {
    const temp = {};
    if (!profileData.name?.trim()) {
      temp.name = "Name is required";
    }
    if (!profileData.email?.trim()) {
      temp.email = "Email is required";
    }
    else if (!emailRegex.test(profileData.email)) {
      temp.email = "Invalid email format";
    }
    if (!profileData.phone?.trim()) {
      temp.phone = "Phone is required";
    }
    else if (!phoneRegex.test(profileData.phone)) {
      temp.phone = "Invalid phone format";
    }
    setProfileErrors(temp);
    return Object.keys(temp).length === 0;
  };
  const handleSaveProfile = () => {
    const isValid = handleProfileValidate();
    if (!isValid) return;
    updateProfile(apiEndpoints.updateProfile, profileData);
  };

  const handleChangePassword = () => {
    const isValid = handlePasswordsValidate();
    if (!isValid) return;
    changePassword(`${apiEndpoints.changePassword}`, password);
  };
  const handleCancel = () => {
    setProfileData(profile);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* Header Section with Profile Banner */}
      <div className="relative group">
        <div className="relative w-full h-[200px] md:h-[240px] rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden shadow-sm border border-slate-50 mb-6">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute top-6 right-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:text-white/90 hover:bg-white/20 transition-all rounded-xl"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Banner
            </Button>
          </div>
        </div>

        <div className="px-6 md:px-12 -mt-16 md:-mt-20 relative z-30 flex flex-col md:flex-row gap-8 md:items-end justify-between">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative group/avatar">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white p-1 shadow-sm transition-all duration-500 group-hover/avatar:scale-[1.02] group-hover/avatar:rotate-1">
                <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden relative border border-slate-100">
                  <User className="w-16 h-16 md:w-20 md:h-20" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent" />
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-slate-900 text-white shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 border-[3px] border-white z-30 cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 pb-2 text-center md:text-left md:pl-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 mb-4">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm flex flex-wrap items-center gap-4">
                  {profileData?.name || "Admin User"}
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] uppercase tracking-[0.15em] border border-emerald-500/20 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Verified Admin
                  </span>
                </h1>
              </div>
             
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <Button
              variant="outline"
              className="rounded-xl px-6 h-11 border-slate-200 hover:bg-slate-50 font-bold transition-all"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-6 h-11 bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-bold flex items-center gap-2 transition-all active:scale-95"
              onClick={handleSaveProfile}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Sections (Now on Left) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Form */}
          <BentoCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Personal Profile</h2>
              <p className="text-xs text-slate-500">Update your identity and contact information.</p>
            </div>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Display Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      value={profileData.name || ""}
                      error={profileErrors.name}
                      placeholder="Your Full Name"
                      className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      value={profileData?.phone || ""}
                      error={profileErrors.phone}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    value={profileData?.email || ""}
                    error={profileErrors.email}
                    placeholder="admin@example.com"
                    className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Professional Bio</label>
                <textarea
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  value={profileData?.bio || ""}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all resize-none"
                />
              </div>
            </CardContent>
          </BentoCard>

          {/* Security Form */}
          <BentoCard className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Security & Credentials</h2>
              <p className="text-xs text-slate-500">Regularly update your password to maintain security.</p>
            </div>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-4.5 md:top-5 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      value={password.currentPassword}
                      onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                      error={passwordErrors.currentPassword}
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">New Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-4.5 md:top-5 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      value={password.newPassword}
                      onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                      error={passwordErrors.newPassword}
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full md:w-fit px-8 h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  onClick={handleChangePassword}
                >
                  <Settings2 className="w-4 h-4" />
                  Update Security Credentials
                </Button>
              </div>
            </CardContent>
          </BentoCard>

        </div>

        {/* Sidebar Panel (Now on Right) */}
        <div className="space-y-6">
          <BentoCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs md:text-md">Quick Stats</h3>
              <Settings2 className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Activity', val: '98%', color: 'text-emerald-600', bg: 'bg-emerald-500/5', icon: Activity },
                { label: 'Uptime', val: '24/7', color: 'text-blue-600', bg: 'bg-blue-500/5', icon: Globe },
                { label: 'Security', val: 'Max', color: 'text-amber-600', bg: 'bg-amber-500/5', icon: ShieldCheck },
                { label: 'Reports', val: '12', color: 'text-rose-600', bg: 'bg-rose-500/5', icon: Bell }
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} className={cn("p-4 rounded-2xl border border-slate-100 transition-all shadow-sm cursor-default group/item", stat.bg)}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={cn("text-[9px] font-black text-slate-400 uppercase tracking-widest")}>{stat.label}</p>
                      <StatIcon className="w-3 h-3 text-slate-300 group-hover/item:text-slate-900 transition-colors" />
                    </div>
                    <p className={cn("text-lg font-black tracking-tight", stat.color)}>{stat.val}</p>
                  </div>
                );
              })}
            </div>
          </BentoCard>

          <BentoCard className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security Score</h3>
                <p className="text-[11px] text-slate-500">Your account is well protected</p>
              </div>
            </div>
            <div className="relative pt-2">
              <div className="flex mb-3 items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Level</p>
                <div className="text-right">
                  <span className="text-xs font-black inline-block text-emerald-600 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    85%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2.5 mb-2.5 text-xs flex rounded-full bg-slate-100/80">
                <div style={{ width: "85%" }} className="shadow-[0_0_10px_rgba(16,185,129,0.3)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 transform-gpu"></div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mb-1 opacity-80">Auto-scan performed today at 4:30 AM</p>
            </div>
            <Button variant="ghost" className="w-full text-blue-600 font-bold text-xs p-0 hover:bg-transparent hover:text-blue-700 flex items-center justify-center gap-1 group">
              Review Security Settings <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </BentoCard>

          {/* Preferences (Moved back to right sidebar) */}
          <div className="grid grid-cols-1 gap-4">
            <BentoCard className="p-5 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center border border-blue-100/50">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Email Alerts</p>
                  </div>
                </div>
                <MechanicalToggle defaultChecked />
              </div>
            </BentoCard>

            <BentoCard className="p-5 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/50 flex items-center justify-center border border-emerald-100/50">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Visibility</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Public Profile</p>
                  </div>
                </div>
                <MechanicalToggle />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
