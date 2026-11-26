import type { CollectionConfig, Field } from "payload";
import { isAdmin, isStaff, noField, nobody } from "../access";
import { ORDER_STATUSES } from "../constants";
import { afterOrderChange, orderLifecycle, orderNumber } from "../hooks/orderLifecycle";

// Orders are created only by the checkout API. People in /admin move them
// through statuses, add tracking and notes. Money fields are read-only.

const locked = { access: { update: noField }, admin: { readOnly: true } } as const;
const money = (name: string, label: string): Field => ({ name, label, type: "number", ...locked });

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    group: "Orders",
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "status", "contact.name", "contact.phone", "paymentMethod", "totals.total", "createdAt"],
    listSearchableFields: ["orderNumber", "contact.phone", "contact.name", "contact.email"],
    description: "Change the status to move an order along. Stock is updated for you.",
    pagination: { defaultLimit: 25 },
  },
  defaultSort: "-createdAt",
  access: { read: isStaff, create: nobody, update: isStaff, delete: isAdmin },
  hooks: { beforeChange: [orderNumber, orderLifecycle], afterChange: [afterOrderChange] },
  fields: [
    {
      type: "row",
      fields: [
        { name: "orderNumber", type: "text", unique: true, index: true, ...locked },
        { name: "status", type: "select", required: true, index: true, options: [...ORDER_STATUSES], defaultValue: "pending_payment" },
        { name: "paymentMethod", type: "select", required: true, options: [{ label: "Online (Razorpay)", value: "online" }, { label: "Cash on delivery", value: "cod" }], ...locked },
      ],
    },
    {
      name: "stockIssue",
      label: "Stock problem: check the history below",
      type: "checkbox",
      admin: { condition: (d) => !!d?.stockIssue, description: "Untick once you have restocked or refunded." },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Customer",
          fields: [
            { name: "customer", type: "relationship", relationTo: "customers", ...locked },
            {
              name: "contact",
              type: "group",
              fields: [{ type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "phone", type: "text", required: true, index: true }, { name: "email", type: "email" }] }],
            },
            {
              name: "address",
              type: "group",
              fields: [
                { name: "line1", label: "House, street, area", type: "text", required: true },
                { type: "row", fields: [{ name: "city", type: "text", required: true }, { name: "state", type: "text" }, { name: "pincode", type: "text", required: true }] },
              ],
            },
          ],
        },
        {
          label: "Items and totals",
          fields: [
            {
              name: "items",
              type: "array",
              ...locked,
              fields: [
                { type: "row", fields: [{ name: "title", type: "text" }, { name: "variantLabel", label: "Pack", type: "text" }, { name: "sku", type: "text" }] },
                { type: "row", fields: [{ name: "qty", type: "number" }, { name: "price", type: "number" }, { name: "mrp", type: "number" }, { name: "lineTotal", type: "number" }] },
                { name: "productId", type: "text", admin: { hidden: true } },
                { name: "variantId", type: "text", admin: { hidden: true } },
                { name: "stockTaken", type: "number", admin: { hidden: true } },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "membership", label: "Includes membership", type: "checkbox", ...locked },
                { name: "membershipMonths", type: "number", admin: { hidden: true } },
              ],
            },
            {
              name: "totals",
              type: "group",
              fields: [
                { type: "row", fields: [money("mrpTotal", "MRP total"), money("subtotal", "Subtotal"), money("memberDiscount", "Member discount")] },
                { type: "row", fields: [{ name: "couponCode", type: "text", ...locked }, money("couponDiscount", "Coupon discount"), money("prepaidDiscount", "Prepaid discount")] },
                { type: "row", fields: [money("shippingFee", "Shipping"), money("membershipFee", "Membership fee"), money("total", "Total charged (₹)")] },
              ],
            },
          ],
        },
        {
          label: "Payment",
          fields: [
            {
              name: "razorpay",
              type: "group",
              fields: [
                { name: "orderId", label: "Razorpay order id", type: "text", index: true, ...locked },
                { name: "paymentId", label: "Razorpay payment id", type: "text", ...locked },
              ],
            },
            { name: "paidAt", type: "date", ...locked, admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } } },
          ],
        },
        {
          label: "Shipping",
          fields: [
            { type: "row", fields: [{ name: "courier", type: "text" }, { name: "awb", label: "AWB / tracking number", type: "text" }] },
            { name: "trackingUrl", type: "text" },
          ],
        },
        {
          label: "Notes and history",
          fields: [
            { name: "notes", label: "Internal notes", type: "textarea", admin: { description: "Only your team sees this." } },
            {
              name: "history",
              type: "array",
              ...locked,
              admin: { readOnly: true, initCollapsed: true },
              fields: [{ type: "row", fields: [{ name: "at", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } }, { name: "status", type: "text" }, { name: "by", type: "text" }] }, { name: "note", type: "text" }],
            },
          ],
        },
      ],
    },
    { name: "committed", type: "checkbox", admin: { hidden: true } },
  ],
};
