"use client";

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { X, Loader2, Camera, User, FolderOpen, Lock, Globe } from "lucide-react";
import { AppDispatch } from "@/core/redux/store";
import { updateProfile, UserProfile } from "@/core/redux/user";
import { profileApi } from "@/core/services/api/profile";
import { cloudinaryApi } from "@/core/services/api/cloudinary";
import FilePicker from "@/components/upload/FilePicker";

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

const GENDER_OPTIONS = ["male", "female", "other"];

export default function EditProfileDialog({ profile, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [fullName, setFullName] = useState(profile.fullName);
  const [gender, setGender] = useState(profile.gender);
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate ?? false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarLetter = fullName?.[0]?.toUpperCase() ?? profile.username?.[0]?.toUpperCase() ?? "U";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB.");
      return;
    }
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await cloudinaryApi.uploadIcon(file);
      setProfilePic(url);
    } catch {
      setError("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await profileApi.update({ fullName, gender, profilePic, isPrivate });
      dispatch(updateProfile(updated));
      onClose();
    } catch {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-modal border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <p className="text-white font-semibold">Chỉnh sửa hồ sơ</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-modal overflow-hidden">
                {profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePic} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-xs">Click vào ảnh để upload mới</p>
              <span className="text-slate-600 text-xs">·</span>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FolderOpen size={11} /> Chọn từ thư viện
              </button>
            </div>
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-medium">Họ và tên</label>
            <div className="flex items-center gap-2 bg-[#161925] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-blue-500/50 transition-colors">
              <User size={14} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="flex-1 bg-transparent text-slate-200 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-medium">Giới tính</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                    gender === g
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-white/[0.08] text-slate-400 hover:border-blue-500/40 hover:text-white"
                  }`}
                >
                  {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                </button>
              ))}
            </div>
          </div>

          {/* Private profile toggle */}
          <div className="flex items-center justify-between bg-[#161925] border border-white/[0.08] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock size={15} className="text-blue-400 flex-shrink-0" />
              ) : (
                <Globe size={15} className="text-slate-400 flex-shrink-0" />
              )}
              <div>
                <p className="text-slate-200 text-sm font-medium">
                  {isPrivate ? "Tài khoản riêng tư" : "Tài khoản công khai"}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {isPrivate
                    ? "Chỉ bạn bè mới xem được hồ sơ của bạn"
                    : "Mọi người đều có thể xem hồ sơ của bạn"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                isPrivate ? "bg-blue-600" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  isPrivate ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Read-only fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-xs font-medium">Email</label>
            <p className="text-slate-500 text-sm px-3 py-2.5 bg-[#161925] border border-white/[0.05] rounded-xl">
              {profile.email}
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-xs px-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploadingAvatar}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" />Đang lưu...</>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>

    <FilePicker
      open={showPicker}
      onClose={() => setShowPicker(false)}
      onSelect={(url) => { setProfilePic(url); setShowPicker(false); }}
    />
    </>
  );
}
