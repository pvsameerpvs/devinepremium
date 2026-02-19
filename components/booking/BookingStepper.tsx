"use client";

import { useState, useEffect } from "react";
import { Service, ServiceOption } from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, ChevronRight, ChevronLeft, Minus, Plus, MapPin, Clock, User, CreditCard } from "lucide-react";

interface BookingStepperProps {
  service: Service;
}

const STEPS = [
  { id: "service", title: "Service Details", icon: CreditCard },
  { id: "address", title: "Address", icon: MapPin },
  { id: "schedule", title: "Schedule", icon: Clock },
  { id: "contact", title: "Contact", icon: User },
];

export function BookingStepper({ service }: BookingStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    serviceOptions: {},
    address: {
      location: "",
      building: "",
      apartment: "",
      city: "Dubai",
    },
    schedule: {
      date: undefined,
      timeSlot: "",
    },
    contact: {
      fullName: "",
      email: "",
      phone: "",
      instructions: "",
    },
  });

  // Optimize total calculation with line items for summary
  const calculateBreakdown = () => {
      let total = 0; 
      const items: { label: string; amount: number }[] = [];

      // Special handling for maid cleaning to be more intuitive
      if (service.id === 'maid-cleaning') {
          const hours = Number(formData.serviceOptions['hours']) || 0;
          const crew = Number(formData.serviceOptions['crew']) || 0;
          
          if (hours > 0 && crew > 0) {
              const baseParamsTotal = hours * crew * service.basePrice;
              total += baseParamsTotal;
              items.push({ 
                  label: `${crew} Cleaner(s) x ${hours} Hour(s) @ ${service.basePrice} AED/hr`, 
                  amount: baseParamsTotal 
              });
          }

          const extras = formData.serviceOptions['extras'] || [];
            // Assuming options structure has prices for extras
            // We need to look up the option definition in service.options
            const extraOpt = service.options.find(o => o.id === 'extras');
            if (extraOpt && extraOpt.options) {
                extras.forEach((val: string) => {
                    const item = extraOpt.options?.find(o => o.value === val);
                    const price = item?.price || (val === 'supplies' ? 10 : 0); // Fallback for hardcoded
                     if (price > 0) {
                         total += price;
                         items.push({ label: item?.label || val, amount: price });
                     }
                });
            }
      } else {
        // Generic Service Logic
        // Only add base price if it's a fixed fee, not a "starting from" placeholder or per-unit rate
        if (service.basePrice > 0 && service.priceUnit !== 'starting from' && service.priceUnit !== '/hr') {
            total += service.basePrice;
            items.push({ label: "Base Price", amount: service.basePrice });
        }

        service.options.forEach(opt => {
         const val = formData.serviceOptions[opt.id];
         if (val) {
             if (opt.type === 'quantity' && opt.price) {
                 const qty = Number(val);
                 if (qty > 0) {
                    const lineTotal = qty * opt.price;
                    total += lineTotal;
                    items.push({ label: `${opt.label} (x${qty})`, amount: lineTotal });
                 }
             }
             else if (opt.type === 'checkbox' && Array.isArray(val) && opt.options) {
                  val.forEach((s: string) => {
                      const o = opt.options?.find(x => x.value === s);
                      if (o && o.price) {
                          total += o.price;
                          items.push({ label: o.label, amount: o.price });
                      }
                  });
             }
             else if (opt.type === 'select' && opt.options) {
                 const o = opt.options.find(x => x.value === val);
                 if (o && o.price) {
                    // If select overrides base label
                    items.push({ label: o.label, amount: o.price });
                 }
             }
             else if (opt.type === 'radio' && opt.options) {
                const o = opt.options.find(x => x.value === val);
                if (o && o.price) {
                    total += o.price;
                    items.push({ label: o.label, amount: o.price });
                }
             }
         }
        });
      }

      return { total, items };
  };

  const { total, items: lineItems } = calculateBreakdown();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Submit", formData);
      alert("Booking Submitted! (Check console for data)");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateServiceOption = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      serviceOptions: { ...prev.serviceOptions, [key]: value },
    }));
  };

  const renderServiceStep = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-6">
        {service.options.map((opt) => (
          <div key={opt.id} className="space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-gray-800">{opt.label}</Label>
                {opt.price && opt.type === 'quantity' && <span className="text-sm text-muted-foreground font-medium">{opt.price} AED / unit</span>}
             </div>
            
            {opt.type === "radio" && opt.options && (
              <RadioGroup
                onValueChange={(val) => updateServiceOption(opt.id, val)}
                defaultValue={opt.defaultValue}
                value={formData.serviceOptions[opt.id]}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {opt.options.map((o) => {
                   const isSelected = formData.serviceOptions[opt.id] === o.value;
                   return (
                  <div key={o.value} className="relative">
                    <RadioGroupItem value={o.value} id={`${opt.id}-${o.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`${opt.id}-${o.value}`}
                      className={cn(
                        "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-[#00B4D8]/50 hover:bg-slate-50",
                        isSelected 
                            ? "border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm" 
                            : "border-gray-200 bg-white"
                      )}
                    >
                      <span className="font-semibold text-base">{o.label}</span>
                      {o.price && <span className="text-sm text-gray-500 mt-1">+ {o.price} AED</span>}
                    </Label>
                    {isSelected && (
                        <div className="absolute top-4 right-4 text-[#00B4D8]">
                            <Check className="w-5 h-5 rounded-full bg-[#00B4D8]/20 p-1" strokeWidth={3} />
                        </div>
                    )}
                  </div>
                )})}
              </RadioGroup>
            )}

            {opt.type === "select" && opt.options && (
              <Select
                onValueChange={(val) => updateServiceOption(opt.id, val)}
                defaultValue={opt.defaultValue}
                value={formData.serviceOptions[opt.id]}
              >
                <SelectTrigger className="h-12 border-gray-300 rounded-xl focus:ring-[#00B4D8]">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {opt.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex justify-between w-full gap-4">
                          <span>{o.label}</span>
                          {o.price && <span className="text-muted-foreground ml-auto"> {o.price} AED</span>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {opt.type === "quantity" && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-full sm:w-fit">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8]"
                        onClick={() => {
                        const current = formData.serviceOptions[opt.id] || 0;
                        if (current > 0) updateServiceOption(opt.id, current - 1);
                        }}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="mx-6 text-center">
                         <span className="block text-2xl font-bold text-gray-900">{formData.serviceOptions[opt.id] || 0}</span>
                         <span className="text-xs text-muted-foreground uppercase tracking-wider">Count</span>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8]"
                        onClick={() => {
                        const current = formData.serviceOptions[opt.id] || 0;
                        updateServiceOption(opt.id, current + 1);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {opt.type === "checkbox" && opt.options && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {opt.options.map((o) => {
                   const isChecked = formData.serviceOptions[opt.id]?.includes(o.value);
                   return (
                   <div key={o.value} 
                        className={cn(
                            "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                             isChecked ? "border-[#00B4D8] bg-[#00B4D8]/5" : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                        onClick={() => {
                             const current = formData.serviceOptions[opt.id] || [];
                             if (isChecked) {
                                 updateServiceOption(opt.id, current.filter((x:any) => x !== o.value));
                             } else {
                                 updateServiceOption(opt.id, [...current, o.value]);
                             }
                        }}
                   >
                     <Checkbox 
                        id={`${opt.id}-${o.value}`}
                        checked={isChecked}
                        className="data-[state=checked]:bg-[#00B4D8] data-[state=checked]:border-[#00B4D8]"
                        // Handling handled by parent div click for better UX
                        onCheckedChange={() => {}} 
                     />
                     <div className="ml-3 flex-1">
                        <Label htmlFor={`${opt.id}-${o.value}`} className="cursor-pointer font-medium block">
                        {o.label}
                        </Label>
                        {o.price && <p className="text-xs text-gray-500 mt-0.5">+ {o.price} AED</p>}
                     </div>
                   </div>
                 )})}
               </div>
            )}
          </div>
        ))}
        </div>
        
        {/* Total Display Inside Step 1 - Per User Request */}
        <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row justify-between items-center shadow-lg border border-slate-700">
             <div className="mb-4 sm:mb-0">
                 <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Estimated Total</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-[#00B4D8]">{total}</p>
                    <span className="text-lg font-medium text-slate-300">AED</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Includes all selected options</p>
             </div>
             
             {/* Mini Breakdown for clarity */}
             <div className="text-sm text-slate-300 space-y-1 text-right hidden sm:block">
                 {lineItems.slice(0, 3).map((item, i) => (
                     <div key={i} className="flex justify-end gap-3 text-slate-400">
                         <span>{item.label}:</span>
                         <span className="text-slate-200">{item.amount}</span>
                     </div>
                 ))}
                 {lineItems.length > 3 && <div className="text-slate-500">+ {lineItems.length - 3} more items...</div>}
             </div>
        </div>
      </div>
    );
  };

  const renderAddressStep = () => (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid gap-2">
        <Label htmlFor="city">City</Label>
        <Select 
            value={formData.address.city} 
            onValueChange={(val) => setFormData({...formData, address: {...formData.address, city: val}})}
        >
            <SelectTrigger className="h-12"><SelectValue placeholder="Select City" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Area / Location</Label>
        <Input 
            id="location" 
            placeholder="e.g. Dubai Marina, JLT..." 
            className="h-12"
            value={formData.address.location}
            onChange={(e) => setFormData({...formData, address: {...formData.address, location: e.target.value}})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="building">Building / Villa</Label>
            <Input 
                id="building" 
                placeholder="Name or Number" 
                 className="h-12"
                value={formData.address.building}
                onChange={(e) => setFormData({...formData, address: {...formData.address, building: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="apartment">Flat / Unit No</Label>
            <Input 
                id="apartment" 
                placeholder="1204"
                 className="h-12"
                value={formData.address.apartment}
                onChange={(e) => setFormData({...formData, address: {...formData.address, apartment: e.target.value}})}
             />
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col space-y-3">
            <Label>Date of Service</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full h-12 justify-start text-left font-normal border-gray-300", !formData.schedule.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.schedule.date ? format(formData.schedule.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={formData.schedule.date}
                        onSelect={(date) => setFormData({...formData, schedule: {...formData.schedule, date}})}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
        <div className="space-y-3">
            <Label>Preferred Time (Start)</Label>
            <Select
                value={formData.schedule.timeSlot}
                onValueChange={(val) => setFormData({...formData, schedule: {...formData.schedule, timeSlot: val}})}
            >
                <SelectTrigger className="h-12 border-gray-300"><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                        <SelectItem key={time} value={time}>{time} {(parseInt(time) < 12) ? 'AM' : 'PM'}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
                id="fullName" 
                className="h-12"
                 placeholder="John Doe"
                value={formData.contact.fullName}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, fullName: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email"
                className="h-12"
                 placeholder="john@example.com"
                value={formData.contact.email}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
                id="phone" 
                type="tel"
                className="h-12"
                placeholder="+971 50 123 4567"
                value={formData.contact.phone}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Input 
                id="instructions" 
                className="h-12"
                placeholder="Gate code, specific issues, etc."
                value={formData.contact.instructions}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, instructions: e.target.value}})}
            />
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* ── Stepper Sidebar / Header (Responsive) ── */}
      <div className="xl:col-span-8 space-y-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center relative">
                 {/* Connecting Line */}
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100 -z-0" />
                 
                 {STEPS.map((step, idx) => {
                     const Icon = step.icon;
                     const isActive = currentStep >= idx;
                     const isCompleted = currentStep > idx;

                     return (
                     <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => idx < currentStep && setCurrentStep(idx)}>
                         <div 
                             className={cn(
                                 "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4",
                                 isActive 
                                     ? "bg-white border-[#00B4D8] text-[#00B4D8] shadow-md scale-110" 
                                     : "bg-gray-50 border-gray-200 text-gray-400"
                              )}
                         >
                             {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                         </div>
                         <span className={cn(
                             "mt-3 text-xs sm:text-sm font-medium transition-colors duration-300",
                             isActive ? "text-gray-900 font-bold" : "text-gray-400"
                         )}>
                             {step.title}
                         </span>
                     </div>
                 )})}
             </div>
        </div>

        <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 overflow-hidden ring-1 ring-gray-100">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription className="text-base text-gray-500 mt-2">
              {currentStep === 0 && <span className="block mb-2">{service.description}</span>}
              Please fill in all the required details below to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {currentStep === 0 && renderServiceStep()}
            {currentStep === 1 && renderAddressStep()}
            {currentStep === 2 && renderScheduleStep()}
            {currentStep === 3 && renderContactStep()}
          </CardContent>
          <CardFooter className="bg-gray-50 p-6 flex justify-between border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              size="lg"
              className={cn(
                  "rounded-full px-8 shadow-lg transition-transform hover:scale-105 active:scale-95 text-white border-0",
                  currentStep === STEPS.length - 1 
                    ? "bg-[#7B2D8B] hover:bg-[#6a2578]" // Confirm Color
                    : "bg-[#00B4D8] hover:bg-[#009bb8]"  // Next Color
              )}
            >
              {currentStep === STEPS.length - 1 ? "Confirm Booking" : "Continue"}
              {currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ── Summary Sidebar (Sticky) ── */}
      <div className="hidden xl:block xl:col-span-4 sticky top-24 space-y-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-[#0D0D1A] p-6 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
                 <h3 className="text-lg font-bold relative z-10">Booking Summary</h3>
                 <p className="text-xs text-gray-400 relative z-10 mt-1 uppercase tracking-widest">{service.title}</p>
            </div>
            
            <div className="p-6 space-y-6">
                {/* Line Items */}
                <div className="space-y-3">
                    {lineItems.length > 0 ? lineItems.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                            <span className="text-gray-600 max-w-[70%]">{item.label}</span>
                            <span className="font-semibold text-gray-900">{item.amount} AED</span>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">Select options to see price breakdown</p>
                    )}
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100">
                     <span className="text-gray-600 font-medium">Total Estimate</span>
                     <span className="text-2xl font-bold text-[#00B4D8]">{total} <span className="text-xs text-gray-400 font-normal">AED</span></span>
                </div>

                {/* Info */}
                <div className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                    *Final price may vary based on actual inspection or changes in requirements.
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                 <p className="text-xs font-semibold text-gray-500">Need Help? Call Us</p>
                 <a href="tel:+971501234567" className="text-[#7B2D8B] font-bold text-lg hover:underline">+971 50 123 4567</a>
            </div>
        </div>
      </div>
    </div>
  );
}
