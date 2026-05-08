import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  updateSetting,
  updateLocalSetting,
} from "../../../../store/slices/settingSlice";
import {
  Card,
  CardContent,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { formatNumberInput, handleValidationError } from "../../../../utils/helperFunction";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  UploadCloud, 
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export function MainSettingsTab() {
  const dispatch = useDispatch();
  const { data: settings, loading } = useSelector((state) => state.settings);
  const [updatingKey, setUpdatingKey] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings.logoUrl)
      setLogoPreview(`${import.meta.env.VITE_API_URL}${settings.logoUrl}`);
    if (settings.faviconUrl)
      setFaviconPreview(`${import.meta.env.VITE_API_URL}${settings.faviconUrl}`);
  }, [settings]);

  const handleFileChange = (e, setPreview, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        dispatch(updateLocalSetting({ key, value: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (key) => {
    setUpdatingKey(key);
    try {
      await dispatch(updateSetting({ key, value: settings[key] })).unwrap();
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated`);
      dispatch(fetchSettings());
    } catch (error) {
      toast.error(handleValidationError(error) || "Update failed");
    } finally {
      setUpdatingKey(null);
    }
  };

  const GlassRow = ({ label, icon: Icon, description, children, updateKey, color="slate" }) => (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-slate-50/50 transition-all rounded-2xl gap-4">
      <div className="flex gap-3 max-w-sm">
        <div className={`mt-1 p-2 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-105 transition-transform duration-300`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <div className="space-y-0.5">
          <Label className="text-sm font-bold text-slate-800">{label}</Label>
          <p className="text-[11px] text-slate-400 leading-tight font-medium">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-1 max-w-[420px]">
        <div className="relative flex-1">
           {children}
        </div>
        <Button
          onClick={() => handleUpdate(updateKey)}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 rounded-xl text-xs font-semibold shrink-0"
        >
          {updatingKey === updateKey ? <Loader2 className="w-3.5 h-3.5 px-4 animate-spin text-white" /> : "Apply"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-32 space-y-8">
      
      {/* Visual Identity Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Platform Visuals</h2>
            <div className="h-px flex-1 bg-slate-100" />
            <ImageIcon className="w-4 h-4 text-slate-300" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Logo Card */}
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 space-y-4">
               <div className="flex items-center justify-between px-1">
                  <div className="space-y-0.5">
                    <Label className="text-[13px] font-bold text-slate-800">Primary Logo</Label>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">SVG/PNG Recommended</p>
                  </div>
                  {updatingKey === "logo" && <Loader2 className="w-3.5 h-3.5 text-slate-700 animate-spin" />}
               </div>
               
               <div className="relative group/logo">
                  <div className="h-28 w-full bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 transition-all hover:bg-slate-50/80">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="relative z-10 max-h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                        <span className="text-[10px] font-medium">Empty</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 cursor-pointer hover:scale-105 transition-transform active:scale-95">
                    <UploadCloud className="w-4 h-4 text-slate-700" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setLogoPreview, "logo")} />
                  </label>
               </div>

               <Button 
                 onClick={() => handleUpdate("logo")}
                 className="w-full bg-slate-900 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-slate-900/5 hover:bg-slate-800"
               >
                 Update Site Logo
               </Button>
            </CardContent>
          </Card>

          {/* Favicon Card */}
          <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 h-full flex flex-col">
               <div className="flex items-center justify-between px-1 mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-[13px] font-bold text-slate-800">Favicon</Label>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">32 x 32px</p>
                  </div>
                  {updatingKey === "favicon" && <Loader2 className="w-3.5 h-3.5 text-slate-700 animate-spin" />}
               </div>
               
               <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                  <div className="relative group/fav">
                      <div className="h-16 w-16 bg-white rounded-2xl shadow-md border border-slate-50 flex items-center justify-center p-3 transition-transform group-hover/fav:scale-105">
                        {faviconPreview ? (
                          <img src={faviconPreview} alt="Fav" className="w-full h-full object-contain" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-slate-100" />
                        )}
                      </div>
                      <label className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-indigo-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors border-2 border-white">
                        <UploadCloud className="w-3 h-3" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setFaviconPreview, "favicon")} />
                      </label>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium text-center max-w-[150px] leading-tight">Displayed in browser tab.</p>
               </div>

               <Button 
                 onClick={() => handleUpdate("favicon")}
                 className="w-full bg-slate-900 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-slate-900/5 hover:bg-slate-800"
               >
                 Confirm Icon
               </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* General Settings Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Configuration</h2>
            <div className="h-px flex-1 bg-slate-100" />
            <Zap className="w-4 h-4 text-slate-300" />
        </div>

        <Card className="border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-2 space-y-1">
            <GlassRow 
              label="Site Header Title" 
              icon={Globe}
              color="indigo"
              description="Primary branding title."
              updateKey="title"
            >
              <Input 
                value={settings.title || ""} 
                onChange={(e) => dispatch(updateLocalSetting({ key: "title", value: e.target.value }))}
                className="bg-slate-50/50 border-0 focus-visible:ring-0 rounded-xl h-9 text-xs font-semibold"
              />
            </GlassRow>

            <GlassRow 
              label="Support Email" 
              icon={Mail}
              color="blue"
              description="Public contact email."
              updateKey="email"
            >
              <Input 
                type="email"
                value={settings.email || ""} 
                onChange={(e) => dispatch(updateLocalSetting({ key: "email", value: e.target.value }))}
                className="bg-slate-50/50 border-0 focus-visible:ring-0 rounded-xl h-9 text-xs font-semibold"
              />
            </GlassRow>

            <GlassRow 
              label="Contact Hotline" 
              icon={Phone}
              color="emerald"
              description="98756XXXXX"
              updateKey="phone"
            >
              <Input 
                value={settings.phone || ""} 
                onChange={(e) => dispatch(updateLocalSetting({ key: "phone", value: formatNumberInput(e.target.value,10) }))}
                className="bg-slate-50/50 border-0 focus-visible:ring-0 rounded-xl h-9 text-xs font-semibold"
              />
            </GlassRow>

            <GlassRow 
              label="Head Office Address" 
              icon={MapPin}
              color="rose"
              description="Primary business location."
              updateKey="address"
            >
              <Input 
                value={settings.address || ""} 
                onChange={(e) => dispatch(updateLocalSetting({ key: "address", value: e.target.value }))}
                className="bg-slate-50/50 border-0 focus-visible:ring-0 rounded-xl h-9 text-xs font-semibold"
              />
            </GlassRow>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
