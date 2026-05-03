import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] }
};

export default withNextIntl(nextConfig);
