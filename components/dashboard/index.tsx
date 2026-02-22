"use client";

import {
  Heart,
  Inbox,
  MapPin,
  MessageSquareQuote,
  Package,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StarRating } from "@/components/reviews/star-rating";
import { User } from "@supabase/supabase-js";
import React from "react";
import { ProfileCard } from "./ui/profile-card";
import { DashboardCard } from "./ui/dashboard-card";
import { DashboardSummary } from "@/lib/actions/dashboard";

interface DashboardProps {
  dashboardSummary: DashboardSummary | undefined;
  user: User;
}

function NoData({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-4">
      <Inbox className="h-8 w-8 text-gray-400" />
      <p className="mt-2 text-sm">{title}</p>
    </div>
  );
}

function LatestItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full text-sm mt-4">
      <p className="font-semibold mb-2">{title}:</p>
      <div className="flex items-center p-3 rounded-lg border min-h-16">
        {children}
      </div>
    </div>
  );
}

export function IndexPage({ dashboardSummary, user }: DashboardProps) {
  const ordersSummary = dashboardSummary?.ordersSummary;
  const cartSummary = dashboardSummary?.cartSummary;
  const wishlistSummary = dashboardSummary?.wishlistSummary;
  const reviewsSummary = dashboardSummary?.reviewsSummary;
  const addressesSummary = dashboardSummary?.addressesSummary;
  return (
    <div className="flex flex-col gap-4">
      <ProfileCard user={user} />
      <div className="grid auto-rows-fr gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* My Orders */}
        <DashboardCard
          title="My Orders"
          buttonText="View All Orders"
          Icon={Package}
          iconClassName="text-green-500"
        >
          {ordersSummary && ordersSummary.totalOrders > 0 ? (
            <>
              <p className="text-muted-foreground">
                You have placed{" "}
                <span className="font-bold text-foreground">
                  {ordersSummary.totalOrders}
                </span>{" "}
                orders.
              </p>
              {ordersSummary.latestOrder && (
                <LatestItem title="Latest Order">
                  <div className="flex w-full justify-between items-center">
                    <span className="font-mono text-xs">
                      #{ordersSummary.latestOrder.id.substring(0, 8)}
                    </span>
                    <span className="capitalize px-2 py-0.5 bg-background rounded-full border text-xs">
                      {ordersSummary.latestOrder.status}
                    </span>
                  </div>
                </LatestItem>
              )}
            </>
          ) : (
            <NoData title="You haven't placed any orders yet." />
          )}
        </DashboardCard>

        {/* My Cart */}
        <DashboardCard
          title="My Cart"
          buttonText="View Cart & Checkout"
          Icon={ShoppingCart}
          iconClassName="text-sky-500"
        >
          {cartSummary && cartSummary.totalItems > 0 ? (
            <>
              <p className="text-muted-foreground">
                You have{" "}
                <span className="font-bold text-foreground">
                  {cartSummary.totalItems}
                </span>{" "}
                items in your cart.
              </p>
              <LatestItem title="Subtotal">
                <p className="text-2xl font-bold text-foreground">
                  ${cartSummary.totalPrice.toFixed(2)}
                </p>
              </LatestItem>
            </>
          ) : (
            <NoData title="Your cart is empty." />
          )}
        </DashboardCard>

        {/* My Wishlist */}
        <DashboardCard
          title="My Wishlist"
          buttonText="View Wishlist"
          Icon={Heart}
          iconClassName="text-rose-500"
        >
          {wishlistSummary && wishlistSummary.totalItems > 0 ? (
            <>
              <p className="text-muted-foreground">
                You have{" "}
                <span className="font-bold text-foreground">
                  {wishlistSummary.totalItems}
                </span>{" "}
                items in your wishlist.
              </p>
              <LatestItem title="Recently Added">
                <div className="flex -space-x-3">
                  <TooltipProvider>
                    {wishlistSummary.recentItems.map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link href={`/products/${item.products.slug}`}>
                            <img
                              src={
                                item.products.main_image_url ||
                                "/placeholder.svg"
                              }
                              alt={item.products.name}
                              className=" h-16 w-16 rounded-full border-2 border-background object-cover bg-muted hover:scale-110 transition-transform"
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>{item.products.name}</TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </LatestItem>
            </>
          ) : (
            <NoData title="Your wishlist is empty." />
          )}
        </DashboardCard>

        {/* My Reviews */}
        <DashboardCard
          title="My Reviews"
          buttonText="View All Reviews"
          Icon={MessageSquareQuote}
          iconClassName="text-amber-500"
        >
          {reviewsSummary && reviewsSummary.totalReviews > 0 ? (
            <>
              <p className="text-muted-foreground">
                You have written{" "}
                <span className="font-bold text-foreground">
                  {reviewsSummary.totalReviews}
                </span>{" "}
                reviews.
              </p>
              {reviewsSummary.latestReview && (
                <LatestItem title="Latest Review">
                  <div className="space-y-1">
                    <Link
                      href={`/products/${reviewsSummary.latestReview.product.slug}#reviews`}
                      className="font-medium hover:underline block truncate"
                    >
                      {reviewsSummary.latestReview.title ||
                        `Review for ${reviewsSummary.latestReview.product.name}`}
                    </Link>
                    <StarRating
                      rating={reviewsSummary.latestReview.rating}
                      starClassName="h-4 w-4"
                    />
                  </div>
                </LatestItem>
              )}
            </>
          ) : (
            <NoData title="You haven't written any reviews yet." />
          )}
        </DashboardCard>

        {/* My Addresses */}
        <DashboardCard
          title="My Addresses"
          buttonText="Manage Addresses"
          Icon={MapPin}
          iconClassName="text-violet-500"
        >
          {addressesSummary && addressesSummary.totalAddresses > 0 ? (
            <>
              <p className="text-muted-foreground">
                You have{" "}
                <span className="font-bold text-foreground">
                  {addressesSummary.totalAddresses}
                </span>{" "}
                saved addresses.
              </p>
              {addressesSummary.latestAddress && (
                <LatestItem title="Default Address">
                  <div className="flex w-full justify-between items-center">
                    <span className="truncate font-medium">
                      {addressesSummary.latestAddress.address_nickname}
                    </span>
                    <span className="px-2 py-0.5 bg-background rounded-full border text-xs">
                      {addressesSummary.latestAddress.country}
                    </span>
                  </div>
                </LatestItem>
              )}
            </>
          ) : (
            <NoData title="You haven't saved any addresses yet." />
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
