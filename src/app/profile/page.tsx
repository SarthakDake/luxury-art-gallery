import { SignOutButton } from "@/components/layout/AuthActions";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getArtworks } from "@/lib/site-data";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/types/artwork";
import type { OrderStatus } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getWelcomeName(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name.trim();
  }

  if (email) {
    return email.split("@")[0] ?? "Collector";
  }

  return "Collector";
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pending Payment";
    case "PAID":
      return "Processing";
    case "CONFIRMED":
      return "Confirmed";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "SHIPPED":
    case "DELIVERED":
      return "profile-status-badge profile-status-badge--fulfilled";
    case "PAID":
    case "CONFIRMED":
    case "PROCESSING":
      return "profile-status-badge profile-status-badge--active";
    case "CANCELLED":
      return "profile-status-badge profile-status-badge--cancelled";
    default:
      return "profile-status-badge profile-status-badge--pending";
  }
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
  }).format(date);
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/profile");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const artworks = await getArtworks();
  const artworkTitles = new Map(artworks.map((artwork) => [artwork.id, artwork.title]));

  const welcomeName = getWelcomeName(session.user.name, session.user.email);

  return (
    <div className="site-container page-shell profile-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Orders" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="profile-hero">
        <p className="eyebrow">Your Account</p>
        <h1 className="profile-welcome">Welcome, {welcomeName}</h1>
        <p className="body-text profile-welcome-copy max-w-2xl">
          Track your acquisitions, review order details, and follow each piece
          from studio confirmation through delivery.
        </p>
        <div className="profile-account-actions">
          <p className="profile-account-email">{session.user.email}</p>
          <SignOutButton className="btn-secondary profile-sign-out" />
        </div>
      </Reveal>

      <Reveal as="section" variant="slide-up" className="profile-history">
        <div className="profile-history-header">
          <h2 className="profile-section-title">Order History</h2>
          <p className="body-text">
            {orders.length === 0
              ? "No orders yet."
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"} on record`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="profile-empty">
            <p className="body-text">
              When you complete checkout, your orders will appear here with live
              status updates.
            </p>
            <Link href="/shop" className="btn-primary mt-8 inline-flex">
              Browse the Shop
            </Link>
          </div>
        ) : (
          <div className="profile-orders-grid">
            {orders.map((order, index) => (
              <Reveal
                key={order.id}
                as="article"
                variant="slide-up"
                delay={index * 60}
                className="profile-order-card"
              >
                <div className="profile-order-summary">
                  <div className="profile-order-summary-main">
                    <p className="profile-order-label">Order ID</p>
                    <p className="profile-order-id">
                      {order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="profile-order-date">
                      Placed {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="profile-order-summary-side">
                    <span className={getStatusBadgeClass(order.status)}>
                      {getStatusLabel(order.status)}
                    </span>
                    <div className="profile-order-total-block">
                      <p className="profile-order-label">Total Amount</p>
                      <p className="profile-order-total">
                        {formatPrice(Number(order.totalAmount))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="profile-order-items-section">
                  <p className="profile-order-label">Acquired Works</p>
                  <ul className="profile-order-items">
                    {order.items.map((item) => (
                      <li key={item.id} className="profile-order-item">
                        <div className="profile-order-item-copy">
                          <p className="profile-order-item-title">
                            {artworkTitles.get(item.artworkId) ?? item.artworkId}
                          </p>
                          <p className="profile-order-item-meta">
                            {item.size}
                            {item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}
                          </p>
                        </div>
                        <p className="profile-order-item-price">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
