"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  History,
  X,
  CornerDownLeft,
  BrushCleaning,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchDialogProps {
  children: React.ReactNode;
}

//================================================================================
// 1. الخطاف المخصص لإدارة سجل البحث (يبقى كما هو)
//================================================================================
const useSearchHistory = (storageKey: string = "search-history") => {
  const [history, setHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history:", error);
    }
  }, [storageKey]);

  const addSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [
      term,
      ...history.filter((item) => item.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  const removeSearchTerm = (term: string) => {
    const newHistory = history.filter((item) => item !== term);
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  return { history, addSearchTerm, removeSearchTerm, clearHistory };
};

//================================================================================
// 2. مكون المحتوى الديناميكي (يتم عرضه فقط عند الحاجة)
//================================================================================
const SearchDialogContent = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = React.useState("");
  const { history, addSearchTerm, removeSearchTerm, clearHistory } =
    useSearchHistory();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // التركيز على حقل الإدخال عند فتح النافذة
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    addSearchTerm(query);
    onClose(); // إغلاق النافذة
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const onHistoryClick = (term: string) => {
    setQuery(term);
    addSearchTerm(term);
    onClose(); // إغلاق النافذة
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.info("Search history has been cleared.");
  };

  return (
    <DialogContent
      showCloseButton={false}
      className="p-0 gap-0 overflow-hidden max-h-[80svh] flex flex-col"
    >
      <DialogHeader className="p-3 border-b shrink-0">
        <DialogTitle>
          <form
            onSubmit={handleSearch}
            className="bg-muted border border-input p-2 rounded-md flex items-center gap-2"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              placeholder="Search Products..."
              className="outline-0 bg-transparent w-full text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </DialogTitle>
      </DialogHeader>

      {history.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground px-2">
              Recent Searches
            </h3>
            <ul className="flex flex-col gap-1">
              {history.map((term) => (
                <li
                  key={term}
                  className="group flex items-center justify-between rounded-md hover:bg-accent p-2 cursor-pointer"
                  onClick={() => onHistoryClick(term)}
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{term}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${term} from history`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearchTerm(term);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <DialogFooter className="p-3 border-t bg-muted/50 shrink-0">
        <div className="flex items-center justify-center w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="flex gap-1 items-center">
              <span>Escape to close</span>
              <Kbd className="bg-background border">Esc</Kbd>
            </button>
            <div className="w-px h-4 bg-border mx-2" />
            <button onClick={handleSearch} className="flex gap-1 items-center">
              <span>Enter to submit</span>
              <Kbd className="bg-background border">
                <CornerDownLeft className="h-3 w-3" />
              </Kbd>
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex gap-1 items-center"
              >
                <div className="w-px h-4 bg-border mx-2" />
                <span>Clear history</span>
                <Kbd className="bg-background border">
                  <BrushCleaning className="h-2.5 w-2.5" />
                </Kbd>
              </button>
            )}
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

//================================================================================
// 3. المكون الرئيسي المبسط (آمن للعرض من جانب الخادم)
//================================================================================
export const SearchDialog = ({ children }: SearchDialogProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // اختصار لوحة المفاتيح لفتح النافذة
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {isOpen && <SearchDialogContent onClose={() => setIsOpen(false)} />}
    </Dialog>
  );
};

//  <div>
//     {size === "deafult" ? (
//       <Button
//         variant={"ghost"}
//         className="flex rounded-sm h-12 lg:h-8 items-center bg-[#F2F2F2] hover:bg-[#EBEBEB] dark:bg-[#1A1A1A] dark:hover:bg-[#1F1F1F] justify-between min-w-3xs px-1.5 py-2"
//       >
//         <div className="flex items-center gap-2">
//           <Search className="h-4 w-4 text-muted-foreground block lg:hidden" />
//           <span className="text-xs font-mono font-normal">
//             Search Products...
//           </span>
//         </div>
//         <Kbd dir="ltr" className="bg-background hidden lg:block">
//           ⌘K
//         </Kbd>
//       </Button>
//     ) : (
//       <Button variant={"ghost"} size={"icon"}>
//         <Search/>
//       </Button>
//     )}
//     </div>
