"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  CircleCheckBig,
  CircleMinus,
  MoreHorizontal,
} from "lucide-react";

import { deleteProduct, MiniProduct } from "@/lib/actions/products-manager";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ProductsManagePageProps {
  errors: string | undefined;
  products: MiniProduct[] | undefined;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

function DeleteProductsDialog({
  children,
  productId,
  productName,
}: {
  children: React.ReactNode;
  productId: string;
  productName: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    const { error } = await deleteProduct(productId);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Product deleted successfully");
    router.refresh();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {productName}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Yes Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// =================================================================
// 1. تعريف الأعمدة (Columns Definition)
// =================================================================
export const columns: ColumnDef<MiniProduct>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="w-full flex justify-between items-center">
          <span>Name</span>
          <Button
            variant="ghost"
            size={"icon-xs"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "category",

    header: ({ column }) => {
      return (
        <div className="w-full flex justify-between items-center">
          <span>Category</span>
          <Button
            variant="ghost"
            size={"icon-xs"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <div className="w-full flex justify-between items-center">
          <span>Brand</span>
          <Button
            variant="ghost"
            size={"icon-xs"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "is_available",

    header: ({ column }) => {
      return (
        <div className="w-full flex justify-between items-center">
          <span>Available</span>
          <Button
            variant="ghost"
            size={"icon-xs"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const isAvailable = row.getValue("is_available");
      return (
        <div className="">
          {!isAvailable && (
            <Badge variant={"outline"}>
              <CircleMinus className="h-6 w-6 text-red-500  pr-1 rtl:pr-0 rtl:pl-1" />
              Not Available
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "is_featured",
    header: ({ column }) => {
      return (
        <div className="w-full flex justify-between items-center">
          <span>Featured</span>
          <Button
            variant="ghost"
            size={"icon-xs"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const isFeatured: boolean = row.getValue("is_featured");
      return (
        <div>
          {isFeatured && (
            <Badge variant={"outline"}>
              <CircleCheckBig className="h-6 w-6 text-green-500 pr-1 rtl:pr-0 rtl:pl-1" />{" "}
              Featured Product
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    header: () => <div className="w-full text-center">Actions</div>,
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-full text-center">
              <Button variant="ghost" size={"icon-xs"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${product.id}/edit`}>
                Edit product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <DeleteProductsDialog
                productName={product.name}
                productId={product.id}
              >
                <Button variant="destructive">Delete product</Button>
              </DeleteProductsDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ProductsManagePage({
  products = [], // قيمة افتراضية لمنع الأخطاء
  currentPage,
  totalPages,
  pageSize,
}: ProductsManagePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // حالة للفرز وتحديد الصفوف
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  // =================================================================
  // 3. تهيئة الجدول (useReactTable)
  // =================================================================
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // تفعيل الفرز
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

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
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">Add Product</Link>
        </Button>
      </div>

      {/* ================================================================= */}
      {/* 4. ربط الجدول بالواجهة الأمامية (JSX) */}
      {/* ================================================================= */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* شريط التحكم السفلي (الترقيم وحجم الصفحة) */}

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
