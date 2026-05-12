import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import {
  Bold, Italic, List,
  Heading1, Heading2, Save, Undo, Redo,
  Sparkles, Globe, Quote, Zap,
  Underline as UnderlineIcon, AlignLeft, AlignCenter,
  Link as LinkIcon, Check, X, Paperclip, FileText,
  Image as ImageIcon, Table as TableIcon,
  Activity, Wand2, Loader2, Trash2
} from "lucide-react";

import { usePost } from "../../../../hooks/usePost";
import {  formatNameInputWithSpace, handleValidationError } from "../../../../utils/helperFunction";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { toast } from "sonner";
import { data } from "react-router-dom";
import { useFetch } from "../../../../hooks/useFetch";

const ToolbarButton = ({ onClick, isActive = false, icon: Icon, disabled = false, title, isAI = false, isDestructive = false, className = "" }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`
      h-8 w-8 flex items-center justify-center rounded-md transition-all
      ${isActive ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'}
      ${isAI ? 'text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200' : ''}
      ${isDestructive ? 'hover:bg-red-50 hover:text-red-600' : ''}
      ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-95'}
      ${className}
    `}
  >
    <Icon className={`w-3.5 h-3.5 ${isAI && !isActive ? 'animate-pulse' : ''}`} />
  </button>
);

const MenuBar = ({ editor, activeTab }) => {
  if (!editor) return null;

  const [update, setUpdate] = useState(0);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAIComputing, setIsAIComputing] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleTransaction = () => setUpdate(s => s + 1);
    editor.on('transaction', handleTransaction);
    return () => editor.off('transaction', handleTransaction);
  }, [editor]);

  const simulateAIGeneration = (htmlContent) => {
    editor.commands.clearContent();
    setIsAIComputing(true);
    setTimeout(() => {
      setIsAIComputing(false);
      let currentIdx = 0;
      const chunks = htmlContent.split(' ');
      const interval = setInterval(() => {
        if (currentIdx >= chunks.length) { clearInterval(interval); return; }
        const chunk = chunks[currentIdx] + (currentIdx < chunks.length - 1 ? ' ' : '');
        editor.chain().focus().insertContent(chunk).run();
        currentIdx++;
      }, 40);
    }, 1200);
  };

  const [aiState, setAiState] = useState(0);

  const toggleLinkInput = () => { setIsImageOpen(false); if (isLinkOpen) { setIsLinkOpen(false); return; } setLinkUrl(editor.getAttributes('link').href || ""); setIsLinkOpen(true); setTimeout(() => inputRef.current?.focus(), 10); };
  const toggleImageInput = () => { setIsLinkOpen(false); if (isImageOpen) { setIsImageOpen(false); return; } setImageUrl(""); setIsImageOpen(true); setTimeout(() => inputRef.current?.focus(), 10); };

  const toggleAI = () => {
    setIsLinkOpen(false);
    setIsImageOpen(false);

    const nextState = (aiState % 4) + 1;
    setAiState(nextState);

    const templates = {
      1: `<h2>Strategic Operational Framework</h2><p>Our commitment to excellence in the ${activeTab} domain is foundational. We prioritize the absolute integrity of user interactions through rigorous compliance with global digital SaaS standards.</p>`,
      2: `<h1>Executive Summary</h1><p>We establish an authoritative legal standard designed to protect the platform's architectural integrity through advanced compliance protocols and dedicated operational monitoring throughout the entire digital ecosystem.</p>`,
      3: `<h2>Compliance & Transparency Protocol</h2><p>This architecture represents our commitment to data sovereignty and multi-layered security. Every interaction is governed by an immutable set of privacy-first principles and real-time audit capabilities.</p>`,
      4: `<h1>${activeTab} Manual</h1><p>Start your professional documentation here.</p>`
    };

    simulateAIGeneration(templates[nextState]);
  };

  return (
    <div className="flex flex-col border-b border-slate-100 sticky top-0 bg-white z-20">
      <div className="flex items-center gap-1 p-2">
        <div className="flex gap-1 pr-2 border-r border-slate-100">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
        </div>
        <div className="flex gap-1 px-2 border-r border-slate-100">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
        </div>
        <div className="flex gap-1 px-2 border-r border-slate-100">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
        </div>
        <div className="flex gap-1 px-2 border-r border-slate-100">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="List" />
          <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={TableIcon} title="Table" />
        </div>
        <div className="flex gap-1 pl-2">
          <ToolbarButton onClick={toggleLinkInput} isActive={isLinkOpen || editor.isActive('link')} icon={LinkIcon} title="Link" />
          <ToolbarButton onClick={toggleImageInput} isActive={isImageOpen} icon={ImageIcon} title="Image" />
          <ToolbarButton onClick={toggleAI} isActive={isAIComputing} icon={Sparkles} title="Studio AI" isAI />
        </div>
        <div className="ml-auto flex gap-1 pl-4 border-l border-slate-100">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={Undo} title="Undo" />
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={Redo} title="Redo" />
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <ToolbarButton onClick={() => editor.commands.clearContent()} icon={Trash2} title="Clear All Workspace" isDestructive />
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => editor.chain().focus().setImage({ src: ev.target.result }).run(); r.readAsDataURL(f); setIsImageOpen(false); } }} accept="image/*" className="hidden" />

      {/* AI Computing Indicator Only */}
      {isAIComputing && (
        <div className="absolute top-[48px] left-0 w-full flex items-center gap-3 px-6 py-2 bg-white/90 backdrop-blur-md border-b border-slate-100 z-30 animate-in fade-in slide-in-from-top-1 duration-300">
          <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-0.5">
            {aiState === 1 ? "DRAFTING STRATEGIC FRAMEWORK..." :
              aiState === 2 ? "CRAFTING EXECUTIVE SUMMARY..." :
                aiState === 3 ? "OPTIMIZING COMPLIANCE PROTOCOL..." :
                  "RESETTING WORKSPACE..."}
          </span>
        </div>
      )}

      {(isLinkOpen || isImageOpen) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-t border-slate-100">
          {isLinkOpen ? <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> : <ImageIcon className="w-3.5 h-3.5 text-slate-400" />}
          <input ref={inputRef} type="text" value={isLinkOpen ? linkUrl : imageUrl} onChange={(e) => isLinkOpen ? setLinkUrl(e.target.value) : setImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { if (isLinkOpen) { if (linkUrl === "") editor.chain().focus().unsetLink().run(); else editor.chain().focus().setLink({ href: linkUrl }).run(); setIsLinkOpen(false); } else { if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run(); setIsImageOpen(false); } } if (e.key === 'Escape') { setIsLinkOpen(false); setIsImageOpen(false); } }} placeholder={isLinkOpen ? "Source URL..." : "Image URL..."} className="flex-1 bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none" />
          {isImageOpen && <button onClick={() => fileInputRef.current?.click()} className="h-6 w-6 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded shadow-sm"><Paperclip className="w-3 h-3" /></button>}
          <button onClick={() => { if (isLinkOpen) { if (linkUrl === "") editor.chain().focus().unsetLink().run(); else editor.chain().focus().setLink({ href: linkUrl }).run(); setIsLinkOpen(false); } else { if (imageUrl) editor.chain().focus().setImage({ src: imageUrl }).run(); setIsImageOpen(false); } }} className="h-6 w-6 flex items-center justify-center bg-slate-950 text-white rounded shadow-sm"><Check className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  );
};

