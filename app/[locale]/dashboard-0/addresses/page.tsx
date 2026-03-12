import AddressesPage from "@/components/dashboard/addresses/addresses-page";
import { getAddresses } from "@/lib/actions/address";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "My Addresses",
  description: "Manage your shipping addresses.",
});

export default async function Page() {
  const addresses = await getAddresses();
  return <AddressesPage addresses={addresses.data || []} />;
}
