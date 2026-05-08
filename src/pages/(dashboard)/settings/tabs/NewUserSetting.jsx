import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  updateLocalSetting,
  updateSetting,
} from "../../../../store/slices/settingSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
import {
  Loader2,
  ShieldCheck,
  Zap,
  Activity,
  History
} from "lucide-react";

/**
 * NewUserSetting Component
 * Visual Clarity Dash: Balanced, High-Performance, and Predictable.
 */
const NewUserSetting = () => {
  const dispatch = useDispatch();
  const { data: settings, loading } = useSelector((state) => state.settings);
  const [updatingKey, setUpdatingKey] = useState(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleUpdate = async (key) => {
    setUpdatingKey(key);
    try {
      await dispatch(updateSetting({ key, value: settings[key] })).unwrap();
      toast.success("Identity policy synchronized.");
      dispatch(fetchSettings());
    } catch (error) {
      toast.error(handleValidationError(error) || "Protocol update failed.");
    } finally {
      setUpdatingKey(null);
    }
  };

  const ProtocolRow = ({ label, description, icon: Icon, isActive, onToggle, onUpdate, updateKey, color = "slate" }) => (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/30 transition-all gap-8">
      <div className="space-y-1 max-w-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${isActive ? color : 'slate'}-50 text-${isActive ? color : 'slate'}-600 rounded-lg`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          <Label className="text-base font-bold text-slate-900 tracking-tight">{label}</Label>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed pl-9">{description}</p>
      </div>

      <div className="flex items-center gap-6 justify-between lg:justify-end flex-1 pl-9 lg:pl-0">
        <div className="flex items-center gap-4 border-r border-slate-100 pr-6 shrink-0 h-10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse-slow ${isActive ? `bg-${color}-500 shadow-sm shadow-${color}-500/50` : 'bg-slate-300'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
              {isActive ? 'Active' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => onToggle(!isActive)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${isActive ? 'bg-slate-900' : 'bg-slate-200'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        <Button
          onClick={onUpdate}
          disabled={loading || updatingKey === updateKey}
          className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-8 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 min-w-[140px]"
        >
          {updatingKey === updateKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Policy"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-32 space-y-8 animate-in fade-in duration-500">

      {/* Visual Identity Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Security Protocols</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Access Controls</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden p-0">
        <CardContent className="p-0">
          <ProtocolRow
            label="Manual Identity Validation"
            description="New credentials require admin review before access."
            icon={Zap}
            color="indigo"
            updateKey="requireAdminApprovalForCredentials"
            isActive={settings.requireAdminApprovalForCredentials || false}
            onToggle={(newVal) => dispatch(updateLocalSetting({ key: "requireAdminApprovalForCredentials", value: newVal }))}
            onUpdate={() => handleUpdate("requireAdminApprovalForCredentials")}
          />

          <ProtocolRow
            label="Digital KYC Audit Engine"
            description="Instantly verify identities via global document databases."
            icon={Activity}
            color="emerald"
            updateKey="isKycOnline"
            isActive={settings.isKycOnline || false}
            onToggle={(newVal) => dispatch(updateLocalSetting({ key: "isKycOnline", value: newVal }))}
            onUpdate={() => handleUpdate("isKycOnline")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewUserSetting;
