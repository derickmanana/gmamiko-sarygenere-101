import { defineMcp } from "@lovable.dev/mcp-js";
import generateProductPhoto from "./tools/generate-product-photo";

export default defineMcp({
  name: "gmamiko101-mcp",
  title: "GMAMIKO101",
  version: "0.1.0",
  instructions:
    "GMAMIKO101 exposes generic AI product-advertising tools. No user accounts, no history — every call is independent. Use `generate_product_photo` to turn a text prompt (and optional reference image) into a premium e-commerce ad photo.",
  tools: [generateProductPhoto],
});
