import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  // If there's a shop parameter (from Shopify admin), redirect to auth/login
  if (shop) {
    throw redirect(`/auth/login?shop=${shop}${host ? `&host=${host}` : ''}`);
  }

  // If there's a host parameter (embedded app), redirect to auth/login
  if (host) {
    throw redirect(`/auth/login?host=${host}`);
  }

  // Only show the login form for direct access (not from Shopify admin)
  return { showForm: true };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-green-200 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
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
            </div>
          </div>
        </header>
        
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Connect your store
              </h2>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                Enter your store URL to connect your store to Dragon Bundle.
              </p>
            </div>
            
            {showForm && (
              <Form className="mt-8 space-y-6" method="post" action="/auth/login">
                <div className="rounded-lg shadow-sm -space-y-px">
                  <div>
                    <label className="sr-only" htmlFor="shop">Store URL</label>
                    <div className="relative">
                      <input
                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-gray-900 dark:text-white"
                        id="shop"
                        name="shop"
                        placeholder="your-store.myshopify.com"
                        required
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                    type="submit"
                  >
                    Connect
                  </button>
                </div>
              </Form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
