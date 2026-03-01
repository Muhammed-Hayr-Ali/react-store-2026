"use client";

import { MiniProduct } from "@/lib/actions/products-manager";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface ProductsManagePageProps {
  errors: string | undefined;
  products: MiniProduct[] | undefined;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function ProductsManagePage({
  errors,
  products,
  currentPage,
  totalPages,
  pageSize,
}: ProductsManagePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (errors) {
    return <div>{errors}</div>;
  }

  // ✅ دالة مساعدة لتحديث معلمات URL
  const updatePageParams = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    if (newPageSize) {
      params.set("pageSize", String(newPageSize));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    updatePageParams(1, Number(newSize));
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    updatePageParams(page);
  };

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const ellipsis = "...";

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push(ellipsis);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>

        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            defaultValue={"10"}
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectContent side="top">
                  {[3, 5, 10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>{" "}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Card className="p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted h-12 font-bold">
              <TableRow>
                <TableHead className="px-4">name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="px-4">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products &&
                products.map((product) => (
                  <TableRow key={product.name} className="h-14">
                    <TableCell className="px-4">{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>
                      {product.short_description.slice(0, 50)}
                    </TableCell>
                    <TableCell className="px-4">
                      {product.is_available ? "Available" : "Not Available"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            defaultValue={"10"}
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectContent side="top">
                  {[3, 5, 10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>{" "}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <div>
          <Pagination>
            <PaginationContent>
              {/* زر "السابق" */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  aria-disabled={currentPage <= 1}
                />
              </PaginationItem>

              {pageNumbers.map((page, index) =>
                typeof page === "number" ? (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={index}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  aria-disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
