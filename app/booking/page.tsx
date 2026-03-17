"use client";

import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  Calendar,
  Clock,
  Car,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getServices,
  createBooking,
  formatPrice,
  type Service,
} from "@/lib/data";
import { useAuth } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = ["Vehicle", "Service", "Schedule", "Confirm"];

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

export default function BookingPage() {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Vehicle info
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");

  // Service selection
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Scheduling
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => toast.error("Failed to load services"));
  }, []);

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return make.trim() !== "" && model.trim() !== "" && year.trim() !== "";
      case 1:
        return selectedService !== null;
      case 2:
        return date !== "" && time !== "";
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedService) return;
    try {
      const scheduledAt = new Date(`${date} ${time}`).toISOString();
      await createBooking({
        user_id: user.id,
        vehicle_id: "", // set if you have vehicle IDs saved
        service_id: selectedService,
        scheduled_at: scheduledAt,
        status: "PENDING",
        notes: notes || null,
      });
      setSubmitted(true);
      toast.success("Booking submitted successfully!");
    } catch {
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(0);
    setMake("");
    setModel("");
    setYear("");
    setVin("");
    setSelectedService(null);
    setDate("");
    setTime("");
    setNotes("");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-20 text-center">
          <Calendar className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
            Sign in to Book a Service
          </h1>
          <p className="mt-2 text-muted-foreground">
            You need an account to schedule a service appointment.
          </p>
          <Link href="/login" className="mt-6">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            Booking Confirmed
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Your {selectedServiceData?.name} appointment has been submitted. We
            will confirm your booking shortly.
          </p>
          <div className="mt-6 rounded-lg border border-border bg-card p-6 text-left">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium text-foreground">
                  {year} {make} {model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">
                  {selectedServiceData?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span className="font-medium text-primary">
                  {formatPrice(selectedServiceData?.base_price ?? 0)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/">
              <Button
                variant="outline"
                className="border-border text-foreground"
              >
                Back to Home
              </Button>
            </Link>
            <Button
              onClick={resetForm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Book Another
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="mb-2 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
            Book a Service
          </h1>
          <p className="mb-8 text-muted-foreground">
            Schedule your appointment in a few easy steps.
          </p>

          {/* Progress Steps */}
          <div className="mb-10 flex items-center gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                          ? "border-2 border-primary bg-primary/10 text-primary"
                          : "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "mb-4 h-0.5 flex-1 sm:mb-5",
                      i < step ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Vehicle */}
          {step === 0 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                    Vehicle Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your vehicle
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="make" className="text-foreground">
                    Make *
                  </Label>
                  <Input
                    id="make"
                    placeholder="e.g. Ford"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="model" className="text-foreground">
                    Model *
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g. F-150"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="year" className="text-foreground">
                    Year *
                  </Label>
                  <Input
                    id="year"
                    placeholder="e.g. 2022"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vin" className="text-foreground">
                    VIN (Optional)
                  </Label>
                  <Input
                    id="vin"
                    placeholder="Vehicle Identification Number"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Service */}
          {step === 1 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                    Select a Service
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose the service you need
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 text-left transition-colors",
                      selectedService === service.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <div>
                      <h3 className="font-medium text-foreground">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ~{service.duration_minutes} min
                      </p>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatPrice(service.base_price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                    Schedule Appointment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred date and time
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date" className="text-foreground">
                    Preferred Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Preferred Time *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm transition-colors",
                          time === slot
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notes" className="text-foreground">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe any specific issues or requests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                    Confirm Your Booking
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Review the details below
                  </p>
                </div>
              </div>
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between rounded-md bg-background px-4 py-3">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-foreground">
                    {profile?.name ?? user.email}
                  </span>
                </div>
                <div className="flex justify-between rounded-md bg-background px-4 py-3">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium text-foreground">
                    {year} {make} {model}
                  </span>
                </div>
                <div className="flex justify-between rounded-md bg-background px-4 py-3">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">
                    {selectedServiceData?.name}
                  </span>
                </div>
                <div className="flex justify-between rounded-md bg-background px-4 py-3">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-foreground">
                    {date} at {time}
                  </span>
                </div>
                <div className="flex justify-between rounded-md bg-background px-4 py-3">
                  <span className="text-muted-foreground">Estimated Cost</span>
                  <span className="font-bold text-primary">
                    {formatPrice(selectedServiceData?.base_price ?? 0)}
                  </span>
                </div>
                {notes && (
                  <div className="rounded-md bg-background px-4 py-3">
                    <span className="text-muted-foreground">Notes</span>
                    <p className="mt-1 font-medium text-foreground">{notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-1 border-border text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
