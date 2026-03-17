"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  Product,
  Service,
  Vehicle,
  Booking,
  Order,
} from "@/lib/supabase/types";
import {
  getProducts,
  getServices,
  getVehiclesByUser,
  getBookingsByUser,
  getOrdersByUser,
} from "@/lib/data";

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts(category)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading, error };
}

// ─── Services ────────────────────────────────────────────────────────────────

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { services, loading, error };
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export function useVehicles(userId: string | null) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getVehiclesByUser(userId)
      .then(setVehicles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vehicles, loading, error, refresh };
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useBookings(userId: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getBookingsByUser(userId)
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time updates for bookings
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return { bookings, loading, error, refresh };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useOrders(userId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrdersByUser(userId)
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
