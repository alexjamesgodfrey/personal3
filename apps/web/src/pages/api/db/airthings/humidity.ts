import type { APIRoute as AstroAPIRoute } from 'astro';
import { getHumidity } from '../../../../lib/agent-db';
import { APIRoute } from '../../../../lib/api';

type HumidityResponse = typeof APIRoute.airthings.humidity.response;

export const prerender = false;

export const GET: AstroAPIRoute = async ({ cache }) => {
  cache.set({
    maxAge: 120,
    swr: 180,
    tags: ['airthings', 'airthings:humidity', 'airthings:studioSerial'],
  });

  const row = await getHumidity('studioSerial');
  const recorded = row?.recorded ?? new Date();

  const responseData: HumidityResponse = {
    status: 'success',
    data: {
      humidity: row?.value ?? 0,
      recorded: new Date(recorded).toISOString(),
    },
  };

  return Response.json(responseData);
};