export default function PolicyTab({ title }) {

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteTitle: "",
    policyHeading: ""
  });
  const [errors, setErrors] = useState({});

  const { refetch: fetchPolicy } = useFetch(
    `${apiEndpoints.fetchPolicy}?type=${title === "Terms & Condition" ? "terms" : title === "Privacy Policy" ? "privacy" : "refund"}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setFormData({
            siteTitle: data?.data.siteTitle || "",
            policyHeading: data?.data.policyHeading || ""
          })
          editor.commands.setContent(data?.data.content || "");
          setIsLoading(false);
        }
      },
      onError: (error) => {
        toast.error(
          setIsLoading(false),
          handleValidationError(error) || "Failed to fetch policy details",
        );
      },
    },
    false,
  );

  useEffect(() => {
    if (title) {
      fetchPolicy();
    }
  }, [title]);

  const { post, error } = usePost(`${apiEndpoints.addPolicy}`, {
    onSuccess: (data) => {
      toast.success(data.message || `${title} updated successfully!`);
      setIsSaving(false);
      setErrors({});
    },
    onError: (error) => {
      setIsSaving(false);
      setErrors({});
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  });

  const editor = useEditor({
    extensions: [StarterKit.configure({ history: true }), Underline, Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: 'text-indigo-600 underline font-semibold' } }), TextAlign.configure({ types: ['heading', 'paragraph'] }), Highlight, Placeholder.configure({ placeholder: `Drafting professional ${title}...` }), Subscript, Superscript, TaskList, TaskItem.configure({ nested: true }), TextStyle, Color, HorizontalRule,
    Image.configure({ HTMLAttributes: { class: 'tiptap-image' } }), Table, TableRow, TableHeader, TableCell],
    content: `<h1>${title} Manual</h1><p>Start your professional documentation here.</p>`,
    editorProps: { attributes: { class: 'tiptap-editor prose prose-slate max-w-none focus:outline-none min-h-[320px] p-10 md:p-14 text-slate-800 font-medium leading-[1.8] text-lg' } },
  });

  const handleInputChange = (field, value) => {
    const formattedValue = formatNameInputWithSpace(value, 30);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.siteTitle.trim()) {
      newErrors.siteTitle = "Site Title is required";
    }

    if (!formData.policyHeading.trim()) {
      newErrors.policyHeading = "Page Header is required";
    }
    console.log(editor?.getHTML(), "pppppppp")

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>' || editor.getHTML() === `<h1>${title} Manual</h1><p>Start your professional documentation here.</p>`) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      await post({
        type: title === "Terms & Condition" ? "terms" : title === "Privacy Policy" ? "privacy" : "refund",
        content: editor.getHTML(),
        siteTitle: formData.siteTitle,
        policyHeading: formData.policyHeading
      });
    } catch (err) {
      console.error("Failed to save policy:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20 font-sans">
      <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-10">
          <CardTitle className="text-lg font-black text-slate-950 flex items-center gap-2 uppercase tracking-widest leading-none">
            <Globe className="w-4 h-4 text-slate-400" />Technical Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-10 pb-8">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Site Title</Label>
            <Input
              placeholder="Platform Identity"
              value={formData.siteTitle}
              onChange={(e) => handleInputChange("siteTitle", e.target.value)}
              className={`h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-slate-950 transition-all font-semibold text-xs ${errors.siteTitle ? 'border-red-500' : ''}`}
            />
            {errors.siteTitle && <p className="text-red-500 text-xs mt-1">{errors.siteTitle}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Page Header</Label>
            <Input
              placeholder={title}
              value={formData.policyHeading}
              onChange={(e) => handleInputChange("policyHeading", e.target.value)}
              className={`h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-slate-950 transition-all font-semibold text-xs ${errors.policyHeading ? 'border-red-500' : ''}`}
            />
            {errors.policyHeading && <p className="text-red-500 text-xs mt-1">{errors.policyHeading}</p>}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">



        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-6 bg-slate-900 rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Description</h2>
        </div>

        <div className="border border-slate-100 bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col relative group">
          <MenuBar editor={editor} activeTab={title} />
          <CardContent className="p-0 relative bg-white min-h-[250px] max-h-[650px] overflow-y-auto hide-scrollbar">
            <EditorContent editor={editor} />
            {errors.content && (
              <div className="absolute bottom-4 left-10 right-10">
                <p className="text-red-500 text-xs bg-white px-2 py-1 rounded">{errors.content}</p>
              </div>
            )}
          </CardContent>
          <div className="bg-slate-50 border-t border-slate-100 h-14 px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">~1,240 Words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title} SYNC ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                className="bg-slate-950 hover:bg-black text-white h-9 px-6 rounded-lg font-bold text-[11px] gap-2 transition-all active:scale-95"
                disabled={isSaving}
              >
                {isSaving ? "Syncing..." : <><Save className="w-3.5 h-3.5" /> Update Policy</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #cbd5e1; pointer-events: none; height: 0; font-style: italic; } .tiptap-editor .ProseMirror { outline: none !important; } .tiptap-editor .ProseMirror h1 { font-size: 3rem; font-weight: 850; margin-bottom: 1.5rem; letter-spacing: -0.04em; color: #020617; line-height: 1.1; } .tiptap-editor .ProseMirror h2 { font-size: 2.25rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a; letter-spacing: -0.02em; } .tiptap-editor .ProseMirror p { font-size: 1.2rem; margin-bottom: 1.25rem; color: #334155; } .tiptap-editor .ProseMirror a { color: #4f46e5; text-decoration: underline; text-underline-offset: 4px; font-weight: 600; cursor: pointer; transition: color 0.2s; } .tiptap-editor .ProseMirror a:hover { color: #3730a3; } .tiptap-editor .ProseMirror table { border-collapse: collapse; margin: 1.5rem 0; width: 100%; border: 1px solid #f1f5f9; border-radius: 0.5rem; overflow: hidden; } .tiptap-editor .ProseMirror table td, .tiptap-editor .ProseMirror table th { border: 1px solid #f1f5f9; padding: 0.75rem; vertical-align: top; } .tiptap-editor .ProseMirror blockquote { border-left: 4px solid #f1f5f9; padding-left: 1.5rem; font-style: italic; color: #64748b; margin: 2rem 0; font-size: 1.5rem; } .tiptap-editor .ProseMirror img.tiptap-image { display: block !important; max-width: 350px !important; height: auto !important; margin: 32px auto !important; border-radius: 1rem !important; border: 1px solid #f1f5f9 !important; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important; }` }} />
    </div>
  );
}
