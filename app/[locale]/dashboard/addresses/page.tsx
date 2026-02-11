import AddressesPage from "@/components/dashboard/addresses/addresses-page";
import { getUserAddresses } from "@/lib/actions/address-actions";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "My Addresses",
  description: "Manage your shipping addresses.",
});

export default async function Page() {
  const addresses = await getUserAddresses();
  return <AddressesPage addresses={addresses} />;
}
