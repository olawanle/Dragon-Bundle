import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { addSecurityHeaders } from "./middleware.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {};
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers(loaderHeaders);
  return headers;
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com/" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: "class",
                theme: {
                  extend: {
                    colors: {
                      primary: "#38e07b",
                      "background-light": "#f6f8f7",
                      "background-dark": "#122017",
                      "text-light": "#111714",
                      "text-dark": "#e8ebe9",
                      "subtle-light": "#f0f4f2",
                      "subtle-dark": "#1a2c20"
                    },
                    fontFamily: {
                      display: ["Manrope", "sans-serif"],
                    },
                    borderRadius: {
                      DEFAULT: "0.25rem",
                      lg: "0.5rem",
                      xl: "0.75rem",
                      full: "9999px",
                    },
                  },
                },
              };
            `,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
