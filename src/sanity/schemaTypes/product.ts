import { defineField, defineType } from "sanity";
import { v4 as uuidv4 } from "uuid";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Product Title",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(100)
          .custom(async (value, context) => {
            if (!value) return true;

            const { document, getClient } = context as any;
            const client = getClient({ apiVersion: "2023-01-01" });

            // Fetch the existing product (published or draft)
            const currentDoc = await client.fetch(
              `*[_type == "product" && _id == $id][0]`,
              { id: document._id }
            );

            // If the title didn't change, skip uniqueness check
            if (currentDoc?.title === value) {
              return true;
            }

            // Otherwise check for duplicates
            const duplicate = await client.fetch(
              `*[_type == "product" && title == $title && _id != $id][0]`,
              { title: value, id: document._id }
            );

            return duplicate ? "This title is already taken" : true;
          }),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subTitle",
      title: "Product Subtitle",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(60),
    }),

    defineField({
      name: "audience",
      title: "Audience",
      type: "string",
      options: {
        list: [
          { title: "Men", value: "men" },
          { title: "Women", value: "women" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Un Stitched", value: "unStitched" },
          { title: "Stitched", value: "stitched" },
          { title: "Ready To Wear", value: "readyToWear" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),

    defineField({
      name: "subCategory",
      title: "Sub Category",
      type: "string",
      options: {
        list: [
          { title: "Top", value: "top" },
          { title: "Bottom", value: "bottom" },
          { title: "2 Piece", value: "2piece" },
          { title: "3 Piece (Full Set)", value: "3piece" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "menOutfitType",
      title: "Men Outfit Type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Polo Shirt", value: "polo" },
          { title: "T-Shirt", value: "tshirt" },
          { title: "Formal Shirt", value: "shirt" },
          { title: "Kurta", value: "kurta" },
          { title: "Waistcoat", value: "waistcoat" },
          { title: "Formal Suit (2 Piece)", value: "2pieceSuit" },
          { title: "Formal Suit (3 Piece)", value: "3pieceSuit" },
          { title: "Sherwani", value: "sherwani" },
          { title: "Jeans", value: "jeans" },
          { title: "Trousers / Chinos", value: "trousers" },
          { title: "Shorts", value: "shorts" },
          { title: "Tracksuit / Gym Wear", value: "tracksuit" },
        ],
      },
      hidden: ({ parent }) => parent?.audience !== "men",
      validation: (Rule) =>
        Rule.custom((field, context) => {
          const parent = (context as { parent?: { audience?: string } }).parent;
          if (parent?.audience === "men" && !field) {
            return "Outfit type is required for men";
          }
          return true;
        }),
    }),

    defineField({
      name: "womenOutfitType",
      title: "Women Outfit Type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Kurti / Shirt", value: "kurti" },
          { title: "Polo Shirt", value: "polo" },
          { title: "T-Shirt", value: "tshirt" },
          { title: "Blouse / Tunic", value: "blouse" },
          { title: "Dress / Maxi", value: "dress" },
          { title: "Gown", value: "gown" },
          { title: "Saree", value: "saree" },
          { title: "Lehenga Choli", value: "lehenga" },
          { title: "Anarkali Suit", value: "anarkali" },
          { title: "2 Piece (Kurti + Trouser)", value: "2pieceSuit" },
          { title: "3 Piece (Kurti + Trouser + Dupatta)", value: "3pieceSuit" },
          { title: "Jeans / Trousers", value: "jeansTrousers" },
          { title: "Skirt", value: "skirt" },
          { title: "Leggings / Jeggings", value: "leggings" },
          { title: "Tracksuit / Gym Wear", value: "tracksuit" },
        ],
      },
      hidden: ({ parent }) => parent?.audience !== "women",
      validation: (Rule) =>
        Rule.custom((field, context) => {
          const parent = (context as { parent?: { audience?: string } }).parent;
          if (parent?.audience === "women" && !field) {
            return "Outfit type is required for women";
          }
          return true;
        }),
    }),

    defineField({
      name: "season",
      title: "Season",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Summer", value: "summer" },
          { title: "Winter", value: "winter" },
        ],
        layout: "grid",
        direction: "horizontal",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "designs",
      title: "Designs",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "grid",
        list: [
          { title: "Plain", value: "plain" },
          { title: "Printed", value: "printed" },
          { title: "Embroidered", value: "embroidered" },
          { title: "Block Print", value: "block_print" },
          { title: "Digital Print", value: "digital_print" },
          { title: "Geometric", value: "geometric" },
          { title: "Floral", value: "floral" },
          { title: "Abstract", value: "abstract" },
          { title: "Minimalist", value: "minimalist" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: "occasions",
      title: "Occasions",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "grid",
        list: [
          { title: "Casual", value: "casual" },
          { title: "Formal", value: "formal" },
          { title: "Party / Festive", value: "party" },
          { title: "Wedding", value: "wedding" },
          { title: "Office / Workwear", value: "office" },
          { title: "Eid / Religious", value: "eid" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: "fabric",
      title: "Fabric",
      type: "reference",
      to: [{ type: "fabric" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().positive().precision(2),
    }),

    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "color",
              title: "Color",
              type: "reference",
              to: [{ type: "color" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "featuredImage",
              title: "Featured Image",
              type: "image",
              validation: (Rule) => Rule.required(),
              options: { hotspot: true },
            }),
            defineField({
              name: "additionalImages",
              title: "Additional Images",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
            }),
            defineField({
              name: "stock",
              title: "Stock",
              type: "number",
              validation: (Rule) =>
                Rule.required()
                  .min(0)
                  .error("Stock must be 0 or a positive number"),
            }),
          ],
        },
      ],
      validation: (Rule) =>
        Rule.min(1)
          .required()
          .error(
            "Image Error: At least 1 image is required, color should be different for each image"
          )
          .custom((variants?: Array<{ color?: { _ref?: string } }>) => {
            if (!variants) return true;

            const seen = new Set();
            for (const variant of variants) {
              const colorId = variant?.color?._ref;
              if (!colorId) continue;

              if (seen.has(colorId)) {
                return "You can't select the same color for multiple variants";
              }
              seen.add(colorId);
            }

            return true;
          }),
    }),

    defineField({
      name: "discount",
      title: "Discount (%)",
      type: "number",
      description: "Discount percentage applied to the product price",
      initialValue: 0,
      validation: (Rule) =>
        Rule.min(0).max(100).error("Discount must be between 0 and 100"),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "relevantTags",
      title: "Relevant Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags", // shows as tags instead of plain array
      },
      description:
        "Add relevant tags that describe the product. Useful for search and SEO.",
    }),

    defineField({
      name: "isFeatured",
      title: "Featured Product",
      description: "Featured products show on the home page",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "isNewArrival",
      title: "New Arrival",
      description: "Newly launched products",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "isPopular",
      type: "boolean",
      title: "Most Popular",
      initialValue: false,
    }),
  ],
});