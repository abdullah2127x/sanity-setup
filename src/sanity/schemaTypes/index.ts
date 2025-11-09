import { type SchemaTypeDefinition } from "sanity";
import { fabric } from "./fabric";
import { product } from "./product";
import { color } from "./color";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [fabric, product, color],
};