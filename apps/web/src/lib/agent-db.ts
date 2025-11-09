import { DatabaseService } from '@agentdb/sdk';
import { AGENTDB_API_KEY, AGENTDB_API_URL } from 'astro:env/server';

const agentDbKey = 'd94e8b60-9cbf-4a4d-9744-3359486cf31c';

const AirthingsConfig = {
  db: 'airthings4d79c1',
  devices: {
    studioSerial: '2930260470',
    livingRoomSerial: '3220006141',
    bedroomSerial: '3220006156',
  },
};

export type Room = keyof typeof AirthingsConfig.devices;

export function getService() {
  return new DatabaseService(AGENTDB_API_URL, AGENTDB_API_KEY);
}

export function getAirthingsDb() {
  return getService().connect(agentDbKey, AirthingsConfig.db, 'sqlite');
}

export async function getHumidity(device: Room) {
  const result = await getAirthingsDb().execute([
    {
      sql: `SELECT * FROM sensor_readings 
              WHERE device_serial = ? AND sensor_type = 'humidity'
              ORDER BY recorded DESC
              LIMIT 1`,
      params: [AirthingsConfig.devices[device]],
    },
  ]);
  return result.results[0].rows?.[0] ?? null;
}

export async function getCO2(device: Room) {
  const result = await getAirthingsDb().execute([
    {
      sql: `SELECT * FROM sensor_readings 
              WHERE device_serial = ? AND sensor_type = 'co2'
              ORDER BY recorded DESC
              LIMIT 1`,
      params: [AirthingsConfig.devices[device]],
    },
  ]);
  return result.results[0].rows?.[0] ?? null;
}

export async function getRadon(device: Room) {
  const result = await getAirthingsDb().execute([
    {
      sql: `SELECT * FROM sensor_readings 
              WHERE device_serial = ? AND sensor_type = 'radonShortTermAvg'
              ORDER BY recorded DESC
              LIMIT 1`,
      params: [AirthingsConfig.devices[device]],
    },
  ]);
  return result.results[0].rows?.[0] ?? null;
}
