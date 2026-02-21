// client/src/components/HeroSection.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PROPERTY_TYPES } from "@shared/types";

// Helper function to check if we're running on the client side
const isClientSide = typeof window !== 'undefined';

interface HeroSectionProps {
  // optional callback if parent wants to receive search params
  onSearch?: (params: Record<string, string | number | undefined>) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [, setLocation] = useLocation();

  const [transaction, setTransaction] = useState<"sell" | "rent">("sell");
  const [type, setType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);

  // Conditional flag for hiding keyword search
  const hideKeyword = true;

  // Example advanced filters (extend as needed)
  const [minArea, setMinArea] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");
  // New fields for advanced filters
  const [ltMin, setLtMin] = useState<number | "">("");
  const [ltMax, setLtMax] = useState<number | "">("");
  const [lbMin, setLbMin] = useState<number | "">("");
  const [lbMax, setLbMax] = useState<number | "">("");
  const [legalitas, setLegalitas] = useState<string>("ALL");

  // Initialize state that depends on window/localStorage only on client side
  useEffect(() => {
    // This code will only run on the client side
    if (isClientSide) {
      // Setup Intersection Observer for performance optimization
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );

      // Observe the hero section
      const heroElement = document.querySelector('[data-hero-section]');
      if (heroElement) {
        observer.observe(heroElement);
      }

      return () => {
        if (heroElement) {
          observer.unobserve(heroElement);
        }
      };
    }
  }, []);

  // --- Start of Animated Placeholder Logic ---
  const keywords = [
    "Kost Dekat UGM",
    "Rumah Dekat UGM",
    "Rumah Kolam Renang",
    "Hotel Dekat Malioboro",
    "Tanah Dekat UGM",
    "Tanah Pogung",
    "Tanah Seturan Dekat UPN",
    "Rumah Condongcatur",
    "Tanah Condongcatur",
    "Kost Dekat Pakuwon Mall",
    "Rumah Jl Kaliurang",
    "Rumah Dekat UII",
    "Hotel Dijual Jogja",
    "Homestay Dijual Jogja",
    "SPBU Dijual Jogja",
    "Villa Dijual Jogja",
    "Rumah Villa Jogja",
    "Tanah Jl Kaliurang"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    // Stop animation if user is typing, input is focused, or component is not in view
    if (keyword !== "" || isInputFocused || !isInView) {
      return;
    }

    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => {
        let nextIndex;
        // Ensure the next keyword is different from the current one
        do {
          nextIndex = Math.floor(Math.random() * keywords.length);
        } while (keywords.length > 1 && nextIndex === prevIndex);
        return nextIndex;
      });
    }, 2500); // Change keyword every 2.5 seconds

    return () => clearInterval(interval);
  }, [keyword, isInputFocused, isInView, keywords.length]);
  // --- End of Animated Placeholder Logic ---

  function buildQueryParams() {
    const params: Record<string, string> = {};
    // Only set status if no keyword (for flexible keyword search)
    if (!keyword.trim()) {
      params["status"] = transaction === "sell" ? "dijual" : "disewakan";
    }
    if (type && type !== "all") params["type"] = type;
    if (keyword.trim()) params["q"] = keyword.trim();

    // Handle price range filter
    if (priceRange && priceRange !== "all") {
      const priceRanges: Record<string, { min: number; max: number }> = {
        "under-1m": { min: 0, max: 1000000000 },
        "1m-2m": { min: 1000000000, max: 2000000000 },
        "2m-3m": { min: 2000000000, max: 3000000000 },
        "3m-4m": { min: 3000000000, max: 4000000000 },
        "4m-5m": { min: 4000000000, max: 5000000000 },
        "5m-6m": { min: 5000000000, max: 6000000000 },
        "6m-7m": { min: 6000000000, max: 7000000000 },
        "7m-8m": { min: 7000000000, max: 8000000000 },
        "8m-9m": { min: 8000000000, max: 9000000000 },
        "9m-10m": { min: 9000000000, max: 10000000000 },
        "above-10m": { min: 10000000000, max: 999999999999 },
      };

      const range = priceRanges[priceRange];
      if (range) {
        params["minPrice"] = String(range.min);
        params["maxPrice"] = String(range.max);
      }
    } else {
      // Price range is handled above, no manual inputs needed
    }

    if (minArea !== "") params["minArea"] = String(minArea);
    if (bedrooms !== "") params["bedrooms"] = String(bedrooms);
    // New fields for advanced filters
    if (ltMin !== "") params["lt_min"] = String(ltMin);
    if (ltMax !== "") params["lt_max"] = String(ltMax);
    if (lbMin !== "") params["lb_min"] = String(lbMin);
    if (lbMax !== "") params["lb_max"] = String(lbMax);
    if (legalitas !== "ALL") params["legalitas"] = legalitas;
    return new URLSearchParams(params).toString();
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const qs = buildQueryParams();
    const path = `/search?${qs}`;

    // Log for debugging - only on client side
    if (isClientSide) {
      console.log('HeroSection: Search submitted with params:', Object.fromEntries(new URLSearchParams(qs)));
    }

    if (onSearch) {
      // optional callback for parent
      onSearch(Object.fromEntries(new URLSearchParams(qs)));
    }
    // Don't navigate to /search, stay on homepage and apply filters
    // setLocation(path);
    if (isClientSide) {
      console.log('HeroSection: Applying filters to current page instead of navigating');
    }
  }

  return (
    <section
      className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden"
      data-hero-section
    >
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.salambumi.xyz/kost%20dijual%20jogja.webp')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-12 lg:max-w-7xl lg:mx-auto">
        <h1 className="text-5xl font-bold text-white text-center">Salam Bumi Property</h1>
        <p className="mt-2 text-center text-white/90">Finding the Best Properties Will Be Easier and More Precise</p>

        {/* MODERN MARKETPLACE SEARCH BAR - FULL WIDTH LAYOUT */}
        <div className="mt-8 w-full max-w-5xl mx-auto px-4 lg:px-8">
          {/* Transaction Toggle - TOP LEFT POSITION */}
          <div className="mb-3">
            <div className="inline-flex rounded-lg bg-white border-2 border-gray-200 p-1 shadow-sm">
              <button
                type="button"
                aria-pressed={transaction === "sell"}
                onClick={() => setTransaction("sell")}
                className={`px-6 py-2 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${
                  transaction === "sell"
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dijual
              </button>
              <button
                type="button"
                aria-pressed={transaction === "rent"}
                onClick={() => setTransaction("rent")}
                className={`px-6 py-2 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${
                  transaction === "rent"
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Disewa
              </button>
            </div>
          </div>

          {/* Main Search Bar - EXTRA WIDE (Desktop) / VERTICAL (Mobile) */}
          <div className="relative">
            {/* Background Layer - Transparent (50% opacity using rgba) */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm border-2 border-blue-500 rounded-lg shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} />
            {/* Content Layer - Solid (no transparency) */}
            <form onSubmit={handleSubmit} className="relative bg-transparent p-4">
              {/* MOBILE LAYOUT - VERTICAL STACK */}
              <div className="md:hidden space-y-3">
                {/* Property Type Dropdown - FULL WIDTH */}
                <div className="w-full">
                  <Select onValueChange={(v) => setType(v)} defaultValue="all">
                    <SelectTrigger className="h-14 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-4">
                      <SelectValue placeholder="Jenis Properti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Dropdown - FULL WIDTH */}
                <div className="w-full">
                  <Select onValueChange={(v) => setPriceRange(v)} defaultValue="all">
                    <SelectTrigger className="h-14 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-4">
                      <SelectValue placeholder="Range Harga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Harga</SelectItem>
                      <SelectItem value="under-1m">Dibawah 1M</SelectItem>
                      <SelectItem value="1m-2m">1M - 2M</SelectItem>
                      <SelectItem value="2m-3m">2M - 3M</SelectItem>
                      <SelectItem value="3m-4m">3M - 4M</SelectItem>
                      <SelectItem value="4m-5m">4M - 5M</SelectItem>
                      <SelectItem value="5m-6m">5M - 6M</SelectItem>
                      <SelectItem value="6m-7m">6M - 7M</SelectItem>
                      <SelectItem value="7m-8m">7M - 8M</SelectItem>
                      <SelectItem value="8m-9m">8M - 9M</SelectItem>
                      <SelectItem value="9m-10m">9M - 10M</SelectItem>
                      <SelectItem value="above-10m">Diatas 10M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input */}
                {!hideKeyword && (
                  <div className="w-full relative h-14">
                    <label htmlFor="hero-keyword-mobile" className="sr-only">Cari properti</label>

                    {/* Placeholder Wrapper with overflow:hidden */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg" style={{ zIndex: 30 }}>
                      <AnimatePresence>
                        {keyword === "" && !isInputFocused && (
                          <motion.div
                            key={placeholderIndex}
                            initial={{ y: "100%" }}
                            animate={{ y: "0%" }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 px-4 w-full">
                              <span className="text-gray-900 text-base whitespace-nowrap text-ellipsis overflow-hidden block" style={{ opacity: 1 }}>
                                {keywords[placeholderIndex]}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Input
                      id="hero-keyword-mobile"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder={keyword === "" ? "" : "Cari lokasi, nama, atau kode listing..."}
                      className="h-14 w-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder:text-gray-500 px-4 pr-14 transition-all duration-300 relative z-10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-20">
                      <Search size={24} />
                    </div>
                  </div>
                )}

                {/* Search Button - FULL WIDTH */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-lg"
                >
                  <Search size={20} className="mr-2" />
                  Cari Properti
                </Button>

                {/* Advanced Filters - Small link */}
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                  aria-label="Filter lanjutan"
                >
                  <Sliders size={16} className="inline-block mr-1" />
                  Filter Lanjutan
                </button>
              </div>

              {/* DESKTOP LAYOUT - HORIZONTAL */}
              <div className="hidden lg:flex items-stretch gap-3">
                {/* Property Type Dropdown */}
                <div className="flex-1 min-w-0 max-w-xs">
                  <Select onValueChange={(v) => setType(v)} defaultValue="all">
                    <SelectTrigger className="h-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm px-3 lg:text-base w-full rounded-md">
                      <SelectValue placeholder="Jenis Properti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="lg:text-base">Semua Jenis</SelectItem>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="lg:text-base">
                          {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Dropdown */}
                <div className="flex-1 min-w-0 max-w-xs">
                  <Select onValueChange={(v) => setPriceRange(v)} defaultValue="all">
                    <SelectTrigger className="h-full border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm px-3 lg:text-base w-full rounded-md">
                      <SelectValue placeholder="Range Harga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Harga</SelectItem>
                      <SelectItem value="under-1m">Dibawah 1M</SelectItem>
                      <SelectItem value="1m-2m">1M - 2M</SelectItem>
                      <SelectItem value="2m-3m">2M - 3M</SelectItem>
                      <SelectItem value="3m-4m">3M - 4M</SelectItem>
                      <SelectItem value="4m-5m">4M - 5M</SelectItem>
                      <SelectItem value="5m-6m">5M - 6M</SelectItem>
                      <SelectItem value="6m-7m">6M - 7M</SelectItem>
                      <SelectItem value="7m-8m">7M - 8M</SelectItem>
                      <SelectItem value="8m-9m">8M - 9M</SelectItem>
                      <SelectItem value="9m-10m">9M - 10M</SelectItem>
                      <SelectItem value="above-10m">Diatas 10M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input - HIDDEN with conditional rendering */}
                {!hideKeyword && (
                  <div className="flex-1 min-w-0 relative h-12 lg:flex-[5]">
                    <label htmlFor="hero-keyword-desktop" className="sr-only">Cari properti</label>

                    {/* Placeholder Wrapper with overflow:hidden */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg" style={{ zIndex: 30 }}>
                      <AnimatePresence>
                        {keyword === "" && !isInputFocused && (
                          <motion.div
                            key={placeholderIndex}
                            initial={{ y: "100%" }}
                            animate={{ y: "0%" }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 px-4 w-full">
                              <span className="text-gray-900 text-base whitespace-nowrap text-ellipsis overflow-hidden block" style={{ opacity: 1 }}>
                                {keywords[placeholderIndex]}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Input
                      id="hero-keyword-desktop"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder={keyword === "" ? "" : "Cari lokasi, nama kompleks, atau kode listing..."}
                      className="h-12 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder:text-gray-500 px-4 pr-12 transition-all duration-300 relative z-10 flex-1 min-w-0 w-auto"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-20">
                      <Search size={20} />
                    </div>
                  </div>
                )}

                {/* Search Button */}
                <Button
                  type="submit"
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex-shrink-0 px-8 text-base min-w-[140px]"
                >
                  <Search size={20} className="mr-2" />
                  Cari Properti
                </Button>

                {/* Advanced Filters Icon */}
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="h-14 w-16 border border-gray-300 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex-shrink-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center"
                  aria-label="Filter lanjutan"
                  title="Filter lanjutan"
                >
                  <Sliders size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIMPLE MODAL / DRAWER FOR ADVANCED FILTERS */}
        {showFilters && (
          <div
            id="advanced-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advancedFiltersTitle"
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="relative w-full md:w-3/4 lg:w-1/2 bg-white rounded-t-lg md:rounded-lg shadow-lg p-6 z-60">
              <div className="flex items-center justify-between mb-4">
                <h3 id="advancedFiltersTitle" className="text-lg font-semibold">Filter Lanjutan</h3>
                <button onClick={() => setShowFilters(false)} aria-label="Tutup">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <div>
                  <label className="block text-sm mb-1">Luas Tanah Min (m²)</label>
                  <Input value={ltMin} onChange={(e) => setLtMin(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Min LT" className="bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Luas Tanah Max (m²)</label>
                  <Input value={ltMax} onChange={(e) => setLtMax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Max LT" className="bg-white" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Luas Bangunan Min (m²)</label>
                  <Input value={lbMin} onChange={(e) => setLbMin(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Min LB" className="bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Luas Bangunan Max (m²)</label>
                  <Input value={lbMax} onChange={(e) => setLbMax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Max LB" className="bg-white" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Kamar Tidur</label>
                  <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" className="bg-white" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Legalitas</label>
                  <Select value={legalitas} onValueChange={setLegalitas}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Legalitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Legalitas</SelectItem>
                      <SelectItem value="SHM">SHM</SelectItem>
                      <SelectItem value="SHGB">SHGB</SelectItem>
                      <SelectItem value="PPJB">PPJB</SelectItem>
                      <SelectItem value="GIRIK">Girik</SelectItem>
                      <SelectItem value="LETTER_C">Letter C</SelectItem>
                      <SelectItem value="SHM_PBG">SHM & PBG</SelectItem>
                      <SelectItem value="SHGB_PBG">SHGB & PBG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => {
                  setMinArea(""); setBedrooms("");
                }}>Reset</Button>
                <Button onClick={() => { setShowFilters(false); handleSubmit(); }}>Terapkan & Cari</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
