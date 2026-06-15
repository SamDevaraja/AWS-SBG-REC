"use client";

import React, { useState, useEffect } from "react";
import CalendarCard from "./CalendarCard";

export default function StatCards() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <section className="w-full">
        <CalendarCard />
      </section>
    </>
  );
}

