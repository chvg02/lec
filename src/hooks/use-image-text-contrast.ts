"use client";

import { useEffect, useState } from "react";

export type ContrastingTextColor = "black" | "white";

type SampleArea = "full" | "bottom";

const SAMPLE_SIZE = 48;
const LIGHT_BACKGROUND_THRESHOLD = 0.54;

function toLinearColor(value: number) {
  const normalized = value / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(red: number, green: number, blue: number) {
  return (
    0.2126 * toLinearColor(red) +
    0.7152 * toLinearColor(green) +
    0.0722 * toLinearColor(blue)
  );
}

export function useImageTextContrast(
  imageSrc: string | null | undefined,
  {
    sampleArea = "full",
    fallback = "white",
  }: { sampleArea?: SampleArea; fallback?: ContrastingTextColor } = {}
) {
  const [textColor, setTextColor] =
    useState<ContrastingTextColor>(fallback);

  useEffect(() => {
    const src = imageSrc?.trim();

    if (!src) {
      return;
    }

    let cancelled = false;

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      if (cancelled) {
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;

        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        });

        if (!context) {
          setTextColor(fallback);
          return;
        }

        context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        const sampleStartY =
          sampleArea === "bottom" ? Math.floor(SAMPLE_SIZE * 0.55) : 0;
        const sampleHeight = SAMPLE_SIZE - sampleStartY;
        const { data } = context.getImageData(
          0,
          sampleStartY,
          SAMPLE_SIZE,
          sampleHeight
        );

        let luminanceTotal = 0;
        let pixelCount = 0;

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3];

          if (alpha < 128) {
            continue;
          }

          luminanceTotal += getRelativeLuminance(
            data[index],
            data[index + 1],
            data[index + 2]
          );
          pixelCount += 1;
        }

        const averageLuminance = pixelCount
          ? luminanceTotal / pixelCount
          : 0;

        setTextColor(
          averageLuminance > LIGHT_BACKGROUND_THRESHOLD ? "black" : "white"
        );
      } catch {
        setTextColor(fallback);
      }
    };

    image.onerror = () => {
      if (!cancelled) {
        setTextColor(fallback);
      }
    };

    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [fallback, imageSrc, sampleArea]);

  return imageSrc?.trim() ? textColor : fallback;
}
