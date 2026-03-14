import { type User } from "@supabase/supabase-js";
import { Category } from "./category";

// ==============================================================================
// Generate Random Discount Code
// =============================================================================
export function generateRandomCode(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}




// =============================================================================
// Parse User Names
// =============================================================================
export function parseUserNames(user: User | null) {
  if (!user) {
    return { firstName: "", lastName: "" };
  }

  const meta = user.user_metadata;

  if (meta.first_name || meta.last_name) {
    return {
      firstName: meta.first_name || "",
      lastName: meta.last_name || "",
    };
  }

  if (meta.name) {
    const nameParts = meta.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    return { firstName, lastName };
  }
  return { firstName: "", lastName: "" };
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
