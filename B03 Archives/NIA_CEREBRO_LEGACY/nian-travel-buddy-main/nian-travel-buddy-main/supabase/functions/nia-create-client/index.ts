import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientPayload {
  // Required fields
  name: string;
  company_id: string;
  
  // Optional fields
  id?: string; // If provided, will update existing client
  email?: string;
  phone?: string;
  destination?: string;
  status?: "atendimento" | "negociacao" | "pos-venda" | "lead" | "inativo";
  travel_profile?: string;
  average_budget?: number;
  destinations_of_interest?: string[];
  hotel_preference?: string;
  flight_class_preference?: string;
  price_sensitivity?: "low" | "medium" | "high";
  relationship_status?: string;
  ticket_type?: "alto" | "premium" | "medio" | "economico";
  valor_lifetime?: number;
  notes?: string;
}

interface RequestBody {
  action: "create" | "update" | "upsert";
  client: ClientPayload;
  triggered_by?: string; // Optional: track which NIA action triggered this
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    console.log("[nia-create-client] Received request:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.client) {
      return new Response(
        JSON.stringify({ error: "Missing 'client' object in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.client.name) {
      return new Response(
        JSON.stringify({ error: "Client name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.client.company_id) {
      return new Response(
        JSON.stringify({ error: "company_id is required for multi-tenant isolation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for backend operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const action = body.action || "upsert";
    const clientData = body.client;

    // Prepare the client record
    const clientRecord = {
      company_id: clientData.company_id,
      name: clientData.name,
      email: clientData.email || null,
      phone: clientData.phone || null,
      destination: clientData.destination || null,
      status: clientData.status || "lead",
      travel_profile: clientData.travel_profile || null,
      average_budget: clientData.average_budget || 0,
      destinations_of_interest: clientData.destinations_of_interest || [],
      hotel_preference: clientData.hotel_preference || null,
      flight_class_preference: clientData.flight_class_preference || null,
      price_sensitivity: clientData.price_sensitivity || "medium",
      relationship_status: clientData.relationship_status || null,
      ticket_type: clientData.ticket_type || "medio",
      valor_lifetime: clientData.valor_lifetime || 0,
      notes: clientData.notes || null,
      last_interaction: new Date().toISOString(),
    };

    let result;

    if (action === "create") {
      // INSERT only
      console.log("[nia-create-client] Creating new client...");
      const { data, error } = await supabase
        .from("clients")
        .insert(clientRecord)
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log("[nia-create-client] Client created:", result.id);

    } else if (action === "update" && clientData.id) {
      // UPDATE existing client
      console.log("[nia-create-client] Updating client:", clientData.id);
      const { data, error } = await supabase
        .from("clients")
        .update(clientRecord)
        .eq("id", clientData.id)
        .eq("company_id", clientData.company_id) // Ensure company isolation
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log("[nia-create-client] Client updated:", result.id);

    } else if (action === "upsert") {
      // UPSERT by email if provided, otherwise insert
      if (clientData.email) {
        console.log("[nia-create-client] Upserting by email:", clientData.email);
        
        // Check if client exists with this email in this company
        const { data: existing } = await supabase
          .from("clients")
          .select("id")
          .eq("email", clientData.email)
          .eq("company_id", clientData.company_id)
          .maybeSingle();

        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from("clients")
            .update(clientRecord)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
          console.log("[nia-create-client] Client updated via upsert:", result.id);
        } else {
          // Insert new
          const { data, error } = await supabase
            .from("clients")
            .insert(clientRecord)
            .select()
            .single();

          if (error) throw error;
          result = data;
          console.log("[nia-create-client] Client created via upsert:", result.id);
        }
      } else {
        // No email, just insert
        const { data, error } = await supabase
          .from("clients")
          .insert(clientRecord)
          .select()
          .single();

        if (error) throw error;
        result = data;
        console.log("[nia-create-client] Client created (no email for upsert):", result.id);
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'create', 'update', or 'upsert'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: action,
        client: result,
        triggered_by: body.triggered_by || "nia-assistant",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[nia-create-client] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
