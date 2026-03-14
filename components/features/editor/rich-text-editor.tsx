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
  Categories,
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
} from "lucide-react";

import { useState } from "react";
import { useLocale } from "next-intl";

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

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = "اكتب شيئاً...",
  className,
}: RichTextEditorProps) {
  const locale = useLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [currentFontSize, setCurrentFontSize] = useState<string>("default");
  const [selectionState, setSelectionState] = useState(0);

  const { theme, systemTheme } = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // ✅ تعطيل العناوين تماماً
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
        types: ["paragraph"],
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
      setSelectionState((prev) => prev + 1);
    },
    onSelectionUpdate: ({ editor }) => {
      const size = editor.getAttributes("textStyle").fontSize;
      setCurrentFontSize(size || "default");
      // ✅ إزالة منطق تحديد العناوين
      setSelectionState((prev) => prev + 1);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[250px] p-4",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-0",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary/50",
          "prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
          "prose-blockquote:my-4 prose-blockquote:py-2 prose-blockquote:bg-muted/20",
          "prose-blockquote:rounded-r-lg prose-blockquote:transition-all",
          // ✅ إزالة تنسيقات العناوين
          className,
        ),
        dir: "auto",
      },
      handleKeyDown: (view, event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === "b"
        ) {
          event.preventDefault();
          editor?.chain().focus().toggleBlockquote().run();
          return true;
        }
        return false;
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

  const handleOpenImageDialog = () => {
    setImageUrl("");
    setIsImageDialogOpen(true);
  };

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

  const isTextAligned = (alignment: string) => {
    if (editor.isActive({ textAlign: alignment })) return true;
    if (!editor.getAttributes("paragraph").textAlign && alignment === "right") {
      return true;
    }
    return false;
  };

  const currentTheme = theme === "system" ? systemTheme : theme;
  const emojiTheme = currentTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  const emojiStyle = EmojiStyle.GOOGLE;

  return (
    <>
      <div className="border focus-within:border-ring overflow-hidden bg-background rounded-md transition-all duration-300 ring-offset-background focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:ring-offset-0">
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 backdrop-blur-sm">
          {/* ✅ 1. Font Size Group - أصبح أول عنصر بعد حذف العناوين */}
          <div className="flex items-center gap-2 mr-1">
            <Select
              value={currentFontSize}
              onValueChange={handleFontSizeChange}
              key={`font-select-${selectionState}`}
            >
              <SelectTrigger
                className="h-8 w-24 text-xs"
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

          {/* 2. Text Style Group */}
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
              key={`bold-${selectionState}`}
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
              key={`italic-${selectionState}`}
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
              key={`strike-${selectionState}`}
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
              key={`highlight-${selectionState}`}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 3. Alignment Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={isTextAligned("right") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={cn(
                "h-8 w-8 p-0",
                isTextAligned("right") && "bg-muted",
              )}
              title="يمين"
              key={`align-right-${selectionState}`}
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
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive({ textAlign: "center" }) && "bg-muted",
              )}
              title="وسط"
              key={`align-center-${selectionState}`}
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
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive({ textAlign: "left" }) && "bg-muted",
              )}
              title="يسار"
              key={`align-left-${selectionState}`}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 4. Lists & Tasks Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="h-8 w-8 p-0"
              title="قائمة نقطية"
              key={`bullet-${selectionState}`}
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
              key={`ordered-${selectionState}`}
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
              key={`task-${selectionState}`}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 5. Media, Links & Emoji Group */}
          <div className="flex items-center gap-1 mr-1">
            <Button
              type="button"
              variant={editor.isActive("link") ? "secondary" : "ghost"}
              size="sm"
              onClick={handleOpenLinkDialog}
              className="h-8 w-8 p-0"
              title="رابط"
              key={`link-${selectionState}`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

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

            {/* Emoji Picker */}
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
                dir={dir}
                className="w-[320px] bg-transparent p-0 border-0 shadow-none ring-0 focus:ring-0"
                align="start"
                side="bottom"
                sideOffset={8}
              >
                <EmojiPicker
                  className="font-almarai"
                  categories={[
                    {
                      category: Categories.SUGGESTED,
                      name: "المستخدمة حديثًا",
                    },
                    {
                      category: Categories.SMILEYS_PEOPLE,
                      name: "ابتسامات وأشخاص",
                    },
                    {
                      category: Categories.ANIMALS_NATURE,
                      name: "حيوانات وطبيعة",
                    },
                    { category: Categories.FOOD_DRINK, name: "طعام وشراب" },
                    { category: Categories.ACTIVITIES, name: "أنشطة" },
                    { category: Categories.TRAVEL_PLACES, name: "سفر وأماكن" },
                    { category: Categories.OBJECTS, name: "أشياء" },
                    { category: Categories.SYMBOLS, name: "رموز" },
                    { category: Categories.FLAGS, name: "أعلام" },
                  ]}
                  emojiStyle={emojiStyle}
                  theme={emojiTheme}
                  onEmojiClick={onEmojiClick}
                  searchPlaceholder="بحث عن إيموجي..."
                  width={320}
                  height={400}
                  lazyLoadEmojis={true}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled={false}
                  reactionsDefaultOpen={true}
                />
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "h-8 w-8 p-0 transition-colors",
                editor.isActive("blockquote") &&
                  "bg-muted border border-border",
              )}
              title="اقتباس (Ctrl+Shift+B)"
              key={`quote-${selectionState}`}
            >
              <Quote
                className={cn(
                  "h-4 w-4",
                  editor.isActive("blockquote") && "text-primary",
                )}
              />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 6. Utils Group */}
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

          {/* 7. Undo/Redo - Far Right */}
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
        <DialogContent className="sm:max-w-106.25">
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
              placeholder="https://example.com  "
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

      {/* --- Image Dialog --- */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
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
              placeholder="https://example.com/image.jpg  "
              className="w-full"
              onKeyDown={(e) => e.key === "Enter" && handleSaveImage()}
              autoFocus
              dir="ltr"
            />
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
