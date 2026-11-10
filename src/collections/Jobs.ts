import type { Access, CollectionConfig } from "payload"

const isAppUser = (user: unknown): user is {
  collection: "users"
  id: string
  role?: string
} =>
  typeof user === "object" &&
  user !== null &&
  "collection" in user &&
  user.collection === "users"

const canReadOrUpdate: Access = ({ req }) => {
  if (!isAppUser(req.user)) return false
  if (req.user.role === "manager") return true
  return { cleaner: { equals: req.user.id } }
}

const managerOnly: Access = ({ req }) =>
  isAppUser(req.user) && req.user.role === "manager"
const managerField = ({ req }: { req: { user: unknown } }) =>
  isAppUser(req.user) && req.user.role === "manager"

export const Jobs: CollectionConfig = {
  slug: "jobs",
  admin: {
    group: "CleanFlow",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "scheduledAt",
      "cleaner",
      "status",
      "estimatedEarnings",
    ],
  },
  access: {
    create: managerOnly,
    read: canReadOrUpdate,
    update: canReadOrUpdate,
    delete: managerOnly,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      access: { update: managerField },
    },
    {
      name: "clientName",
      type: "text",
      required: true,
      access: { update: managerField },
    },
    {
      name: "serviceAddress",
      type: "text",
      required: true,
      access: { update: managerField },
    },
    {
      name: "property",
      type: "relationship",
      relationTo: "properties",
      access: { update: managerField },
    },
    {
      name: "cleaner",
      type: "relationship",
      relationTo: "users",
      required: true,
      access: { update: managerField },
    },
    {
      name: "scheduledAt",
      type: "date",
      required: true,
      access: { update: managerField },
    },
    {
      name: "durationMinutes",
      type: "number",
      required: true,
      min: 15,
      access: { update: managerField },
    },
    {
      name: "estimatedEarnings",
      type: "number",
      required: true,
      min: 0,
      access: { update: managerField },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "scheduled",
      options: [
        { label: "Scheduled", value: "scheduled" },
        { label: "Accepted", value: "accepted" },
        { label: "In progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
      ],
    },
    {
      name: "instructions",
      type: "textarea",
      access: { update: managerField },
    },
    {
      name: "checklist",
      type: "array",
      access: { update: managerField },
      fields: [
        { name: "task", type: "text", required: true },
        { name: "completed", type: "checkbox", defaultValue: false },
      ],
    },
  ],
}
