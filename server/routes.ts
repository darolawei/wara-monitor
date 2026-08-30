import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, requireAuth, seedDefaultUser } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication first
  setupAuth(app);
  await seedDefaultUser();
  
  // Public read endpoints (anyone can view monitoring data)
  app.get(api.wells.list.path, async (req, res) => {
    const wellsList = await storage.getWells();
    res.json(wellsList);
  });

  app.get(api.wells.get.path, async (req, res) => {
    const well = await storage.getWell(Number(req.params.id));
    if (!well) {
      return res.status(404).json({ message: 'Well not found' });
    }
    res.json(well);
  });

  app.get(api.readings.list.path, async (req, res) => {
    const readingsList = await storage.getReadings(Number(req.params.wellId));
    res.json(readingsList);
  });

  // CSV export — public
  app.get('/api/wells/:wellId/readings/export', async (req, res) => {
    const wellId = Number(req.params.wellId);
    const well = await storage.getWell(wellId);
    if (!well) {
      return res.status(404).json({ message: 'Well not found' });
    }
    const readingsList = await storage.getReadings(wellId);
    
    let csv = 'ID,Well Name,Location,Salinity (ppt),Recorded At\n';
    readingsList.forEach(r => {
      csv += `${r.id},"${well.name}","${well.location}",${r.salinity},${r.recordedAt?.toISOString() || ''}\n`;
    });
    
    const safeName = well.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="readings_${safeName}.csv"`);
    res.send(csv);
  });

  // Sensor ingestion endpoint for ESP32/Wokwi prototypes.
  app.post('/api/sensor/readings', async (req, res) => {
    try {
      const expectedKey = process.env.SENSOR_API_KEY;
      if (!expectedKey) {
        return res.status(500).json({ message: 'SENSOR_API_KEY is not configured' });
      }

      const providedKey = req.header('x-sensor-key') || req.header('authorization')?.replace(/^Bearer\s+/i, '');
      if (providedKey !== expectedKey) {
        return res.status(401).json({ message: 'Invalid sensor API key' });
      }

      const input = z.object({
        wellId: z.coerce.number().int().positive(),
        salinity: z.coerce.number().min(0).max(100),
      }).parse(req.body);

      const well = await storage.getWell(input.wellId);
      if (!well) {
        return res.status(404).json({ message: 'Well not found' });
      }

      const reading = await storage.createReading({
        wellId: input.wellId,
        salinity: String(input.salinity),
      });

      res.status(201).json(reading);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Protected write endpoints (only authenticated staff can modify data)
  app.post(api.wells.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.wells.create.input.parse(req.body);
      const well = await storage.createWell(input);
      res.status(201).json(well);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.readings.create.path, requireAuth, async (req, res) => {
    try {
      const bodySchema = api.readings.create.input.extend({
        wellId: z.coerce.number(),
        salinity: z.coerce.string(),
      });
      const input = bodySchema.parse(req.body);
      const reading = await storage.createReading(input);
      res.status(201).json(reading);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingWells = await storage.getWells();
  if (existingWells.length === 0) {
    const well1 = await storage.createWell({
      name: "Community Well Alpha",
      location: "Lorengau Coast",
      province: "Manus",
      status: "safe",
      currentSalinity: "0.5"
    });
    
    const well2 = await storage.createWell({
      name: "School Well Beta",
      location: "Kokopo District",
      province: "East New Britain",
      status: "warning",
      currentSalinity: "2.1"
    });
    
    const well3 = await storage.createWell({
      name: "Village Well Gamma",
      location: "Buka Shoreline",
      province: "Bougainville",
      status: "danger",
      currentSalinity: "4.5"
    });

    await storage.createReading({ wellId: well1.id, salinity: "0.4" });
    await storage.createReading({ wellId: well1.id, salinity: "0.45" });
    await storage.createReading({ wellId: well1.id, salinity: "0.5" });

    await storage.createReading({ wellId: well2.id, salinity: "1.5" });
    await storage.createReading({ wellId: well2.id, salinity: "1.8" });
    await storage.createReading({ wellId: well2.id, salinity: "2.1" });

    await storage.createReading({ wellId: well3.id, salinity: "3.2" });
    await storage.createReading({ wellId: well3.id, salinity: "3.8" });
    await storage.createReading({ wellId: well3.id, salinity: "4.5" });
  }
}
