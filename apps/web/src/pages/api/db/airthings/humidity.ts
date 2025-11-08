import { getHumidity } from '../../../../lib/agent-db';
import { APIRoute } from '../../../../lib/api';

type HumidityResponse = typeof APIRoute.airthings.humidity.response;

export async function GET(request: Request): Promise<Response> {
  const row = await getHumidity('studioSerial');

  const responseData: HumidityResponse = {
    status: 'success',
    data: {
      humidity: row?.value ?? 0,
      recorded: row?.recorded ?? new Date(),
    },
  };

  return Response.json(responseData);
}
