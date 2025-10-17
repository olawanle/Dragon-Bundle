import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);

    console.log(`✅ Received ${topic} webhook for ${shop}`);

    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (session) {
      await db.session.deleteMany({ where: { shop } });
      console.log(`✅ Deleted sessions for ${shop}`);
    } else {
      console.log(`⚠️ No session found for ${shop} (may have been already deleted)`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`❌ Webhook error:`, error);
    // Return 200 even on error to prevent webhook retry storms
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};
