import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError, redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Check if required environment variables are set
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      console.error("Missing required environment variables: SHOPIFY_API_KEY or SHOPIFY_API_SECRET");
      return { 
        apiKey: process.env.SHOPIFY_API_KEY || "",
        error: "Configuration Error: Missing Shopify credentials. Please check your .env file."
      };
    }

    await authenticate.admin(request);
    // eslint-disable-next-line no-undef
    return { apiKey: process.env.SHOPIFY_API_KEY || "", error: null };
  } catch (error) {
    console.error("Authentication error:", error);
    // If authentication fails, redirect to login
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    if (shop) {
      throw redirect(`/auth/login?shop=${shop}`);
    }
    throw redirect("/");
  }
};

export default function App() {
  const { apiKey, error } = useLoaderData<typeof loader>();

  // If there's a configuration error, show it prominently
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unable to Connect to Shopify</h1>
          </div>
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">To fix this issue:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Go to your Shopify Partner Dashboard at <a href="https://partners.shopify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">partners.shopify.com</a></li>
                <li>Find your app and copy the <strong>API Secret Key</strong></li>
                <li>Open the <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code> file in your project</li>
                <li>Replace <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">your_api_secret_here</code> with your actual API Secret</li>
                <li>Restart your development server</li>
              </ol>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help? Check the <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">REAL_SHOPIFY_SETUP.md</code> file for detailed setup instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppProvider embedded apiKey={apiKey}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <s-app-nav className="bg-white dark:bg-gray-800 border-b border-green-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-6 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-green-500">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_319)">
                    <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_319">
                      <rect fill="white" height="48" width="48"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dragon Bundle</h1>
            </div>
            <nav className="flex items-center gap-4">
              <s-link href="/app/home" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Home</s-link>
              <s-link href="/app/create-bundle" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Create Bundle</s-link>
              <s-link href="/app/stats" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Stats</s-link>
              <s-link href="/app/settings" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Settings</s-link>
            </nav>
          </div>
        </s-app-nav>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
