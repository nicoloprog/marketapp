import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const year = searchParams.get("year");

  let query = supabase.from("products").select("*");

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (make) {
    query = query.eq("vehicle_make", make);
  }

  if (model) {
    query = query.eq("vehicle_model", model);
  }

  if (year) {
    query = query.eq("vehicle_year", year);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
