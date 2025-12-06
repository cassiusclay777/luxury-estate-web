/**
 * =============================================================================
 * SUPABASE EDGE FUNCTION - Price Drop Notifications
 * =============================================================================
 * Scheduled function (cron) that:
 * 1. Detects price drops on properties
 * 2. Finds subscribed users
 * 3. Sends Web Push notifications
 *
 * Schedule: Daily at 9:00 AM (pg_cron)
 *
 * @author LuxEstate Team 2025
 * @license MIT
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// TYPES
// =============================================================================

interface PriceDrop {
  id: string;
  title: string;
  old_price: number;
  new_price: number;
  price_change: number;
  price_change_percent: number;
  image_url?: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string;
}

// =============================================================================
// WEB PUSH HELPERS
// =============================================================================

/**
 * Send Web Push notification
 */
async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    type: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
  }
) {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys not configured');
  }

  // Using web-push compatible endpoint
  // In production, you'd use a proper web-push library
  // For Deno, we'll make a direct fetch to the push service

  const pushEndpoint = subscription.endpoint;

  // This is a simplified version - in production use web-push library
  const response = await fetch(pushEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400', // 24 hours
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`Push failed for ${subscription.endpoint}:`, await response.text());
  }

  return response.ok;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Price Drop] Starting check...');

    // 1. Find properties with price drops in last 24 hours
    const { data: priceDrops, error: propsError } = await supabase.rpc(
      'get_recent_price_drops',
      { hours_ago: 24 }
    );

    if (propsError) {
      console.error('[Price Drop] Error fetching drops:', propsError);
      throw propsError;
    }

    if (!priceDrops || priceDrops.length === 0) {
      console.log('[Price Drop] No price drops found');
      return new Response(
        JSON.stringify({ success: true, message: 'No price drops', sent: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Price Drop] Found ${priceDrops.length} price drops`);

    // 2. Get all push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      console.error('[Price Drop] Error fetching subscriptions:', subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[Price Drop] No subscriptions found');
      return new Response(
        JSON.stringify({ success: true, message: 'No subscriptions', sent: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Price Drop] Sending to ${subscriptions.length} subscribers`);

    // 3. Send notifications
    let sentCount = 0;

    for (const drop of priceDrops as PriceDrop[]) {
      const priceChangeFormatted = new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        maximumFractionDigits: 0,
      }).format(Math.abs(drop.price_change));

      const payload = {
        type: 'price_drop',
        title: `🎉 Klesla cena o ${priceChangeFormatted}!`,
        body: `${drop.title} - Nová cena: ${new Intl.NumberFormat('cs-CZ', {
          style: 'currency',
          currency: 'CZK',
          maximumFractionDigits: 0,
        }).format(drop.new_price)}`,
        icon: drop.image_url || '/icons/icon-192x192.png',
        image: drop.image_url,
        data: {
          propertyId: drop.id,
          url: `/properties/${drop.id}`,
          priceChange: drop.price_change,
          oldPrice: drop.old_price,
          newPrice: drop.new_price,
        },
      };

      // Send to all subscribers
      for (const sub of subscriptions as PushSubscription[]) {
        try {
          const success = await sendPushNotification(sub, payload);
          if (success) sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${sub.endpoint}:`, error);
        }
      }
    }

    console.log(`[Price Drop] Sent ${sentCount} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        priceDrops: priceDrops.length,
        sent: sentCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Price Drop] Function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
