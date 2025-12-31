"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface DeviceAnalytics {
  deviceType: string;
  visitors: number;
}

interface Analytics {
  deviceAnalytics: DeviceAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

// Device colors and icons
const deviceConfig: {
  [key: string]: { color: string; icon: React.ReactNode };
} = {
  DESKTOP: { color: "bg-blue-500", icon: <Monitor className="h-3 w-3" /> },
  MOBILE: { color: "bg-emerald-500", icon: <Smartphone className="h-3 w-3" /> },
  TABLET: { color: "bg-purple-500", icon: <Tablet className="h-3 w-3" /> },
};

const getDeviceConfig = (
  device: string
): { color: string; icon: React.ReactNode } => {
  return (
    deviceConfig[device.toUpperCase()] || {
      color: "bg-zinc-500",
      icon: <Monitor className="h-3 w-3" />,
    }
  );
};

const formatDeviceName = (device: string): string => {
  return device.charAt(0) + device.slice(1).toLowerCase();
};

export default function DevicesList({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const deviceData = analyticsData?.analytics?.deviceAnalytics || [];

  // Sort by visitors (ensure numeric comparison)
  const sortedDevices = [...deviceData].sort(
    (a, b) => Number(b.visitors) - Number(a.visitors)
  );

  // Calculate total for percentages (ensure numeric values)
  const totalVisitors = deviceData.reduce(
    (sum, d) => sum + Number(d.visitors),
    0
  );

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <Monitor className="h-4 w-4 mr-2 text-zinc-400" />
          Device Types
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          Devices used to access your site
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {sortedDevices.length > 0 ? (
          <div className="space-y-4">
            {sortedDevices.map((device, index) => {
              const percentage =
                totalVisitors > 0
                  ? Math.round((Number(device.visitors) / totalVisitors) * 100)
                  : 0;
              const config = getDeviceConfig(device.deviceType);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md ${config.color} flex items-center justify-center text-white`}
                    >
                      {config.icon}
                    </div>
                    <span className="text-zinc-200 text-sm font-medium">
                      {formatDeviceName(device.deviceType)}
                    </span>
                  </div>
                  <span className="text-zinc-400 text-sm font-medium tabular-nums">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <p className="text-zinc-500 text-center text-sm">
              No device data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
