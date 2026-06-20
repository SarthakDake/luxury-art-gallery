import { ShipOrderButton } from "@/app/admin/orders/ShipOrderButton";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/types/artwork";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AdminOrdersPage() {
  await requireAdminSession();

  const orders = await prisma.order.findMany({
    where: {
      status: {
        not: "PENDING",
      },
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Admin Orders" },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="admin-orders-intro">
        <p className="eyebrow">Artist Dashboard</p>
        <h1 className="page-title">Order Management</h1>
        <p className="body-text max-w-2xl">
          Review confirmed payments and update fulfillment status as works leave
          the studio.
        </p>
      </Reveal>

      {orders.length === 0 ? (
        <Reveal variant="fade-in" className="admin-orders-empty">
          <p className="body-text">No confirmed orders yet.</p>
        </Reveal>
      ) : (
        <Reveal variant="slide-up" className="admin-orders-table-wrap">
          <div className="admin-orders-table-scroll">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Buyer Email</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="Order ID">
                      <span className="admin-orders-id">
                        {order.id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td data-label="Date">
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(order.createdAt)}
                    </td>
                    <td data-label="Buyer Email">{order.user.email}</td>
                    <td data-label="Total">{formatPrice(Number(order.totalAmount))}</td>
                    <td data-label="Status">
                      <span className="admin-orders-status">
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td data-label="Action">
                      {order.status === "PAID" ? (
                        <ShipOrderButton orderId={order.id} />
                      ) : (
                        <span className="text-sm text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}
    </div>
  );
}
