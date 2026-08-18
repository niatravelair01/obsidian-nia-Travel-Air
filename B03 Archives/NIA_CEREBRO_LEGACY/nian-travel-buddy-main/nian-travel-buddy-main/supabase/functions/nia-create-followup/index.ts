import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FollowUpPayload {
  client_id: string;
  tipo: string;
  data_agendada?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FollowUpPayload = await req.json();

    // Validate required fields
    if (!body.client_id || typeof body.client_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Campo 'client_id' é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.tipo || typeof body.tipo !== "string" || body.tipo.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Campo 'tipo' é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify client belongs to same company (RLS already filters, but explicit check)
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", body.client_id)
      .eq("company_id", user.id)
      .maybeSingle();

    if (clientError) throw clientError;

    if (!client) {
      return new Response(
        JSON.stringify({ success: false, error: "Cliente não encontrado ou não pertence à sua empresa" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        company_id: user.id,
        client_id: body.client_id,
        tipo: body.tipo.trim(),
        status: "pendente",
        data_agendada: body.data_agendada || null,
      })
      .select("id")
      .single();

    if (error) throw error;

    console.log("[nia-create-followup] Follow-up created:", data.id);

    return new Response(
      JSON.stringify({ success: true, followup_id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[nia-create-followup] Error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
