import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category } from "./actions/category";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}







/**
 * يستخرج رسالة خطأ من كائن `unknown`.
 * إذا لم يتم العثور على رسالة، يُرجع رسالة افتراضية.
 * @param {unknown} error - الخطأ الذي تم التقاطه من كتلة `catch`.
 * @param {string} [defaultMessage] - رسالة اختيارية ليتم إرجاعها إذا لم يتم العثور على رسالة خطأ.
 * @returns {string} رسالة الخطأ كسلسلة نصية.
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "An unexpected error occurred."
): string {
  // تحقق مما إذا كان `error` كائنًا ويحتوي على خاصية `message`
  if (error && typeof error === 'object' && 'message' in error) {
    // تأكد من أن `message` هو سلسلة نصية
    if (typeof error.message === 'string') {
      return error.message;
    }
  }
  
  // إذا لم يكن كذلك، أرجع الرسالة الافتراضية
  return defaultMessage;
}











// ===============================================================================
// Build Category Tree Action
// ===============================================================================
export type TreeNode<T> = T & { children: TreeNode<T>[] };

export function buildCategoryTree(categories: Category[]): TreeNode<Category>[] {
  const categoryMap = new Map<string, TreeNode<Category>>();
  const rootCategories: TreeNode<Category>[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  categoryMap.forEach((node) => {
    if (node.parent_id && categoryMap.has(node.parent_id)) {
      categoryMap.get(node.parent_id)!.children.push(node);
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}
