"use server";

import { createSafeActionClient } from "next-safe-action";
import { auth } from "../auth";
import { orderProduct, orders } from "../schema";
import { createOrderSchema } from "@/app/type/order-schema";
import { db } from "..";

const action = createSafeActionClient();

export const createOrder = action(
  createOrderSchema,
  async ({ products, status, total, paymentIntentID }) => {
    const user = await auth();
    if (!user) return { error: "user not found" };

    const order = await db
      .insert(orders)
      .values({
        status,
        paymentIntentID,
        total,
        userID: user.user.id,
      })
      .returning();
    const orderProducts = products.map(
      async ({
        productID,
        variantID,
        quantity,
      }: {
        productID: number;
        variantID: number;
        quantity: number;
      }) => {
        const newOrderProduct = await db.insert(orderProduct).values({
          quantity,
          orderID: order[0].id,
          productID: productID,
          productVariantID: variantID,
        });
      }
    );
    return { success: "Order has been added!" };
  }
);
