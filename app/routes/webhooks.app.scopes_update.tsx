import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { payload, session, topic, shop } = await authenticate.webhook(request);
        console.log(`✅ Received ${topic} webhook for ${shop}`);

        const current = payload.current as string[];
        if (session) {
            await db.session.update({   
                where: {
                    id: session.id
                },
                data: {
                    scope: current.toString(),
                },
            });
            console.log(`✅ Updated scopes for session ${session.id}`);
        } else {
            console.log(`⚠️ No session found for ${shop}`);
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
