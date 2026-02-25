"use client";

import { Search } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

export default function LoadingPage() {
 return (
   <Empty className="h-[60vh]">
     <EmptyHeader>
       <EmptyMedia variant="icon">
         <Search className="rtl:rotate-y-180" />
       </EmptyMedia>
       <EmptyTitle>Searching...</EmptyTitle>
       <EmptyDescription className="max-w-xs text-pretty">
       </EmptyDescription>
     </EmptyHeader>
     <EmptyContent>
    
     </EmptyContent>
   </Empty>
 );
}
