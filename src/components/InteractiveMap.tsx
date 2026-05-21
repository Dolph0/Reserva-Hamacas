"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * InteractiveMap – beach sector selector.
 *
 * Mobile strategy: the landscape image is placed inside a portrait (3:4)
 * container. A CSS `scale` + `transform-origin` zooms into the beach area
 * so all three sectors remain visible and tappable at a comfortable size.
 * Desktop: standard aspect-video with the image at 1× scale.
 */
export function InteractiveMap() {
  return (
    <div className="relative w-full md:max-w-4xl mx-auto overflow-hidden rounded-none md:rounded-3xl shadow-none md:shadow-2xl border-0 md:border-4 md:border-white">
      {/* Responsive container: portrait on mobile, landscape on desktop */}
      <div className="relative aspect-[3/4] md:aspect-video w-full">

        {/* Image wrapper – scaled up on mobile to "zoom" into the beach */}
        <div
          className="absolute inset-0 origin-[50%_35%] scale-[1.25] md:scale-100 md:origin-center"
        >
          <Image
            src="/Playa de puerto rico para app.png"
            alt="Playa de Puerto Rico"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* ── Sector Azul (below blue loungers) ─────────────────────── */}
        <Link href="/sector/azul">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute
              top-[48%]  left-[13%]
              md:top-[62%] md:left-[15%]
              cursor-pointer z-10"
          >
            <span className="text-white font-bold text-sm md:text-xl drop-shadow-lg bg-azul/90 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-md shadow-azul/30 hover:bg-azul transition-colors">
              Sector Azul
            </span>
          </motion.div>
        </Link>

        {/* ── Sector Naranja (below orange loungers) ──────────────────── */}
        <Link href="/sector/naranja">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute
              top-[45%]  left-[43%]
              md:top-[55%] md:left-[42%]
              cursor-pointer z-10"
          >
            <span className="text-white font-bold text-sm md:text-xl drop-shadow-lg bg-naranja/90 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-md shadow-naranja/30 hover:bg-naranja transition-colors">
              Sector Naranja
            </span>
          </motion.div>
        </Link>

        {/* ── Sector Espigón (bottom center) ──────────────────────────── */}
        <Link href="/sector/espigon">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute
              bottom-[12%] left-[55%] -translate-x-1/2
              md:bottom-[10%] md:left-[75%] md:translate-x-0
              cursor-pointer z-10"
          >
            <span className="text-white font-bold text-sm md:text-xl drop-shadow-lg bg-espigon/90 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-md shadow-espigon/30 hover:bg-espigon transition-colors">
              Espigón
            </span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
