# ESP32 Sensor Demo Setup

This guide connects a virtual ESP32 sensor to the live Wara Monitor app.

## Websites

- Render dashboard: https://dashboard.render.com
- Wokwi ESP32 simulator: https://wokwi.com
- GitHub repository: https://github.com/darolawei/wara-monitor
- Arduino IDE, for a real ESP32 later: https://www.arduino.cc/en/software

## 1. Configure Render

Open the `wara-monitor` web service in Render, then go to **Environment**.

Add or update:

```text
SENSOR_API_KEY=your-private-sensor-secret
```

Keep this value private. You will paste the same value into the ESP32 code.

After saving, run:

```text
Manual Deploy > Deploy latest commit
```

## 2. Choose a Well ID

Open the live app and choose which well the ESP32 should update.

The seed wells usually have these IDs:

```text
1 = Community Well Alpha
2 = School Well Beta
3 = Village Well Gamma
```

Use well `1` for the first demo unless you created your own well.

## 3. Create a Wokwi Project

1. Go to https://wokwi.com
2. Click **Start from Scratch**
3. Choose **ESP32**
4. Add a **Potentiometer** part
5. Wire it like this:

```text
Potentiometer VCC  -> ESP32 3V3
Potentiometer GND  -> ESP32 GND
Potentiometer SIG  -> ESP32 GPIO34
```

The potentiometer simulates the salinity sensor. Turn it up to simulate adding salt water.

If you want the ESP32 simulator to follow the Wara Monitor `/simulator` page instead of the potentiometer, use the linked simulator code below. Moving the water and salt controls in Wara Monitor will change the values printed by the ESP32 Serial Monitor.

## 4. ESP32 Arduino Code

Replace `YOUR_RENDER_URL` and `YOUR_SENSOR_API_KEY`.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const char* API_URL = "https://YOUR_RENDER_URL/api/sensor/readings";
const char* SENSOR_API_KEY = "YOUR_SENSOR_API_KEY";

const int SENSOR_PIN = 34;
const int WELL_ID = 1;

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println(" connected");
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  float salinity = (raw / 4095.0) * 5.0;

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-sensor-key", SENSOR_API_KEY);

    String body = "{\"wellId\":";
    body += WELL_ID;
    body += ",\"salinity\":";
    body += String(salinity, 2);
    body += "}";

    int statusCode = http.POST(body);
    String response = http.getString();

    Serial.print("Raw: ");
    Serial.print(raw);
    Serial.print(" Salinity: ");
    Serial.print(salinity, 2);
    Serial.print(" ppt Status: ");
    Serial.println(statusCode);
    Serial.println(response);

    http.end();
  }

  delay(5000);
}
```

## 4B. ESP32 Code Linked to the Wara Monitor Simulator Tab

Use this version when you want the ESP32 to read the live value from the web app simulator controls.

Replace `YOUR_RENDER_URL` and `YOUR_SENSOR_API_KEY`.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

const char* SIMULATOR_STATE_URL = "https://YOUR_RENDER_URL/api/sensor/simulator-state";
const char* API_URL = "https://YOUR_RENDER_URL/api/sensor/readings";
const char* SENSOR_API_KEY = "YOUR_SENSOR_API_KEY";

String getJsonValue(String json, String key) {
  String marker = "\"" + key + "\":";
  int start = json.indexOf(marker);
  if (start < 0) return "";
  start += marker.length();
  int end = json.indexOf(",", start);
  if (end < 0) end = json.indexOf("}", start);
  return json.substring(start, end);
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println(" connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SIMULATOR_STATE_URL);
    http.addHeader("x-sensor-key", SENSOR_API_KEY);

    int statusCode = http.GET();
    String response = http.getString();
    http.end();

    if (statusCode == 200) {
      int wellId = getJsonValue(response, "wellId").toInt();
      float waterMl = getJsonValue(response, "waterMl").toFloat();
      float saltGrams = getJsonValue(response, "saltGrams").toFloat();
      float salinity = getJsonValue(response, "salinity").toFloat();

      Serial.print("Linked simulator -> Well: ");
      Serial.print(wellId);
      Serial.print(" Water: ");
      Serial.print(waterMl, 0);
      Serial.print(" ml Salt: ");
      Serial.print(saltGrams, 2);
      Serial.print(" g Salinity: ");
      Serial.print(salinity, 2);
      Serial.println(" ppt");

      HTTPClient post;
      post.begin(API_URL);
      post.addHeader("Content-Type", "application/json");
      post.addHeader("x-sensor-key", SENSOR_API_KEY);

      String body = "{\"wellId\":";
      body += wellId;
      body += ",\"salinity\":";
      body += String(salinity, 2);
      body += "}";

      int postStatus = post.POST(body);
      Serial.print("Dashboard upload status: ");
      Serial.println(postStatus);
      post.end();
    } else {
      Serial.print("Simulator read failed: ");
      Serial.println(statusCode);
      Serial.println(response);
    }
  }

  delay(1000);
}
```

## 5. Test the Live Prototype

1. Start the Wokwi simulation.
2. Open the Serial Monitor.
3. Turn the potentiometer.
4. Open your Wara Monitor dashboard or the well detail page.
5. Watch the salinity reading and status update live.

Status thresholds:

```text
Less than 1.0 ppt = Safe
1.0 to 3.0 ppt = Warning
More than 3.0 ppt = Danger
```

## Real Sensor Later

For a physical ESP32 demo, replace the potentiometer with a TDS/salinity sensor module and keep the same HTTP upload code. The formula may need calibration based on the exact sensor model.
