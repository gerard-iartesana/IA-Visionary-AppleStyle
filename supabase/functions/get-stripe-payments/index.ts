import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mode } = await req.json(); // 'test' or 'live'

    if (!mode || (mode !== "test" && mode !== "live")) {
      return new Response(JSON.stringify({ error: "Mode must be 'test' or 'live'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read the Stripe key from site_settings in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const settingKey = mode === "test" ? "stripe_sk_test" : "stripe_sk_live";
    const { data: setting, error: settingError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", settingKey)
      .single();

    if (settingError || !setting?.value) {
      return new Response(
        JSON.stringify({ error: `No se encontró la clave Stripe (${mode}). Configúrala en el panel de Pagos.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = setting.value;

    // Validate key format
    const expectedPrefix = mode === "test" ? "sk_test_" : "sk_live_";
    if (!stripeKey.startsWith(expectedPrefix)) {
      return new Response(
        JSON.stringify({ error: `La clave no tiene el formato correcto. Debe empezar por ${expectedPrefix}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Stripe API to get the last 20 charges (expand customer + balance_transaction for fees)
    const stripeResponse = await fetch("https://api.stripe.com/v1/charges?limit=20&expand[]=data.customer&expand[]=data.balance_transaction", {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });

    if (!stripeResponse.ok) {
      const errData = await stripeResponse.json();
      return new Response(
        JSON.stringify({ error: errData.error?.message || "Error al conectar con Stripe" }),
        { status: stripeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeData = await stripeResponse.json();

    // Format the charges for frontend
    const payments = stripeData.data.map((charge: any) => {
      const fee = charge.balance_transaction?.fee ? (charge.balance_transaction.fee / 100).toFixed(2) : null;
      const net = charge.balance_transaction?.net ? (charge.balance_transaction.net / 100).toFixed(2) : null;
      return {
        created_at: new Date(charge.created * 1000).toISOString(),
        customer_name: charge.billing_details?.name || charge.customer?.name || charge.metadata?.customer_name || "Sin nombre",
        customer_email: charge.billing_details?.email || charge.customer?.email || charge.receipt_email || "-",
        plan_name: charge.description || charge.metadata?.plan_name || "Pago Stripe",
        amount: (charge.amount / 100).toFixed(2),
        stripe_fee: fee,
        net_amount: net,
        currency: charge.currency === "eur" ? "€" : charge.currency.toUpperCase(),
        mode: mode,
        status: charge.status,
        stripe_id: charge.id,
        is_refunded: charge.refunded,
      };
    });

    return new Response(JSON.stringify({ payments, mode, total: payments.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
