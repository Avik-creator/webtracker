"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { countryNames } from "@/lib/utils";

// Add this to your package.json:
// "react-simple-maps": "^3.0.0",
// "d3-scale": "^4.0.2"

// You'll need to download a world map GeoJSON file
// This is a low-resolution example - place this in your public folder
const geoUrl = "/topoworld.json";

interface WorldMapProps {
  countryData: {
    countryCode: string;
    countryName: string;
    visitors: number;
  }[];
  isLoading: boolean;
}

const WorldMap = ({ countryData, isLoading }: WorldMapProps) => {
  const [activeCountry, setActiveCountry] = React.useState<{
    name: string;
    value: number;
  } | null>(null);

  // Process the country data for mapping (ensure numeric values)
  const dataMap = new Map();
  countryData.forEach((item) => {
    // Ensure country codes are uppercase for consistent matching
    const countryCode = item.countryCode.toUpperCase();
    dataMap.set(countryCode, {
      name: item.countryName,
      value: Number(item.visitors) || 0,
    });
  });

  // Create color scale based on visitor numbers - using grayscale for dark theme
  const colorScale = scaleQuantile<string>()
    .domain(
      countryData.length > 0
        ? countryData.map((d) => Number(d.visitors) || 0)
        : [0]
    )
    .range([
      "#3f3f46", // zinc-700
      "#52525b", // zinc-600
      "#71717a", // zinc-500
      "#a1a1aa", // zinc-400
      "#d4d4d8", // zinc-300
    ]);

  // Create a reverse mapping from country names to country codes
  const countryNameToCode = Object.entries(countryNames).reduce(
    (acc, [code, name]) => {
      acc[name.toLowerCase()] = code;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-zinc-500">Loading map data...</p>
        </div>
      ) : countryData.length > 0 ? (
        <TooltipProvider>
          <ComposableMap
            projectionConfig={{ scale: 155 }}
            width={800}
            height={400}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    // If no ISO code found, try to map from country name
                    const countryCode =
                      geo.properties.name &&
                      countryNameToCode[geo.properties.name.toLowerCase()];

                    // Find matching country data
                    const current = countryCode
                      ? dataMap.get(countryCode)
                      : null;

                    return (
                      <Tooltip key={geo.rsmKey}>
                        <TooltipTrigger asChild>
                          <Geography
                            geography={geo}
                            fill={
                              current ? colorScale(current.value) : "#27272a"
                            }
                            stroke="#18181b"
                            strokeWidth={0.5}
                            onMouseEnter={() => {
                              // Use different property names for country name
                              const countryName =
                                geo.properties.NAME ||
                                geo.properties.name ||
                                geo.properties.ADMIN ||
                                countryNames[
                                  countryCode as keyof typeof countryNames
                                ] ||
                                "Unknown";

                              setActiveCountry(
                                current
                                  ? { name: countryName, value: current.value }
                                  : { name: countryName, value: 0 }
                              );
                            }}
                            onMouseLeave={() => {
                              setActiveCountry(null);
                            }}
                            style={{
                              default: { outline: "none" },
                              hover: {
                                fill: current ? "#e4e4e7" : "#3f3f46",
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: { outline: "none" },
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                          {activeCountry?.name}:{" "}
                          {(activeCountry?.value ?? 0) > 0
                            ? `${activeCountry?.value.toLocaleString()} visitors`
                            : "No visitors"}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </TooltipProvider>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-zinc-500 text-center text-sm">
            No country data available
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
