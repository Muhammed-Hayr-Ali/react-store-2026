import ComingSoonPage from "@/components/common-soon/common-soon"
import Header from "@/components/layout/header"
import Navbar from "@/components/layout/navbar"
import { AppLogo } from "@/components/shared/app-logo"
import { createMetadata } from "@/lib/config/metadata_generator"

export const metadata = createMetadata({
  title: "Coming Soon",
  description:
    "Marketna is crafting a digital masterpiece. Something extraordinary is launching soon.",
  path: "/",
})

export default function Page() {
  return (
    <>
      <Header>
        <AppLogo />
        <Navbar />
      </Header>
      <ComingSoonPage />
    </>
  )
}
