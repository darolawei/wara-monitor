# Wara Monitor Hackathon White Paper

## 1. Project Information

| Field | Response |
|---|---|
| Team Registration Number | [Add team registration number] |
| Team Name | [Add team name] |
| Selected Theme | Water quality monitoring, safe water access, and climate-resilient communities |
| Team Leader | [Add team leader name] |
| Team Leader's Email | [Add team leader email] |
| Project Title | Wara Monitor |

## 2. Problem

Many coastal and island communities in Papua New Guinea depend on wells and small local water sources for daily drinking, cooking, school, and community use. These water sources can become unsafe when saltwater enters groundwater, especially in low-lying coastal areas affected by sea-level rise, storm surges, drought, and changing rainfall patterns. Salinity changes may happen gradually, and communities often do not have simple digital tools to track the quality of each well over time.

The people most affected are households, schools, health workers, village leaders, and local water officers who need quick information about whether a water source is safe, needs attention, or should not be used. Without regular monitoring, a contaminated well may continue to be used until the water tastes salty or causes health concerns. This delays response, increases the risk of unsafe water use, and makes it harder for local teams to decide where limited resources should be sent first.

Wara Monitor addresses this problem by giving communities and field teams a practical way to record, view, and respond to salinity data from local wells.

## 3. Proposed Solution

Wara Monitor is a web-based water salinity monitoring platform for Papua New Guinea communities. The system allows staff to register wells, record salinity readings, view each well's current safety status, track historical trends, and export readings for reporting. Wells are grouped by province and shown on an interactive Papua New Guinea map so users can quickly see which areas require attention.

The platform classifies salinity readings into three simple categories: safe, warning, and danger. This makes the information understandable for non-technical users and helps local teams act quickly. A low salinity reading is shown as safe, a moderate reading triggers a warning, and a high reading marks the well as danger. The dashboard also includes an AI Risk Advisor that converts monitoring data into practical field-response recommendations.

The prototype supports manual data entry, sensor-based data collection, and a virtual salt-water simulator for hackathon demonstration. In the simulator, the team can show a glass of fresh water becoming more saline as salt is added, then send the virtual sensor reading into the live dashboard. For the hardware version, an ESP32 or Wokwi virtual ESP32 can send readings to a secure API endpoint. A real TDS or salinity sensor can be connected later. This approach allows the project to be demonstrated immediately and expanded into real field deployments.

## 4. Expected Impact

Environmentally, Wara Monitor supports better protection of freshwater sources by helping communities detect salinity changes earlier. Early detection can show where saltwater intrusion is increasing and where wells may need protection, rehabilitation, relocation, or additional testing. Over time, the collected data can help identify climate-related risks in coastal and island areas.

Socially, the project helps households, schools, and local leaders make safer water decisions. Instead of relying only on taste, memory, or occasional checks, communities can view clear status indicators and salinity trends. This can reduce exposure to unsafe water, improve trust in local water management, and support quicker communication between community members and water officers.

Economically, Wara Monitor can reduce the cost of emergency response by helping teams prioritize the wells and provinces that need attention first. CSV exports also make reporting easier for local authorities, NGOs, and partners. Because the system uses common web technologies and low-cost ESP32 sensor hardware, it can be piloted affordably and scaled gradually as resources become available.

## 5. Implementation

The team will develop Wara Monitor as a full-stack web application. The frontend is built with React, TypeScript, Vite, Tailwind CSS, and reusable UI components. Users can log in, view a dashboard, open well detail pages, inspect salinity trend charts, filter wells through an interactive PNG province map, create new wells, add readings, run the virtual salt-water sensor simulator, and export data.

The backend is built with Express and TypeScript. PostgreSQL stores users, wells, and salinity readings, while Drizzle ORM manages the database schema and queries. Authentication protects staff-only actions such as creating wells and adding manual readings. Public read endpoints allow monitoring data to be viewed, while protected write endpoints prevent unauthorized data changes.

For the sensor prototype, an ESP32 posts salinity readings to `/api/sensor/readings` using a private sensor API key. The backend validates the request, stores the reading, and automatically updates the well's current salinity and status. During the hackathon, the built-in browser simulator demonstrates the same workflow without physical hardware, while Wokwi can also simulate the ESP32. In a later field version, the virtual sensor can be replaced with a calibrated TDS or salinity sensor module.

The planned implementation steps are:

1. Finalize the database schema for users, wells, provinces, and readings.
2. Complete the dashboard, map view, well detail pages, and data-entry forms.
3. Add salinity status logic and AI Risk Advisor recommendations.
4. Connect the virtual salt-water simulator and ESP32/Wokwi sensor demo to the monitoring workflow.
5. Test local and deployed versions using sample wells in Manus, East New Britain, and Bougainville.
6. Deploy the application with a Node.js server and PostgreSQL database.

## 6. Conclusion

Wara Monitor responds to the growing challenge of water salinity in Papua New Guinea by giving communities a simple way to monitor wells, understand risk, and act earlier. The solution combines a practical dashboard, province-based mapping, salinity trend tracking, CSV reporting, staff authentication, a virtual salt-water sensor demo, and ESP32 sensor integration.

By turning raw salinity readings into clear safety statuses and field-response recommendations, Wara Monitor can help communities protect freshwater sources, reduce unsafe water use, and improve climate resilience. The prototype is ready for hackathon demonstration and can be expanded into a real low-cost monitoring network for coastal and island communities.
