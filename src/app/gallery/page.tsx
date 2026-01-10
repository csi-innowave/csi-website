"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImagesSlider } from "../../components/ui/images-slider";
import { imagesOne } from "@/data/galleryData";
import { EventsDataType } from "@/types/EventData";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function Gallery() {
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      if (!response.ok) { throw new Error(`Failed to fetch events: ${response.status}`); }
      const data = await response.json();
      const eventImageUrls = (data as EventsDataType[]).flatMap((event) => event.imageUrls);
      setEventImages(eventImageUrls);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") { fetchEvents(); }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const processImages = async () => {
      const processed = await Promise.all(
        eventImages.map(async (url) => {
          if (url.toLowerCase().endsWith(".heic")) {
            if (url.includes("cloudinary.com")) {
              return url.replace(/\.heic$/i, ".jpg");
            }
            try {
              const response = await fetch(url, { mode: 'cors' });
              if (!response.ok) {
                console.error(`Status error for ${url}: ${response.status}`);
                return url;
              }
              const blob = await response.blob();
              const heicBlob = blob.type === 'image/heic' ? blob : new Blob([blob], { type: 'image/heic' });

              const heic2any = (await import("heic2any")).default;
              const convertedBlob = await heic2any({
                blob: heicBlob,
                toType: "image/jpeg",
                quality: 0.8,
              });
              const finalBlob = Array.isArray(convertedBlob)
                ? convertedBlob[0]
                : convertedBlob;
              return URL.createObjectURL(finalBlob);
            } catch (e: any) {
              console.error(`HEIC conversion failed for ${url}`, e.message || e);
              return url;
            }
          }
          return url;
        })
      );
      setDisplayImages(processed);
    };

    if (eventImages.length > 0) {
      processImages();
    } else {
      setDisplayImages([]);
    }
  }, [eventImages]);

  return (
    <>
      <div>
        <div className="sm:h-auto h-aut z-50 w-full dark:bg-grid-white/[0.2] bg-grid-black/[0.2] flex py-2 justify-center">
          <div className="text-3xl sm:text-7xl w-8/12">
            <div className="font-bold relative z-20 bg-clip-text pb-10 text-transparent text-center bg-gradient-to-r from-[#1d7a16] to-[#41d324ff]">
              Our Memories
            </div>
            <div>
              <ImagesSlider className="sm:h-[40rem] h-[20rem] rounded-2xl" images={imagesOne}>
                <motion.div initial={{ opacity: 0, y: -80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="z-50 flex"></motion.div>
              </ImagesSlider>
            </div>

            <div className="py-20">
              <div className="font-bold relative z-20 bg-clip-text pb-10 text-transparent text-center bg-gradient-to-r from-[#1d7a16] to-[#41d324ff] ">
                Photos
              </div>

              {loading ? (
                <p className="text-center text-white text-xl">Loading Photos...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 grid-flow-dense">
                  {displayImages.map((imageUrl, index) => {
                    let itemClasses = "";
                    if ((index + 1) % 5 === 0) {
                      itemClasses = "md:col-span-2";
                    }
                    if ((index + 1) % 7 === 0) {
                      itemClasses = "md:row-span-2";
                    }
                    return (
                      <div
                        key={imageUrl + index}
                        className={`cursor-pointer overflow-hidden rounded-lg group ${itemClasses}`}
                        onClick={() => setLightboxIndex(index)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={displayImages.map((url) => ({ src: url }))}
      />
    </>
  );
}

export default Gallery;