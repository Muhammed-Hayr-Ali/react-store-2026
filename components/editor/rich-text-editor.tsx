"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import EmojiPicker, {
  Theme,
  EmojiClickData,
  EmojiStyle,
  SuggestionMode,
} from "emoji-picker-react";
import { useTheme } from "next-themes";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Strikethrough,
  Quote,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  CheckSquare,
  Image as ImageIcon,
  Smile,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

import { useState } from "react";

// ---------------------------------------------------------
// 1. Custom Font Size Extension
// ---------------------------------------------------------
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// ---------------------------------------------------------
// 2. Main Component
// ---------------------------------------------------------

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "اكتب شيئاً...",
  className,
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // حالات جديدة لإدارة Dialog الصورة
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [currentFontSize, setCurrentFontSize] = useState<string>("default");

  const { theme, systemTheme } = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        blockquote: {},
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-4 hover:text-primary/80",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "right",
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto border mx-auto block",
        },
      }),
      TextStyle,
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      const size = editor.getAttributes("textStyle").fontSize;
      setCurrentFontSize(size || "default");
    },
    onSelectionUpdate: ({ editor }) => {
      const size = editor.getAttributes("textStyle").fontSize;
      setCurrentFontSize(size || "default");
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[250px] p-4",
          "prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-0",
          className,
        ),
        dir: "auto",
      },
    },
  });

  if (!editor) return null;

  // --- Handlers ---

  const handleOpenLinkDialog = () => {
    const currentLink = editor.getAttributes("link").href;
    setLinkUrl(currentLink || "");
    setIsLinkDialogOpen(true);
  };

  const handleSaveLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setIsLinkDialogOpen(false);
    setLinkUrl("");
  };

  // فتح Dialog الصورة
  const handleOpenImageDialog = () => {
    setImageUrl(""); // تصفير الحقل عند الفتح
    setIsImageDialogOpen(true);
  };

  // حفظ الصورة من الـ Dialog
  const handleSaveImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setIsImageDialogOpen(false);
    setImageUrl("");
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    editor.chain().focus().insertContent(emojiObject.emoji).run();
  };

  const handleFontSizeChange = (value: string) => {
    if (value === "default") {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(value).run();
    }
    editor.commands.focus();
  };

  const currentTheme = theme === "system" ? systemTheme : theme;
  const emojiTheme = currentTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  const emojiStyle = EmojiStyle.NATIVE;
  const suggestionMode = SuggestionMode.RECENT;

  return (
    <>
      <div className="border focus-within:border-ring overflow-hidden bg-background rounded-md transition-all duration-300 ring-offset-background focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:ring-offset-0">
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 backdrop-blur-sm">
          {/* --- Font Size Group --- */}
          <div className="flex items-center gap-2 mr-1">
            <Select
              value={currentFontSize}
              onValueChange={handleFontSizeChange}
            >
              <SelectTrigger
                className="h-8 w-[110px] text-xs"
                aria-label="Font Size"
              >
                <SelectValue placeholder="الحجم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">افتراضي</SelectItem>
                <SelectItem value="12px">صغير (12px)</SelectItem>
                <SelectItem value="14px">عادي (14px)</SelectItem>
                <SelectItem value="16px">كبير (16px)</SelectItem>
                <SelectItem value="20px">عنوان صغير (20px)</SelectItem>
                <SelectItem value="24px">عنوان متوسط (24px)</SelectItem>
                <SelectItem value="32px">عنوان كبير (32px)</SelectItem>
                <SelectItem value="48px">عملاق (48px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Style Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("bold") && "bg-muted font-bold",
              )}
              title="عريض"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("italic") && "bg-muted",
              )}
              title="مائل"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("strike") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("strike") && "bg-muted",
              )}
              title="مشطوب"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("highlight") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={cn(
                "h-8 w-8 p-0 text-yellow-600",
                editor.isActive("highlight") && "bg-yellow-100",
              )}
              title="تظليل"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={
                editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className="h-8 w-8 p-0"
              title="عنوان 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className="h-8 w-8 p-0"
              title="عنوان 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className="h-8 w-8 p-0"
              title="يمين"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className="h-8 w-8 p-0"
              title="وسط"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={
                editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className="h-8 w-8 p-0"
              title="يسار"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists & Tasks Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="h-8 w-8 p-0"
              title="قائمة نقطية"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="h-8 w-8 p-0"
              title="قائمة رقمية"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={editor.isActive("taskList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className="h-8 w-8 p-0"
              title="قائمة مهام"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Media, Links & Emoji Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("link") ? "secondary" : "ghost"}
              size="sm"
              onClick={handleOpenLinkDialog}
              className="h-8 w-8 p-0"
              title="رابط"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            {/* زر الصورة يفتح الـ Dialog */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleOpenImageDialog}
              className="h-8 w-8 p-0"
              title="صورة"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {/* Emoji Picker Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400"
                  title="إيموجي"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 border-0 shadow-xl"
                align="start"
                side="bottom"
              >
                <EmojiPicker
                  // export {  SuggestionMode, SkinTonePickerLocation, CategoryIcons, CategoryConfig, } from './types/exposedTypes';
                  reactionsDefaultOpen={true}
                  emojiStyle={emojiStyle}
                  theme={emojiTheme}
                  onEmojiClick={onEmojiClick}
                  searchPlaceHolder="بحث عن إيموجي..."
                  width={320}
                  height={400}
                  lazyLoadEmojis={true}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled={false}
                />
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("blockquote") && "bg-muted",
              )}
              title="اقتباس"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Utils Group */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
              className="h-8 w-8 p-0"
              title="مسح التنسيق"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Undo/Redo - Far Right */}
          <div className="ml-auto flex gap-1 border-l pl-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0"
              title="تراجع"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0"
              title="إعادة"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content Area */}
        <EditorContent editor={editor} />
      </div>

      {/* --- Link Dialog --- */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة/تعديل رابط</DialogTitle>
            <DialogDescription>
              أدخل الرابط الذي تريد الإضافة إليه. اتركه فارغاً لإزالة الرابط.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
              onKeyDown={(e) => e.key === "Enter" && handleSaveLink()}
              autoFocus
              dir="ltr"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveLink}>
              {linkUrl ? "حفظ" : "إزالة الرابط"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Image Dialog (جديد) --- */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة صورة</DialogTitle>
            <DialogDescription>
              أدخل رابط الصورة (URL) لإضافتها إلى المحتوى.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full"
              onKeyDown={(e) => e.key === "Enter" && handleSaveImage()}
              autoFocus
              dir="ltr"
            />
            {/* معاينة صغيرة للصورة إذا كان الرابط صالحاً (اختياري) */}
            {imageUrl && (
              <div className="mt-4 flex justify-center bg-muted/50 rounded-md p-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-32 object-contain rounded"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveImage} disabled={!imageUrl}>
              إضافة صورة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
