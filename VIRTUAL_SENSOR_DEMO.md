# Wara Monitor Virtual Sensor Demo

## Purpose

This demo lets you present Wara Monitor as if a salinity sensor is placed in a glass of water, even without physical ESP32 hardware.

The simulator is available inside the app at:

```text
/simulator
```

It sends readings into the same monitoring flow used by the dashboard, well status cards, salinity trend chart, and AI Risk Advisor.

## Demo Setup

1. Start the application.
2. Log in as a staff user.
3. Open the `Simulator` link in the top navigation.
4. Choose a target well, for example `Community Well Alpha`.
5. Open the dashboard or well detail page in another browser tab if you want judges to see updates immediately.

## Suggested Pitch Flow

1. Start with the simulator set to a low salt amount.
2. Click `Fresh rinse`.
3. Click `Send virtual sensor reading`.
4. Explain that the well remains safe because the reading is below `1.0 ppt`.
5. Click `Add pinch` or `Demo rise` to simulate saltwater entering the water source.
6. Send another reading when the value is between `1.0 ppt` and `3.0 ppt`.
7. Show the dashboard changing to warning.
8. Click `Pour salt water` until the value is above `3.0 ppt`.
9. Send the reading again.
10. Show the well status changing to danger, the AI Risk Advisor recommending action, and the well detail chart showing the trend.

## Status Thresholds

```text
Less than 1.0 ppt = Safe
1.0 to 3.0 ppt = Warning
More than 3.0 ppt = Danger
```

## What To Say To Judges

Wara Monitor is designed to work with a real ESP32 and salinity sensor, but for this hackathon demo we are using a virtual sensor. The simulator models a glass of water where adding salt increases the salinity reading. When we send the reading, Wara Monitor updates the selected well, recalculates the risk status, refreshes the dashboard, and stores the reading for trend analysis.

The same flow can later be connected to real hardware. Instead of pressing the simulator button, an ESP32 will post readings to the secured sensor API endpoint.

## Real Hardware Upgrade Path

The physical version can use:

- ESP32 microcontroller
- TDS or salinity sensor module
- Waterproof probe
- Battery or solar power source
- Mobile or Wi-Fi connectivity where available

The software already includes a secured sensor endpoint:

```text
POST /api/sensor/readings
```

The virtual simulator is for presentation and testing. The hardware endpoint is for field deployment.

