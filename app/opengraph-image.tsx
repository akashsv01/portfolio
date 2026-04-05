import { OG_SIZE, OgImageResponse } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Akash S Vora — Software Engineer";

export default async function Image() {
  return OgImageResponse();
}
