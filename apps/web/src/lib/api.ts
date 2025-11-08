export type RouteConfig = {
  [category: string]: {
    [endpoint: string]: {
      path: string;
      method: string;
      response: {
        status: string;
        data: any;
      };
    };
  };
};

export const APIRoute = {
  airthings: {
    humidity: {
      path: '/api/db/airthings/humidity',
      method: 'GET',
      response: {
        status: 'success',
        data: {
          humidity: 0 as number,
          recorded: '2025-11-07T12:00:00.000Z' as string,
        },
      },
    },
  },
} as const satisfies RouteConfig;

// Extract all possible route paths as dot notation
export type RouteKeys<T extends RouteConfig> = {
  [K in keyof T]: {
    [E in keyof T[K]]: `${K & string}.${E & string}`;
  }[keyof T[K]];
}[keyof T];

export type AvailableRoutes = RouteKeys<typeof APIRoute>;

// Fixed: Use conditional type inference instead of indexed access
export type ExtractResponseType<R extends AvailableRoutes> = R extends `${infer Cat}.${infer End}`
  ? Cat extends keyof typeof APIRoute
    ? End extends keyof (typeof APIRoute)[Cat]
      ? (typeof APIRoute)[Cat][End] extends { response: infer Res }
        ? Res
        : never
      : never
    : never
  : never;

export const api = async <R extends AvailableRoutes>(
  route: R,
  params: Record<string, any> = {},
): Promise<ExtractResponseType<R>> => {
  const [category, endpoint] = route.split('.') as [keyof typeof APIRoute, string];
  const config = APIRoute[category][endpoint as keyof (typeof APIRoute)[typeof category]];

  if (!config) {
    throw new Error(`Route ${route} not found`);
  }

  const response = await fetch(config.path, {
    method: config.method,
    body: config.method !== 'GET' ? JSON.stringify(params) : undefined,
  });
  return response.json();
};
