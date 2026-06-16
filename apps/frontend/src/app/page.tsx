"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurTeamShowcase from "@/components/CommunityStoryCarousel";
import Gallery from "@/components/Gallery";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ overflowX: "hidden", width: "100%" }}>
        <Hero />
        <Gallery />
        <ReviewsMarquee />
        <OurTeamShowcase />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
